-- Notifications Migration
-- Story: 13.7 - Broadcast In-App Notifications
--
-- Creates the notifications table for admin-to-user communication
-- and audit trail of sent notifications.

-- Create the notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error')),
  target_user_id UUID REFERENCES users(id),
  sent_by UUID REFERENCES users(id),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to describe table purpose
COMMENT ON TABLE notifications IS 'Stores admin-broadcasted notifications for user communication during incidents';

-- Index for fast queries by sent_at timestamp (for history view)
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at
  ON notifications(sent_at DESC);

-- Index for finding notifications for a specific user
CREATE INDEX IF NOT EXISTS idx_notifications_target_user
  ON notifications(target_user_id, sent_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can insert notifications
CREATE POLICY "Admins can send notifications" ON notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Policy: Admins can view all notifications (for history)
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Policy: Users can view their notifications or global ones (target_user_id IS NULL)
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT
  USING (
    target_user_id IS NULL
    OR target_user_id = auth.uid()
  );
