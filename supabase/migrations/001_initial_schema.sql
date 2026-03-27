-- VidMetrics: Initial Supabase schema
-- Run this in the Supabase SQL Editor

-- Saved analyses (linked to auth.users)
CREATE TABLE saved_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  metrics JSONB NOT NULL,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tags JSONB,
  scores JSONB,
  constraints JSONB,
  edit_history JSONB,
  UNIQUE(user_id, video_id)
);

ALTER TABLE saved_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saves"
  ON saved_analyses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own saves"
  ON saved_analyses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saves"
  ON saved_analyses FOR DELETE
  USING (user_id = auth.uid());

-- Metric snapshots (authenticated users only)
CREATE TABLE metric_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL,
  view_count INT NOT NULL,
  like_count INT NOT NULL,
  comment_count INT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tags JSONB,
  scores JSONB,
  constraints JSONB,
  edit_history JSONB
);

CREATE INDEX idx_metric_snapshots_video_date ON metric_snapshots(video_id, recorded_at);

ALTER TABLE metric_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read snapshots"
  ON metric_snapshots FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert snapshots"
  ON metric_snapshots FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Audit logs (insert-only for authenticated, read for service role only)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  reason TEXT,
  context JSONB,
  outcome JSONB NOT NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Events (insert-only for authenticated, read for service role only)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  data JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
