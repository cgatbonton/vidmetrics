-- Per-video AI analysis storage
CREATE TABLE video_ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  analysis JSONB NOT NULL,
  tags JSONB DEFAULT NULL,
  scores JSONB DEFAULT NULL,
  constraints JSONB DEFAULT NULL,
  edit_history JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE video_ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON video_ai_analyses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_insert_own" ON video_ai_analyses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own" ON video_ai_analyses
  FOR UPDATE USING (user_id = auth.uid());
