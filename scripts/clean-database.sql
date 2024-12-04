-- Remove todas as tabelas existentes
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Habilita a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mensagem de confirmação
DO $$ 
BEGIN
    RAISE NOTICE 'Database cleaned successfully!';
END $$;