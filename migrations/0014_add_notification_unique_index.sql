-- Add unique partial indexes for notifications to prevent duplicates
-- For profile_view and profile_like (where conversationId IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS notifications_unique_profile_actions
ON notifications (user_id, from_user_id, type)
WHERE conversation_id IS NULL;

-- For message_received (includes conversationId)
CREATE UNIQUE INDEX IF NOT EXISTS notifications_unique_messages
ON notifications (user_id, from_user_id, type, conversation_id)
WHERE conversation_id IS NOT NULL;
