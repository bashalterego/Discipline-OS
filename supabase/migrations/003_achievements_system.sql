-- Migration: Achievement & Rewards System
-- Includes achievements table and indices

CREATE TABLE IF NOT EXISTS achievements (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    type text NOT NULL, -- e.g., 'streak_3', 'perfect_day', 'first_saving'
    title text NOT NULL,
    message text NOT NULL,
    ai_message text,
    badge_emoji text NOT NULL,
    earned_at timestamptz DEFAULT now(),
    seen boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON achievements(user_id);
CREATE INDEX IF NOT EXISTS achievements_type_idx ON achievements(type);
