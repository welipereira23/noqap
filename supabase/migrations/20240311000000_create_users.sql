-- Drop existing table if exists
DROP TABLE IF EXISTS public.users;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    google_id TEXT UNIQUE,
    is_blocked BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT TO authenticated
    USING (email = auth.jwt()->>'email');

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE TO authenticated
    USING (email = auth.jwt()->>'email')
    WITH CHECK (email = auth.jwt()->>'email');

CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();
