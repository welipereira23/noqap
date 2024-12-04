-- Criar a tabela users se ela não existir
CREATE TABLE IF NOT EXISTS public.users (
    id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
    email text,
    name text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (caso existam)
DROP POLICY IF EXISTS "Usuários podem ler seus próprios dados" ON public.users;
DROP POLICY IF EXISTS "Permitir inserção durante registro" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.users;

-- Criar novas políticas
CREATE POLICY "Usuários podem ler seus próprios dados" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Permitir inserção durante registro" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Garantir que o schema public seja acessível
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Garantir permissões na tabela users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
