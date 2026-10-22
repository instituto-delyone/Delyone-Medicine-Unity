const encoder = new TextEncoder();
const MAX_FICHAS_FREE = 3;
const MAX_PAYLOAD_BYTES = 24 * 1024;
const ALLOWED_ORIGINS = new Set(["https://medunity.delyone.com", "http://127.0.0.1:5500", "http://localhost:5500"]);

function json(data, status = 200, request) {
  const headers = {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Vary":"Origin"};
  const origin = request.headers.get("Origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(data), {status, headers});
}
function b64url(bytes) {
  let binary = ""; for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}
function fromB64url(value) {
  const normalized=value.replace(/-/g,"+").replace(/_/g,"/");
  const binary=atob(normalized+"=".repeat((4-normalized.length%4)%4));
  return Uint8Array.from(binary,c=>c.charCodeAt(0));
}
async function getUser(request, env) {
  if (!env.JWT_SECRET || !env.DB) throw new Error("server_configuration");
  const auth=request.headers.get("Authorization")||"";
  if (!auth.startsWith("Bearer ")) throw new Error("auth");
  const parts=auth.slice(7).trim().split(".");
  if (parts.length!==3) throw new Error("auth");
  const [head,body,sig]=parts;
  const decode=v=>JSON.parse(new TextDecoder().decode(fromB64url(v)));
  const header=decode(head);
  if(header.alg!=="HS256"||header.typ!=="JWT") throw new Error("auth");
  const key=await crypto.subtle.importKey("raw",encoder.encode(env.JWT_SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const expected=new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(head+"."+body)));
  const actual=fromB64url(sig);
  if(expected.length!==actual.length||expected.some((v,i)=>v!==actual[i])) throw new Error("auth");
  const payload=decode(body), now=Math.floor(Date.now()/1000);
  if(!payload.exp||payload.exp<=now) throw new Error("auth");
  const id=Number(payload.sub);
  if(!Number.isSafeInteger(id)||id<1) throw new Error("auth");
  const row=await env.DB.prepare("SELECT id, ativo FROM usuarios WHERE id=? LIMIT 1").bind(id).first();
  if(!row||Number(row.ativo)!==1) throw new Error("auth");
  return {id,sessionExpiresAt:Number(payload.exp)};
}
async function encryptPayload(payload, env) {
  if(!env.FICHA_MAE_ENCRYPTION_KEY) throw new Error("key");
  const raw=fromB64url(env.FICHA_MAE_ENCRYPTION_KEY);
  if(raw.length!==32) throw new Error("key");
  const key=await crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt"]);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,encoder.encode(JSON.stringify(payload)));
  return {iv:b64url(iv),ciphertext:b64url(ciphertext)};
}
function validPayload(value) {
  if(!value||typeof value!=="object"||Array.isArray(value)) return false;
  const allowed=new Set(["nome","data_nascimento","cpf","sexo","alergias","medicamentos","observacoes"]);
  return Object.keys(value).length>0 && Object.keys(value).every(k=>allowed.has(k)) &&
    Object.values(value).every(v=>typeof v==="string"&&v.length<=4000);
}
export async function handleFichasMae(request, env) {
  const url=new URL(request.url);
  if(!url.pathname.startsWith("/fichas-mae")) return null;
  if(request.method==="OPTIONS") return new Response(null,{status:204,headers:{"Cache-Control":"no-store","Access-Control-Allow-Methods":"GET, POST, DELETE, OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization","Vary":"Origin",...(ALLOWED_ORIGINS.has(request.headers.get("Origin")||"")?{"Access-Control-Allow-Origin":request.headers.get("Origin")}:{})}});
  try {
    const user=await getUser(request,env), now=Math.floor(Date.now()/1000);
    await env.DB.prepare("DELETE FROM fichas_mae_temporarias WHERE usuario_id=? AND expires_at<=?").bind(user.id,now).run();
    if(url.pathname==="/fichas-mae/session-end"&&request.method==="POST") {\n      await env.DB.prepare("DELETE FROM fichas_mae_temporarias WHERE usuario_id=?").bind(user.id).run();\n      return json({status:"sessao_encerrada_fichas_excluidas"},200,request);\n    }\n    if(url.pathname==="/fichas-mae"&&request.method==="GET") {
      const rows=await env.DB.prepare("SELECT id,slot,criada_em,expires_at FROM fichas_mae_temporarias WHERE usuario_id=? AND expires_at>? ORDER BY slot").bind(user.id,now).all();
      return json({status:"ok",fichas:(rows.results||[]).map(r=>({id:r.id,slot:Number(r.slot),rotulo:"Ficha "+r.slot,criada_em:Number(r.criada_em),expires_at:Number(r.expires_at)})),limite:MAX_FICHAS_FREE},200,request);
    }
    if(url.pathname==="/fichas-mae"&&request.method==="POST") {
      const raw=await request.text();
      if(encoder.encode(raw).byteLength>MAX_PAYLOAD_BYTES) return json({detail:"Ficha excede o tamanho permitido."},413,request);
      let body; try{body=JSON.parse(raw)}catch{return json({detail:"Dados da ficha inválidos."},400,request)}
      if(!validPayload(body?.dados)) return json({detail:"Dados da ficha inválidos ou campos não permitidos."},400,request);
      const expiresAt=Math.min(user.sessionExpiresAt,now+12*60*60);
      if(expiresAt<=now) return json({detail:"Sessão expirada. Entre novamente."},401,request);
      const encrypted=await encryptPayload(body.dados,env), id=crypto.randomUUID();
      for(let slot=1;slot<=MAX_FICHAS_FREE;slot++){
        try{
          await env.DB.prepare("INSERT INTO fichas_mae_temporarias (id,usuario_id,slot,ciphertext,iv,criada_em,expires_at) VALUES (?,?,?,?,?,?,?)").bind(id,user.id,slot,encrypted.ciphertext,encrypted.iv,now,expiresAt).run();
          return json({status:"salva",ficha:{id,slot,rotulo:"Ficha "+slot,expires_at:expiresAt}},201,request);
        }catch(error){
          const message=String(error?.message||"").toLowerCase();
          if(message.includes("unique")||message.includes("constraint")) continue;
          throw error;
        }
      }
      return json({detail:"Limite de três fichas simultâneas atingido."},409,request);
    }
    const match=url.pathname.match(/^\/fichas-mae\/([0-9a-f-]{36})$/i);
    if(match&&request.method==="DELETE"){
      const result=await env.DB.prepare("DELETE FROM fichas_mae_temporarias WHERE id=? AND usuario_id=? AND expires_at>?").bind(match[1],user.id,now).run();
      if(Number(result.meta?.changes||0)===0) return json({detail:"Ficha não encontrada ou expirada."},404,request);
      return json({status:"excluida"},200,request);
    }
    // No individual GET/decryption endpoint until SNCR authorization contract is validated.
    return json({detail:"Rota não encontrada."},404,request);
  }catch(error){
    if(error.message==="key") return json({detail:"Armazenamento temporário indisponível."},503,request);
    if(error.message==="auth") return json({detail:"Autenticação necessária."},401,request);
    return json({detail:"Não foi possível processar a ficha temporária."},500,request);
  }
}
