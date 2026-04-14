-- Add streak freeze support to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS freeze_tokens INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_freeze_date DATE;

-- Update RLS to ensure users can see/update their own freeze data (already covered by "Users own data" policy in most cases, but good to be explicit if needed)
-- Given the existing policy: CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
-- This is sufficient.
