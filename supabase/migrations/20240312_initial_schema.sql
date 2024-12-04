-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
    email text,
    name text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for shifts
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Create policies for shifts
CREATE POLICY "Usuários podem ler seus próprios registros" ON public.shifts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios registros" ON public.shifts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros" ON public.shifts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros" ON public.shifts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create non_accounting_days table
CREATE TABLE IF NOT EXISTS public.non_accounting_days (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) NOT NULL,
    date date NOT NULL,
    type text NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for non_accounting_days
ALTER TABLE public.non_accounting_days ENABLE ROW LEVEL SECURITY;

-- Create policies for non_accounting_days
CREATE POLICY "Usuários podem ler seus próprios dias não contabilizados" ON public.non_accounting_days
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios dias não contabilizados" ON public.non_accounting_days
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dias não contabilizados" ON public.non_accounting_days
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios dias não contabilizados" ON public.non_accounting_days
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create subscriptions table
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

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Usuários podem ler suas próprias assinaturas" ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias assinaturas" ON public.subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias assinaturas" ON public.subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id text PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Usuários podem ler seus próprios dados de cliente" ON public.customers
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios dados de cliente" ON public.customers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dados de cliente" ON public.customers
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
