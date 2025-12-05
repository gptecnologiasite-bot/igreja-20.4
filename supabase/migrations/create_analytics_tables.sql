-- Analytics Tables for Supabase
-- Execute this SQL in your Supabase SQL Editor

-- Table: activity_logs
-- Stores all activity events (logins, logouts, page views)
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('login', 'logout', 'pageview')),
  user_name TEXT,
  user_email TEXT NOT NULL,
  user_type TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  district TEXT,
  browser TEXT,
  platform TEXT,
  language TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_email ON activity_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_session_id ON activity_logs(session_id);

-- Table: active_sessions
-- Stores currently active user sessions
CREATE TABLE IF NOT EXISTS active_sessions (
  session_id TEXT PRIMARY KEY,
  user_name TEXT,
  user_email TEXT NOT NULL,
  user_type TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  district TEXT,
  browser TEXT,
  platform TEXT,
  language TEXT,
  login_time TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active sessions
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_activity ON active_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_email ON active_sessions(user_email);

-- Enable Row Level Security (RLS)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to read and write
CREATE POLICY "Allow authenticated users to read activity_logs" 
  ON activity_logs FOR SELECT 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to insert activity_logs" 
  ON activity_logs FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to read active_sessions" 
  ON active_sessions FOR SELECT 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to insert active_sessions" 
  ON active_sessions FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to update active_sessions" 
  ON active_sessions FOR UPDATE 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to delete active_sessions" 
  ON active_sessions FOR DELETE 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on active_sessions
CREATE TRIGGER update_active_sessions_updated_at 
  BEFORE UPDATE ON active_sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Analytics tables created successfully!';
  RAISE NOTICE '📊 Tables: activity_logs, active_sessions';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '📈 Indexes created for optimal performance';
END $$;
