
-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance and Filtering
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action_type);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Admins can view all audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
  exists(select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);

-- 2. Users can insert their own logs (for application-level "VIEW" events)
CREATE POLICY "Users can log their own actions" ON public.audit_logs
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- 3. No one can update or delete audit logs (Immutable)
-- No policies defined for UPDATE or DELETE implies denial by default.

-- Database Trigger for Tamper-Proof Write Logging
CREATE OR REPLACE FUNCTION log_database_action()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  action_str TEXT;
BEGIN
  -- Attempt to get user ID from session, default to null if system action
  current_user_id := auth.uid();
  
  IF (TG_OP = 'INSERT') THEN
    action_str := 'CREATE';
  ELSIF (TG_OP = 'UPDATE') THEN
    action_str := 'UPDATE';
  ELSIF (TG_OP = 'DELETE') THEN
    action_str := 'DELETE';
  END IF;

  INSERT INTO public.audit_logs (user_id, action_type, resource_type, resource_id, metadata)
  VALUES (
    current_user_id,
    action_str,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    jsonb_build_object('trigger', true, 'old_data', row_to_json(OLD), 'new_data', row_to_json(NEW))
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Triggers to Sensitive Tables
DROP TRIGGER IF EXISTS audit_appointments ON public.appointments;
CREATE TRIGGER audit_appointments
AFTER INSERT OR UPDATE OR DELETE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION log_database_action();

DROP TRIGGER IF EXISTS audit_messages ON public.messages;
CREATE TRIGGER audit_messages
AFTER INSERT OR UPDATE OR DELETE ON public.messages
FOR EACH ROW EXECUTE FUNCTION log_database_action();

DROP TRIGGER IF EXISTS audit_providers ON public.providers;
CREATE TRIGGER audit_providers
AFTER INSERT OR UPDATE OR DELETE ON public.providers
FOR EACH ROW EXECUTE FUNCTION log_database_action();

DROP TRIGGER IF EXISTS audit_users ON public.users;
CREATE TRIGGER audit_users
AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION log_database_action();
