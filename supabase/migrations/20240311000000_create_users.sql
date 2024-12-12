-- Drop existing table if exists
DROP TABLE IF EXISTS public.users;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    google_id TEXT UNIQUE,
    is_blocked BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_auth_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

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

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
