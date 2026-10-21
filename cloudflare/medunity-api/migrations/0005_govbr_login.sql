CREATE TABLE IF NOT EXISTS govbr_auth_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_hash TEXT NOT NULL UNIQUE,
  nonce TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  return_to TEXT NOT NULL DEFAULT '/',
  expires_at INTEGER NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usado_em INTEGER
);

CREATE INDEX IF NOT EXISTS idx_govbr_auth_states_expiry
  ON govbr_auth_states(expires_at);

CREATE TABLE IF NOT EXISTS govbr_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_hash TEXT NOT NULL UNIQUE,
  usuario_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revogado_em INTEGER,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_govbr_sessions_user
  ON govbr_sessions(usuario_id);

CREATE INDEX IF NOT EXISTS idx_govbr_sessions_expiry
  ON govbr_sessions(expires_at);
