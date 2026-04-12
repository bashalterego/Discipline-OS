import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'weekly_reviews' AND policyname = 'Users can view their own weekly reviews'
  ) THEN
    CREATE POLICY "Users can view their own weekly reviews"
      ON weekly_reviews FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'weekly_reviews' AND policyname = 'Users can insert their own weekly reviews'
  ) THEN
    CREATE POLICY "Users can insert their own weekly reviews"
      ON weekly_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'weekly_reviews' AND policyname = 'Users can update their own weekly reviews'
  ) THEN
    CREATE POLICY "Users can update their own weekly reviews"
      ON weekly_reviews FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
`;

export async function POST() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ sql: MIGRATION_SQL }),
        });

        if (!res.ok) {
            // Try via pg REST API
            const pgRes = await fetch(`${SUPABASE_URL}/pg/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({ query: MIGRATION_SQL }),
            });

            if (!pgRes.ok) {
                const text = await pgRes.text();
                return NextResponse.json({
                    error: 'Migration failed. Please run the SQL manually in your Supabase SQL editor.',
                    sql: MIGRATION_SQL.trim(),
                    details: text
                }, { status: 500 });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'weekly_reviews table created successfully. You can now generate reviews.'
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            sql: MIGRATION_SQL.trim(),
            hint: 'Run the SQL manually in your Supabase SQL editor: https://supabase.com/dashboard'
        }, { status: 500 });
    }
}
