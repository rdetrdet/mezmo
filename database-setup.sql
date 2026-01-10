-- Create syslog_messages table
CREATE TABLE IF NOT EXISTS syslog_messages (
  id BIGSERIAL PRIMARY KEY,
  priority INTEGER,
  facility INTEGER,
  severity INTEGER,
  version TEXT,
  timestamp TEXT,
  hostname TEXT,
  appName TEXT,
  procId TEXT,
  msgId TEXT,
  structuredData TEXT,
  message TEXT,
  rawMessage TEXT,
  source_ip TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_received_at ON syslog_messages(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_hostname ON syslog_messages(hostname);
CREATE INDEX IF NOT EXISTS idx_appname ON syslog_messages(appName);
CREATE INDEX IF NOT EXISTS idx_severity ON syslog_messages(severity);
CREATE INDEX IF NOT EXISTS idx_message_search ON syslog_messages USING gin(to_tsvector('english', message));

-- Enable Row Level Security (optional)
ALTER TABLE syslog_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations" ON syslog_messages
  FOR ALL USING (true);

-- Function to automatically delete logs older than 30 days
CREATE OR REPLACE FUNCTION delete_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM syslog_messages
  WHERE received_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run daily cleanup (requires pg_cron extension)
-- Run this in Supabase SQL Editor:
-- SELECT cron.schedule('delete-old-logs', '0 2 * * *', 'SELECT delete_old_logs()');

-- Alternative: Create a trigger-based approach for auto-deletion
-- This checks on each insert if cleanup is needed (less efficient but works without pg_cron)
CREATE OR REPLACE FUNCTION cleanup_old_logs_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run cleanup occasionally (1% of the time to avoid performance impact)
  IF random() < 0.01 THEN
    PERFORM delete_old_logs();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_old_logs
  AFTER INSERT ON syslog_messages
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_old_logs_trigger();
