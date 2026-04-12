-- Migration: Onboarding Redesign
-- Adds support for dashboard tour and task time preferences

ALTER TABLE users ADD COLUMN dashboard_tour_done boolean DEFAULT false;

-- Add preferred_time to tasks
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_time') THEN
        CREATE TYPE task_time AS ENUM ('morning', 'afternoon', 'evening');
    END IF;
END $$;

ALTER TABLE tasks ADD COLUMN preferred_time task_time;
