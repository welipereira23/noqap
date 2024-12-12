-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    google_id TEXT UNIQUE,
    is_blocked BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add new columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'users' 
                  AND column_name = 'google_id') THEN
        ALTER TABLE public.users ADD COLUMN google_id TEXT UNIQUE;
    END IF;
END $$;

-- Enable RLS if not enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Allow insert from trigger" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Enable update for users based on id"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id OR auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.uid() = id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Enable insert for service role"
    ON public.users
    FOR INSERT
    WITH CHECK (true);

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
