CREATE TABLE IF NOT EXISTS prescritores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL UNIQUE,
  nome_completo TEXT NOT NULL,
  cpf TEXT,
  conselho_tipo TEXT NOT NULL DEFAULT 'CRM',
  conselho_numero TEXT NOT NULL,
  conselho_uf TEXT NOT NULL,
  especialidade TEXT,
  email TEXT,
  telefone TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_prescritores_usuario_id ON prescritores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_prescritores_conselho ON prescritores(conselho_tipo, conselho_numero, conselho_uf);