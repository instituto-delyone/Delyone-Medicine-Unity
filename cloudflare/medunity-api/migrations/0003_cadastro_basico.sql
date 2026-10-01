ALTER TABLE usuarios ADD COLUMN nome_completo TEXT;
ALTER TABLE usuarios ADD COLUMN email TEXT;

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);