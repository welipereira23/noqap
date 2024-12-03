-- Remover política antiga
DROP POLICY IF EXISTS "Permitir inserção durante registro" ON public.users;

-- Criar nova política mais permissiva para inserção
CREATE POLICY "Permitir inserção durante registro" ON public.users
    FOR INSERT
    WITH CHECK (true);  -- Permite qualquer inserção durante o registro

-- Garantir que a tabela tenha RLS habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Garantir permissões
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;  -- Importante para o registro inicial
GRANT ALL ON public.users TO service_role;
