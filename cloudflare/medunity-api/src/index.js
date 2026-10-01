import { pbkdf2 } from "node:crypto";

const encoder = new TextEncoder();

const JWT_TTL_SECONDS = 30 * 60;
const PBKDF2_ITERATIONS = 100000;
const ALLOWED_ORIGINS = new Set([
  "https://medunity.delyone.com",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Bootstrap-Secret",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function json(data, status = 200, request) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...corsHeaders(request),
  };

  return new Response(JSON.stringify(data), { status, headers });
}

function empty(status, request) {
  return new Response(null, {
    status,
    headers: corsHeaders(request),
  });
}

function base64url(bytes) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64urlText(text) {
  return base64url(encoder.encode(text));
}

function fromBase64url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function constantTimeBytesEqual(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }

  return diff === 0;
}

function constantTimeEqual(a, b) {
  return constantTimeBytesEqual(encoder.encode(a), encoder.encode(b));
}

async function createPasswordRecord(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await new Promise((resolve, reject) => {
    pbkdf2(
      encoder.encode(password),
      salt,
      PBKDF2_ITERATIONS,
      32,
      "sha256",
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(new Uint8Array(derivedKey));
      },
    );
  });

  return `pbkdf2$sha256${PBKDF2_ITERATIONS}${base64url(salt)}${base64url(derived)}`;
}

async function verifyPassword(password, record) {
  const parts = record.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") {
    return false;
  }

  const iterations = Number(parts[2]);
  if (!Number.isInteger(iterations) || iterations < 10000 || iterations > 100000) {
    return false;
  }

  const salt = fromBase64url(parts[3]);
  const expected = fromBase64url(parts[4]);

  const actual = await new Promise((resolve, reject) => {
    pbkdf2(
      encoder.encode(password),
      salt,
      iterations,
      32,
      "sha256",
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(new Uint8Array(derivedKey));
      },
    );
  });

  return constantTimeBytesEqual(actual, expected);
}


async function hmacSha256(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

  return crypto.subtle.sign("HMAC", key, encoder.encode(value));
}

async function signJwt(payload, secret) {
  const header = base64urlText(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64urlText(JSON.stringify(payload));
  const signingInput = header + "." + body;
  const signature = await hmacSha256(secret, signingInput);
  return signingInput + "." + base64url(signature);
}

async function verifyJwt(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("invalid_token");
  }

  const [header, payloadPart, signaturePart] = parts;
  const headerData = JSON.parse(new TextDecoder().decode(fromBase64url(header)));
  if (headerData.alg !== "HS256" || headerData.typ !== "JWT") {
    throw new Error("invalid_token");
  }

  const expected = await hmacSha256(secret, header + "." + payloadPart);
  const actual = fromBase64url(signaturePart);

  if (expected.byteLength !== actual.byteLength) {
    throw new Error("invalid_token");
  }

  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected[i] ^ actual[i];
  }

  if (diff !== 0) {
    throw new Error("invalid_token");
  }

  const payload = JSON.parse(
    new TextDecoder().decode(fromBase64url(payloadPart)),
  );

  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("expired_token");
  }

  return payload;
}

function extractBearer(request) {
  const value = request.headers.get("Authorization") || "";
  if (!value.startsWith("Bearer ")) {
    return null;
  }
  return value.slice(7).trim() || null;
}

async function getAuthenticatedUser(request, env) {
  if (!env.JWT_SECRET) {
    throw new Error("server_configuration");
  }

  const token = extractBearer(request);
  if (!token) {
    throw new Error("missing_token");
  }

  const payload = await verifyJwt(token, env.JWT_SECRET);
  const userId = Number(payload.sub);

  if (!Number.isInteger(userId)) {
    throw new Error("invalid_token");
  }

  const row = await env.DB
    .prepare(
      "SELECT id, nome_usuario, perfil, ativo FROM usuarios WHERE id = ? LIMIT 1",
    )
    .bind(userId)
    .first();

  if (!row || Number(row.ativo) !== 1) {
    throw new Error("user_inactive");
  }

  return {
    id: Number(row.id),
    nome_usuario: row.nome_usuario,
    perfil: row.perfil,
  };
}

