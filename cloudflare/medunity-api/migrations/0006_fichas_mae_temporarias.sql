-- Temporary encrypted mother fichas. Unique user/slot enforces three concurrent Free slots.
CREATE TABLE IF NOT EXISTS fichas_mae_temporarias (
  id TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 3),
  ciphertext TEXT NOT NULL,
  iv TEXT NOT NULL,
  criada_em INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  UNIQUE (usuario_id, slot)
);
CREATE INDEX IF NOT EXISTS idx_fichas_mae_usuario_expiry ON fichas_mae_temporarias (usuario_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_fichas_mae_expiry ON fichas_mae_temporarias (expires_at);
