CREATE TABLE pending_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  channel_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pending_saves_email ON pending_saves(email);

ALTER TABLE pending_saves ENABLE ROW LEVEL SECURITY;

-- Allow unauthenticated inserts (registration endpoint runs before email confirmation)
CREATE POLICY "Allow insert during registration"
  ON pending_saves FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read/delete their own pending saves (matched by email)
CREATE POLICY "Users can read own pending saves"
  ON pending_saves FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete own pending saves"
  ON pending_saves FOR DELETE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
