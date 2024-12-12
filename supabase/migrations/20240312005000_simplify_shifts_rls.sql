-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can insert own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can update own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can delete own shifts" ON public.shifts;

-- Recreate shifts policies with simpler rules
CREATE POLICY "Users can view own shifts" 
  ON public.shifts FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own shifts" 
  ON public.shifts FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update own shifts" 
  ON public.shifts FOR UPDATE 
  USING (true);

CREATE POLICY "Users can delete own shifts" 
  ON public.shifts FOR DELETE 
  USING (true);

-- Ensure RLS is enabled but with permissive policies
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
