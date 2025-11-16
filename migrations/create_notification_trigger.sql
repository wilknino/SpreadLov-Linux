-- Create function to notify on new notification insert
CREATE OR REPLACE FUNCTION notify_new_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification with the new notification ID
  PERFORM pg_notify(
    'new_notification',
    json_build_object(
      'notification_id', NEW.id,
      'user_id', NEW.user_id,
      'type', NEW.type,
      'from_user_id', NEW.from_user_id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS new_notification_trigger ON notifications;

-- Create trigger on notifications table
CREATE TRIGGER new_notification_trigger
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_notification();
