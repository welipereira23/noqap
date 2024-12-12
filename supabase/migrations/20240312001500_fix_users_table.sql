-- Add missing columns to users table if they don't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS last_unblocked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_is_blocked_idx ON public.users(is_blocked);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users(created_at);
CREATE INDEX IF NOT EXISTS users_updated_at_idx ON public.users(updated_at);

-- Update policies
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

-- Trigger for updated_at if it doesn't exist
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
