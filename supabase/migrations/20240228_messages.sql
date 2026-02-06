
-- Create Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1_id UUID NOT NULL REFERENCES public.users(id),
  participant_2_id UUID NOT NULL REFERENCES public.users(id),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  receiver_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
CREATE POLICY "Users can view their own conversations" ON public.conversations
FOR SELECT USING (
  auth.uid() = participant_1_id OR auth.uid() = participant_2_id OR is_admin()
);

CREATE POLICY "Users can insert conversations they participate in" ON public.conversations
FOR INSERT WITH CHECK (
  auth.uid() = participant_1_id OR auth.uid() = participant_2_id OR is_admin()
);

-- Messages Policies
CREATE POLICY "Users can view messages they sent or received" ON public.messages
FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id OR is_admin()
);

CREATE POLICY "Users can insert messages as sender" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id OR is_admin()
);

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (
  auth.uid() = sender_id OR is_admin()
);
