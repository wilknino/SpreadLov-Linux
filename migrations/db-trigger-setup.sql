-- PostgreSQL Trigger Setup for Push Notifications
-- Run this SQL on your production database to enable push notifications

-- Step 1: Create the notification trigger function
CREATE OR REPLACE FUNCTION notify_new_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Send PostgreSQL NOTIFY event with notification details
    PERFORM pg_notify(
        'new_notification',
        json_build_object(
            'notification_id', NEW.id,
            'user_id', NEW.user_id,
            'type', NEW.type,
            'from_user_id', NEW.from_user_id,
            'conversation_id', NEW.conversation_id
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the trigger on notifications table
DROP TRIGGER IF EXISTS trigger_new_notification ON notifications;

CREATE TRIGGER trigger_new_notification
    AFTER INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_notification();

-- Step 3: Verify the trigger was created
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_new_notification';

-- You should see output showing the trigger is active
-- Now whenever a notification is inserted, it will automatically send a NOTIFY event
