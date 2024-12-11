-- Add created_at and last_unblocked_at columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_unblocked_at TIMESTAMP WITH TIME ZONE;
