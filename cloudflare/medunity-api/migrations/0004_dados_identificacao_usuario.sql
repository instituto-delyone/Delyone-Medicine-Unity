ALTER TABLE usuarios ADD COLUMN cpf TEXT;
ALTER TABLE usuarios ADD COLUMN telefone TEXT;

CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);