async function handleRegister(request, env) {
  if (!env.DB) {
    return json({ detail: "API não configurada." }, 503, request);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return json({ detail: "Dados de cadastro inválidos." }, 400, request);
  }

  const nomeUsuario = typeof body.nome_usuario === "string" ? body.nome_usuario.trim() : "";
  const senha = typeof body.senha === "string" ? body.senha : "";
  const nomeCompleto = typeof body.nome_completo === "string" ? body.nome_completo.trim() : "";
  const cpf = typeof body.cpf === "string" ? body.cpf.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const telefone = typeof body.telefone === "string" ? body.telefone.trim() : "";
  const cpfDigits = cpf.replace(/\D/g, "");

  if (!nomeUsuario || !senha || !nomeCompleto || !cpf || !email || !telefone) {
    return json({ detail: "Nome completo, CPF, e-mail, telefone, usuário e senha são obrigatórios." }, 400, request);
  }

  if (!/^[A-Za-z0-9._-]{4,40}$/.test(nomeUsuario)) {
    return json({ detail: "O usuário deve ter 4 a 40 caracteres e usar apenas letras, números, ponto, hífen ou sublinhado." }, 400, request);
  }

  if (senha.length < 8 || senha.length > 128) {
    return json({ detail: "A senha deve ter entre 8 e 128 caracteres." }, 400, request);
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ detail: "Informe um e-mail válido." }, 400, request);
  }

  const existing = await env.DB
    .prepare("SELECT id FROM usuarios WHERE nome_usuario = ? OR cpf = ? OR email = ? LIMIT 1")
    .bind(nomeUsuario, cpfDigits, email)
    .first();

  if (existing) {
    return json({ detail: "Usuário, CPF ou e-mail já cadastrado." }, 409, request);
  }

  const senhaHash = await createPasswordRecord(senha);

  try {
    const result = await env.DB
      .prepare(
        `INSERT INTO usuarios
          (nome_usuario, senha_hash, perfil, ativo, nome_completo, cpf, email, telefone)
         VALUES (?, ?, 'usuario', 1, ?, ?, ?, ?)`,
      )
      .bind(nomeUsuario, senhaHash, nomeCompleto, cpfDigits, email, telefone)
      .run();

    return json(
      {
        status: "cadastrado",
        usuario: {
          id: Number(result.meta?.last_row_id),
          nome_usuario: nomeUsuario,
          nome_completo: nomeCompleto,
          cpf: cpfDigits,
          email,
          telefone,
          perfil: "usuario",
        },
      },
      201,
      request,
    );
  } catch (error) {
    if (String(error.message || "").toLowerCase().includes("unique")) {
      return json({ detail: "Esse usuário já está cadastrado." }, 409, request);
    }
    throw error;
  }
}

async function handleLogin(request, env, adminOnly = false) {
  if (!env.DB || !env.JWT_SECRET) {
    return json({ detail: "API não configurada." }, 503, request);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.nome_usuario !== "string" || typeof body.senha !== "string") {
    return json({ detail: "Informe nome_usuario e senha." }, 400, request);
  }

  const username = body.nome_usuario.trim();

  const row = await env.DB
    .prepare(
      "SELECT id, nome_usuario, senha_hash, perfil, ativo FROM usuarios WHERE nome_usuario = ? LIMIT 1",
    )
    .bind(username)
    .first();

  const valid = row && Number(row.ativo) === 1
    ? await verifyPassword(body.senha, row.senha_hash)
    : false;

  if (valid && adminOnly && row.perfil !== "admin") {
    return json({ detail: "Esta conta não possui acesso administrativo." }, 403, request);
  }

  if (!valid) {
    return json({ detail: "Usuário ou senha inválidos." }, 401, request);
  }

  const now = Math.floor(Date.now() / 1000);
  const token = await signJwt(
    {
      sub: String(row.id),
      nome_usuario: row.nome_usuario,
      perfil: row.perfil,
      iat: now,
      exp: now + JWT_TTL_SECONDS,
    },
    env.JWT_SECRET,
  );

  return json(
    {
      status: "autenticado",
      access_token: token,
      token_type: "bearer",
      expires_in: JWT_TTL_SECONDS,
      usuario: {
        id: Number(row.id),
        nome_usuario: row.nome_usuario,
        perfil: row.perfil,
      },
    },
    200,
    request,
  );
}

async function handlePrescritorGet(request, env) {
  try {
    const usuario = await getAuthenticatedUser(request, env);
    const row = await env.DB
      .prepare(
        `SELECT id, nome_completo, cpf, conselho_tipo, conselho_numero, conselho_uf,
                especialidade, email, telefone, ativo, criado_em, atualizado_em
         FROM prescritores
         WHERE usuario_id = ?
         LIMIT 1`,
      )
      .bind(usuario.id)
      .first();

    return json(
      {
        status: "ok",
        prescritor: row
          ? {
              id: Number(row.id),
              nome_completo: row.nome_completo,
              cpf: row.cpf || "",
              conselho_tipo: row.conselho_tipo,
              conselho_numero: row.conselho_numero,
              conselho_uf: row.conselho_uf,
              especialidade: row.especialidade || "",
              email: row.email || "",
              telefone: row.telefone || "",
              ativo: Number(row.ativo) === 1,
              criado_em: row.criado_em,
              atualizado_em: row.atualizado_em,
            }
          : null,
      },
      200,
      request,
    );
  } catch (error) {
    if (["missing_token", "invalid_token", "expired_token", "user_inactive"].includes(error.message)) {
      return json(
        { detail: error.message === "expired_token" ? "Token expirado." : "Autenticação necessária." },
        401,
        request,
      );
    }
    throw error;
  }
}

