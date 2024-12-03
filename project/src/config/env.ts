import { cleanEnv, str } from 'envalid';

export const env = cleanEnv(import.meta.env, {
  VITE_STRIPE_PUBLISHABLE_KEY: str(),
  VITE_SUPABASE_URL: str(),
  VITE_SUPABASE_ANON_KEY: str(),
});