-- Notification preferences and rate limiting fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emails_sent_today integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_email_date date;
