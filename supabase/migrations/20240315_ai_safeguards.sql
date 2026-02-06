
-- AI Audit Logging Table
CREATE TABLE IF NOT EXISTS public.ai_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  request_type TEXT NOT NULL, -- 'bio', 'blog', etc.
  prompt_used TEXT,
  generated_content TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  flags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Audit Logs
ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins view ai logs" ON public.ai_audit_logs
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Users can insert their own logs (via service)
CREATE POLICY "Users insert ai logs" ON public.ai_audit_logs
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Update Blogs table for moderation tracking
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS moderation_flags TEXT[],
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Update Providers table for bio moderation (if not already present in workflows)
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS bio_is_ai_generated BOOLEAN DEFAULT FALSE;
