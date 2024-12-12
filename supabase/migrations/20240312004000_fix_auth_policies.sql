-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can insert own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can update own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can delete own shifts" ON public.shifts;

DROP POLICY IF EXISTS "Users can view own non accounting days" ON public.non_accounting_days;
DROP POLICY IF EXISTS "Users can insert own non accounting days" ON public.non_accounting_days;
DROP POLICY IF EXISTS "Users can update own non accounting days" ON public.non_accounting_days;
DROP POLICY IF EXISTS "Users can delete own non accounting days" ON public.non_accounting_days;

-- Recreate shifts policies
CREATE POLICY "Users can view own shifts" 
  ON public.shifts FOR SELECT 
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can insert own shifts" 
  ON public.shifts FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can update own shifts" 
  ON public.shifts FOR UPDATE 
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can delete own shifts" 
  ON public.shifts FOR DELETE 
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Recreate non_accounting_days policies
CREATE POLICY "Users can view own non accounting days" 
  ON public.non_accounting_days FOR SELECT 
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can insert own non accounting days" 
  ON public.non_accounting_days FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can update own non accounting days" 
  ON public.non_accounting_days FOR UPDATE 
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can delete own non accounting days" 
  ON public.non_accounting_days FOR DELETE 
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_accounting_days ENABLE ROW LEVEL SECURITY;
