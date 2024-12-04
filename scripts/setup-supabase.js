import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jumgqbwxvwdmyplzbkay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1bWdxYnd4dndkbXlwbHpia2F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE0OTYxNiwiZXhwIjoyMDQ4NzI1NjE2fQ.kQCkHbZ19Jg7uLvNX9iEF-7Kkf_D2CcYHOL9h9tj-B8';

const supabase = createClient(supabaseUrl, supabaseKey);

const setup = async () => {
  try {
    // Criar tabela users
    const { error: usersError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.users (
          id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
          email text,
          name text,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Habilitar RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        -- Criar políticas para users
        DROP POLICY IF EXISTS "Usuários podem ler seus próprios dados" ON public.users;
        DROP POLICY IF EXISTS "Permitir inserção durante registro" ON public.users;
        DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.users;

        CREATE POLICY "Usuários podem ler seus próprios dados" ON public.users
          FOR SELECT USING (auth.uid() = id);

        CREATE POLICY "Permitir inserção durante registro" ON public.users
          FOR INSERT WITH CHECK (auth.uid() = id);

        CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.users
          FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

        -- Criar tabela shifts
        CREATE TABLE IF NOT EXISTS public.shifts (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id uuid REFERENCES public.users(id) NOT NULL,
          start_time timestamp with time zone NOT NULL,
          end_time timestamp with time zone NOT NULL,
          description text,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Habilitar RLS para shifts
        ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

        -- Criar políticas para shifts
        DROP POLICY IF EXISTS "Usuários podem ler seus próprios registros" ON public.shifts;
        DROP POLICY IF EXISTS "Usuários podem criar seus próprios registros" ON public.shifts;
        DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios registros" ON public.shifts;
        DROP POLICY IF EXISTS "Usuários podem deletar seus próprios registros" ON public.shifts;

        CREATE POLICY "Usuários podem ler seus próprios registros" ON public.shifts
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Usuários podem criar seus próprios registros" ON public.shifts
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Usuários podem atualizar seus próprios registros" ON public.shifts
          FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Usuários podem deletar seus próprios registros" ON public.shifts
          FOR DELETE USING (auth.uid() = user_id);

        -- Criar tabela non_accounting_days
        CREATE TABLE IF NOT EXISTS public.non_accounting_days (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id uuid REFERENCES public.users(id) NOT NULL,
          date date NOT NULL,
          type text NOT NULL,
          reason text,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Habilitar RLS para non_accounting_days
        ALTER TABLE public.non_accounting_days ENABLE ROW LEVEL SECURITY;

        -- Criar políticas para non_accounting_days
        DROP POLICY IF EXISTS "Usuários podem ler seus próprios dias não contabilizados" ON public.non_accounting_days;
        DROP POLICY IF EXISTS "Usuários podem criar seus próprios dias não contabilizados" ON public.non_accounting_days;
        DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dias não contabilizados" ON public.non_accounting_days;
        DROP POLICY IF EXISTS "Usuários podem deletar seus próprios dias não contabilizados" ON public.non_accounting_days;

        CREATE POLICY "Usuários podem ler seus próprios dias não contabilizados" ON public.non_accounting_days
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Usuários podem criar seus próprios dias não contabilizados" ON public.non_accounting_days
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Usuários podem atualizar seus próprios dias não contabilizados" ON public.non_accounting_days
          FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Usuários podem deletar seus próprios dias não contabilizados" ON public.non_accounting_days
          FOR DELETE USING (auth.uid() = user_id);

        -- Criar tabela subscriptions
        CREATE TABLE IF NOT EXISTS public.subscriptions (
          id text PRIMARY KEY,
          user_id uuid REFERENCES public.users(id) NOT NULL,
          status text NOT NULL,
          price_id text NOT NULL,
          current_period_start timestamp with time zone NOT NULL,
          current_period_end timestamp with time zone NOT NULL,
          trial_start timestamp with time zone,
          trial_end timestamp with time zone,
          cancel_at timestamp with time zone,
          cancel_at_period_end boolean DEFAULT false,
          canceled_at timestamp with time zone,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Habilitar RLS para subscriptions
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

        -- Criar políticas para subscriptions
        DROP POLICY IF EXISTS "Usuários podem ler suas próprias assinaturas" ON public.subscriptions;
        DROP POLICY IF EXISTS "Usuários podem criar suas próprias assinaturas" ON public.subscriptions;
        DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias assinaturas" ON public.subscriptions;

        CREATE POLICY "Usuários podem ler suas próprias assinaturas" ON public.subscriptions
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Usuários podem criar suas próprias assinaturas" ON public.subscriptions
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Usuários podem atualizar suas próprias assinaturas" ON public.subscriptions
          FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

        -- Criar tabela customers
        CREATE TABLE IF NOT EXISTS public.customers (
          id text PRIMARY KEY,
          user_id uuid REFERENCES public.users(id) NOT NULL,
          email text NOT NULL,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Habilitar RLS para customers
        ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

        -- Criar políticas para customers
        DROP POLICY IF EXISTS "Usuários podem ler seus próprios dados de cliente" ON public.customers;
        DROP POLICY IF EXISTS "Usuários podem criar seus próprios dados de cliente" ON public.customers;
        DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados de cliente" ON public.customers;

        CREATE POLICY "Usuários podem ler seus próprios dados de cliente" ON public.customers
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Usuários podem criar seus próprios dados de cliente" ON public.customers
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Usuários podem atualizar seus próprios dados de cliente" ON public.customers
          FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

        -- Garantir permissões
        GRANT USAGE ON SCHEMA public TO authenticated;
        GRANT USAGE ON SCHEMA public TO service_role;

        GRANT ALL ON public.users TO authenticated;
        GRANT ALL ON public.users TO service_role;
        GRANT ALL ON public.shifts TO authenticated;
        GRANT ALL ON public.shifts TO service_role;
        GRANT ALL ON public.non_accounting_days TO authenticated;
        GRANT ALL ON public.non_accounting_days TO service_role;
        GRANT ALL ON public.subscriptions TO authenticated;
        GRANT ALL ON public.subscriptions TO service_role;
        GRANT ALL ON public.customers TO authenticated;
        GRANT ALL ON public.customers TO service_role;
      `
    });

    if (usersError) {
      throw usersError;
    }

    console.log('Banco de dados configurado com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar o banco de dados:', error);
  }
};

setup();
