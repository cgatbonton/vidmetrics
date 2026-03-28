-- Saved channel analyses (linked to auth.users)
CREATE TABLE saved_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_avatar TEXT NOT NULL,
  subscriber_count INT NOT NULL,
  video_count INT NOT NULL,
  videos JSONB NOT NULL,
  content_types JSONB NOT NULL,
  ai_analysis JSONB NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tags JSONB,
  scores JSONB,
  constraints JSONB,
  edit_history JSONB,
  UNIQUE(user_id, channel_id)
);

ALTER TABLE saved_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved channels"
  ON saved_channels FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own saved channels"
  ON saved_channels FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saved channels"
  ON saved_channels FOR DELETE
  USING (user_id = auth.uid());
