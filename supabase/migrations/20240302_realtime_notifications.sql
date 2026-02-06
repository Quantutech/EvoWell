
-- Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'message', 'appointment', 'system', 'payment'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: New Message Notification
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the receiver
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.receiver_id,
    'message',
    'New Message',
    LEFT(NEW.content, 50) || (CASE WHEN LENGTH(NEW.content) > 50 THEN '...' ELSE '' END),
    '/dashboard/support' -- Redirect to chat
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- Trigger: New Appointment Notification
CREATE OR REPLACE FUNCTION public.handle_new_appointment()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Determine who to notify based on who created it (client books -> notify provider)
  -- Assuming simple case: Notify Provider for new booking
  
  -- We need to resolve provider's user_id from providers table
  SELECT user_id INTO target_user_id FROM public.providers WHERE id = NEW.provider_id;
  
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      target_user_id,
      'appointment',
      'New Appointment Request',
      'A client has requested a new session.',
      '/dashboard/schedule'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_appointment ON public.appointments;
CREATE TRIGGER on_new_appointment
AFTER INSERT ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.handle_new_appointment();
