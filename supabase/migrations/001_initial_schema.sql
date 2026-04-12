-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE users (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               text UNIQUE NOT NULL,
  full_name           text,
  avatar_url          text,
  identity_statement  text,
  archetype           text CHECK (archetype IN ('athlete','scholar','monk','warrior')),
  difficulty_tier     text DEFAULT 'beginner' CHECK (difficulty_tier IN ('beginner','intermediate','elite')),
  strict_mode         boolean DEFAULT false,
  recovery_mode       boolean DEFAULT false,
  timezone            text DEFAULT 'Asia/Kolkata',
  onboarding_done     boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- TASKS
CREATE TABLE tasks (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid REFERENCES users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  type          text CHECK (type IN ('boolean','quantitative','duration','scale_0_3')),
  target_value  numeric,
  target_unit   text,
  points        numeric NOT NULL,
  is_core       boolean DEFAULT true,
  is_active     boolean DEFAULT true,
  sort_order    integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- DAILY LOGS
CREATE TABLE daily_logs (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  log_date        date NOT NULL,
  score           numeric DEFAULT 0,
  tasks_done      integer DEFAULT 0,
  tasks_total     integer DEFAULT 0,
  efficiency_pct  numeric DEFAULT 0,
  mood            integer CHECK (mood BETWEEN 1 AND 5),
  energy          integer CHECK (energy BETWEEN 1 AND 5),
  reflection      text,
  ai_reflection   text,
  is_rest_day     boolean DEFAULT false,
  log_closed      boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- TASK COMPLETIONS
CREATE TABLE task_completions (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               uuid REFERENCES users(id) ON DELETE CASCADE,
  task_id               uuid REFERENCES tasks(id) ON DELETE CASCADE,
  log_date              date NOT NULL,
  completed             boolean DEFAULT false,
  value_logged          numeric,
  self_control_score    integer CHECK (self_control_score BETWEEN 0 AND 3),
  failure_reason        text,
  created_at            timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id, log_date)
);

-- FINANCE LOGS
CREATE TABLE finance_logs (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  log_date        date NOT NULL,
  cash_in_hand    numeric DEFAULT 0,
  earning         numeric DEFAULT 0,
  expenditure     numeric DEFAULT 0,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- STREAKS
CREATE TABLE streaks (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak      integer DEFAULT 0,
  longest_streak      integer DEFAULT 0,
  last_active_date    date,
  streak_broken_at    date,
  created_at          timestamptz DEFAULT now()
);

-- COMMITMENTS
CREATE TABLE commitments (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  title           text NOT NULL,
  duration_days   integer CHECK (duration_days IN (30,60,90)),
  start_date      date,
  end_date        date,
  is_public       boolean DEFAULT false,
  status          text DEFAULT 'active' CHECK (status IN ('active','completed','broken')),
  created_at      timestamptz DEFAULT now()
);

-- ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES (users can only access their own data)
DROP POLICY IF EXISTS "Users own data" ON users;
CREATE POLICY "Users can select own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users own tasks" ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own logs" ON daily_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own completions" ON task_completions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own finance" ON finance_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own streaks" ON streaks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own commitments" ON commitments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
