-- Migration: 004_weekly_reviews.sql
-- Create table for weekly AI-synthesized reviews

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  avg_score DECIMAL(4,2) NOT NULL,
  total_tasks_completed INTEGER NOT NULL,
  finance_surplus DECIMAL(12,2) NOT NULL,
  ai_verdict TEXT,
  ai_directive TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, start_date)
);

-- RLS Policies
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weekly reviews"
  ON weekly_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly reviews"
  ON weekly_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);
