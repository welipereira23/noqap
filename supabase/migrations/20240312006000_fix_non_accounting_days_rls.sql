-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own non accounting days" ON public.non_accounting_days;
DROP POLICY IF EXISTS "Users can insert own non accounting days" ON public.non_accounting_days;
DROP POLICY IF EXISTS "Users can update own non accounting days" ON public.non_accounting_days;
DROP POLICY IF EXISTS "Users can delete own non accounting days" ON public.non_accounting_days;

-- Recreate non_accounting_days policies with simpler rules
CREATE POLICY "Users can view own non accounting days" 
  ON public.non_accounting_days FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own non accounting days" 
  ON public.non_accounting_days FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update own non accounting days" 
  ON public.non_accounting_days FOR UPDATE 
  USING (true);

CREATE POLICY "Users can delete own non accounting days" 
  ON public.non_accounting_days FOR DELETE 
  USING (true);

-- Ensure RLS is enabled but with permissive policies
ALTER TABLE public.non_accounting_days ENABLE ROW LEVEL SECURITY;
