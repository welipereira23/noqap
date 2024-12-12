-- Drop existing table if exists
DROP TABLE IF EXISTS public.users;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT,
    google_id TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'user',
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create extension for password hashing if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to hash password
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify password
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
CREATE POLICY "Enable read access for all users" ON public.users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;
CREATE POLICY "Enable insert for service role" ON public.users
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for service role" ON public.users;
CREATE POLICY "Enable update for service role" ON public.users
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.users;
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