async function handlePrescritorPut(request, env) {
  try {
    const usuario = await getAuthenticatedUser(request, env);
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return json({ detail: "Dados do prescritor inválidos." }, 400, request);
    }

    const nomeCompleto = typeof body.nome_completo === "string" ? body.nome_completo.trim() : "";
    const cpf = typeof body.cpf === "string" ? body.cpf.trim() : "";
    const conselhoTipo = typeof body.conselho_tipo === "string" ? body.conselho_tipo.trim().toUpperCase() : "CRM";
    const conselhoNumero = typeof body.conselho_numero === "string" ? body.conselho_numero.trim() : "";
    const conselhoUf = typeof body.conselho_uf === "string" ? body.conselho_uf.trim().toUpperCase() : "";
    const especialidade = typeof body.especialidade === "string" ? body.especialidade.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const telefone = typeof body.telefone === "string" ? body.telefone.trim() : "";

    if (!nomeCompleto || !conselhoNumero || !conselhoUf) {
      return json(
        { detail: "Nome completo, registro profissional e UF são obrigatórios." },
        400,
        request,
      );
    }

    if (conselhoTipo !== "CRM") {
      return json({ detail: "Nesta primeira versão, o módulo está configurado para CRM." }, 400, request);
    }

    if (!/^[A-Z]{2}$/.test(conselhoUf)) {
      return json({ detail: "Informe a UF do conselho com duas letras." }, 400, request);
    }

    await env.DB
      .prepare(
        `INSERT INTO prescritores
          (usuario_id, nome_completo, cpf, conselho_tipo, conselho_numero, conselho_uf,
           especialidade, email, telefone, ativo, atualizado_em)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
         ON CONFLICT(usuario_id) DO UPDATE SET
           nome_completo = excluded.nome_completo,
           cpf = excluded.cpf,
           conselho_tipo = excluded.conselho_tipo,
           conselho_numero = excluded.conselho_numero,
           conselho_uf = excluded.conselho_uf,
           especialidade = excluded.especialidade,
           email = excluded.email,
           telefone = excluded.telefone,
           ativo = 1,
           atualizado_em = CURRENT_TIMESTAMP`,
      )
      .bind(
        usuario.id,
        nomeCompleto,
        cpf,
        conselhoTipo,
        conselhoNumero,
        conselhoUf,
        especialidade,
        email,
        telefone,
      )
      .run();

    const row = await env.DB
      .prepare(
        `SELECT id, nome_completo, cpf, conselho_tipo, conselho_numero, conselho_uf,
                especialidade, email, telefone, ativo, criado_em, atualizado_em
         FROM prescritores
         WHERE usuario_id = ?
         LIMIT 1`,
      )
      .bind(usuario.id)
      .first();

    return json(
      {
        status: "salvo",
        prescritor: {
          id: Number(row.id),
          nome_completo: row.nome_completo,
          cpf: row.cpf || "",
          conselho_tipo: row.conselho_tipo,
          conselho_numero: row.conselho_numero,
          conselho_uf: row.conselho_uf,
          especialidade: row.especialidade || "",
          email: row.email || "",
          telefone: row.telefone || "",
          ativo: Number(row.ativo) === 1,
          criado_em: row.criado_em,
          atualizado_em: row.atualizado_em,
        },
      },
      200,
      request,
    );
  } catch (error) {
    if (["missing_token", "invalid_token", "expired_token", "user_inactive"].includes(error.message)) {
      return json(
        { detail: error.message === "expired_token" ? "Token expirado." : "Autenticação necessária." },
        401,
        request,
      );
    }
    throw error;
  }
}

async function handleMe(request, env) {
  try {
    const usuario = await getAuthenticatedUser(request, env);
    return json({ status: "autenticado", usuario }, 200, request);
  } catch (error) {
    if (error.message === "missing_token") {
      return json(
        { detail: "Autenticação necessária." },
        401,
        request,
      );
    }

    if (error.message === "expired_token") {
      return json({ detail: "Token expirado." }, 401, request);
    }

    if (error.message === "user_inactive") {
      return json({ detail: "Usuário inativo." }, 401, request);
    }

    return json({ detail: "Token inválido." }, 401, request);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return empty(204, request);
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/health" && request.method === "GET") {
        if (!env.DB) {
          return json(
            { status: "degraded", api: "online", database: "not_bound" },
            503,
            request,
          );
        }

        const result = await env.DB.prepare("SELECT 1 AS ok").first();
        return json(
          {
            status: "ok",
            api: "online",
            database: result?.ok === 1 ? "connected" : "error",
          },
          200,
          request,
        );
      }

      if (url.pathname === "/cadastro" && request.method === "POST") {
        return handleRegister(request, env);
      }

      if (url.pathname === "/login" && request.method === "POST") {
        return handleLogin(request, env);
      }

      if (url.pathname === "/admin/login" && request.method === "POST") {
        return handleLogin(request, env, true);
      }

      if (url.pathname === "/me" && request.method === "GET") {
        return handleMe(request, env);
      }
      
      if (url.pathname === "/prescritor" && request.method === "GET") {
        return handlePrescritorGet(request, env);
      }

      if (url.pathname === "/prescritor" && request.method === "PUT") {
        return handlePrescritorPut(request, env);
      }


      return json({ detail: "Rota não encontrada." }, 404, request);
    } catch (error) {
      console.error("MedUnity API error", error);
      return json(
        { detail: "Erro interno da API." },
        500,
        request,
      );
    }
  },
};