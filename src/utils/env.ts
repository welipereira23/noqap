const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_API_URL'
];

export function checkEnvVars() {
  const missingVars = requiredEnvVars.filter(
    (envVar) => !import.meta.env[envVar]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  // Validate API URL format
  const apiUrl = import.meta.env.VITE_API_URL;
  try {
    new URL(apiUrl);
  } catch (error) {
    throw new Error(`Invalid VITE_API_URL format: ${apiUrl}`);
  }

  console.log('Environment variables validated successfully');
  return true;
}
