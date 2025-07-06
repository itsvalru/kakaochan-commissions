-- =====================================================
-- CHAT SYSTEM SETUP FOR KAKAOCHAN COMMISSIONS
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ENHANCE COMMISSION MESSAGES TABLE
-- =====================================================

-- Drop existing table if it exists (be careful with this in production)
-- DROP TABLE IF EXISTS public.commission_messages CASCADE;

-- Enhanced Commission Messages table with more chat features
CREATE TABLE IF NOT EXISTS public.commission_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  commission_id UUID REFERENCES public.commissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Message content
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'status_update', 'system')),
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER, -- in bytes
  file_type TEXT, -- MIME type
  
  -- Message metadata
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  reply_to_id UUID REFERENCES public.commission_messages(id) ON DELETE SET NULL,
  
  -- Read receipts
  read_by JSONB DEFAULT '[]', -- Array of user IDs who have read this message
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. MESSAGE REACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES public.commission_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL, -- Unicode emoji or custom emoji code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one reaction per user per message per emoji
  UNIQUE(message_id, user_id, emoji)
);

-- =====================================================
-- 3. TYPING INDICATORS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  commission_id UUID REFERENCES public.commissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one typing indicator per user per commission
  UNIQUE(commission_id, user_id)
);

-- =====================================================
-- 4. CHAT SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  commission_id UUID REFERENCES public.commissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Notification settings
  email_notifications BOOLEAN DEFAULT TRUE,
  browser_notifications BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  
  -- Chat preferences
  auto_scroll BOOLEAN DEFAULT TRUE,
  show_timestamps BOOLEAN DEFAULT TRUE,
  show_read_receipts BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one settings record per user per commission
  UNIQUE(commission_id, user_id)
);

-- =====================================================
-- 5. MESSAGE ATTACHMENTS TABLE (for better file handling)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES public.commission_messages(id) ON DELETE CASCADE,
  
  -- File information
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- in bytes
  file_type TEXT NOT NULL, -- MIME type
  file_extension TEXT,
  
  -- Image-specific fields
  image_width INTEGER,
  image_height INTEGER,
  thumbnail_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.commission_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Commission Messages policies
CREATE POLICY "Users can view messages for their commissions" ON public.commission_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.commissions 
      WHERE commissions.id = commission_messages.commission_id 
      AND commissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their commissions" ON public.commission_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.commissions 
      WHERE commissions.id = commission_messages.commission_id 
      AND commissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON public.commission_messages
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all messages" ON public.commission_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can create messages for any commission" ON public.commission_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update any message" ON public.commission_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

-- Message Reactions policies
CREATE POLICY "Users can view reactions for their commission messages" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.commission_messages cm
      JOIN public.commissions c ON c.id = cm.commission_id
      WHERE cm.id = message_reactions.message_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reactions for their commission messages" ON public.message_reactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.commission_messages cm
      JOIN public.commissions c ON c.id = cm.commission_id
      WHERE cm.id = message_reactions.message_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own reactions" ON public.message_reactions
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reactions" ON public.message_reactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

-- Typing Indicators policies
CREATE POLICY "Users can view typing indicators for their commissions" ON public.typing_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.commissions 
      WHERE commissions.id = typing_indicators.commission_id 
      AND commissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own typing indicators" ON public.typing_indicators
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all typing indicators" ON public.typing_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

-- Chat Settings policies
CREATE POLICY "Users can manage their own chat settings" ON public.chat_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all chat settings" ON public.chat_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

-- Message Attachments policies
CREATE POLICY "Users can view attachments for their commission messages" ON public.message_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.commission_messages cm
      JOIN public.commissions c ON c.id = cm.commission_id
      WHERE cm.id = message_attachments.message_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all attachments" ON public.message_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

-- =====================================================
-- 7. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old typing indicators
CREATE OR REPLACE FUNCTION public.cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM public.typing_indicators 
  WHERE last_activity < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_message_read(
  p_message_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE public.commission_messages 
  SET read_by = COALESCE(read_by, '[]'::jsonb) || to_jsonb(p_user_id)
  WHERE id = p_message_id 
  AND NOT (read_by @> to_jsonb(p_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION public.get_unread_count(
  p_commission_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.commission_messages cm
  WHERE cm.commission_id = p_commission_id
  AND cm.user_id != p_user_id
  AND NOT (cm.read_by @> to_jsonb(p_user_id));
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at triggers
CREATE TRIGGER update_commission_messages_updated_at 
  BEFORE UPDATE ON public.commission_messages
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_chat_settings_updated_at 
  BEFORE UPDATE ON public.chat_settings
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

-- Commission Messages indexes
CREATE INDEX IF NOT EXISTS idx_commission_messages_commission_id ON public.commission_messages(commission_id);
CREATE INDEX IF NOT EXISTS idx_commission_messages_user_id ON public.commission_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_messages_created_at ON public.commission_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_commission_messages_reply_to_id ON public.commission_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_commission_messages_type ON public.commission_messages(message_type);

-- Message Reactions indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_emoji ON public.message_reactions(emoji);

-- Typing Indicators indexes
CREATE INDEX IF NOT EXISTS idx_typing_indicators_commission_id ON public.typing_indicators(commission_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_last_activity ON public.typing_indicators(last_activity);

-- Chat Settings indexes
CREATE INDEX IF NOT EXISTS idx_chat_settings_commission_id ON public.chat_settings(commission_id);
CREATE INDEX IF NOT EXISTS idx_chat_settings_user_id ON public.chat_settings(user_id);

-- Message Attachments indexes
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_file_type ON public.message_attachments(file_type);

-- =====================================================
-- 9. REAL-TIME SUBSCRIPTIONS SETUP
-- =====================================================

-- Enable real-time for all chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.commission_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;

-- =====================================================
-- 10. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample chat settings for existing commissions
INSERT INTO public.chat_settings (commission_id, user_id, email_notifications, browser_notifications, sound_enabled)
SELECT 
  c.id as commission_id,
  c.user_id,
  TRUE as email_notifications,
  TRUE as browser_notifications,
  TRUE as sound_enabled
FROM public.commissions c
WHERE NOT EXISTS (
  SELECT 1 FROM public.chat_settings cs 
  WHERE cs.commission_id = c.id AND cs.user_id = c.user_id
);

-- =====================================================
-- 11. VIEWS FOR EASY QUERYING
-- =====================================================

-- View for commission messages with user info and reaction counts
CREATE OR REPLACE VIEW public.commission_messages_with_metadata AS
SELECT 
  cm.*,
  u.display_name,
  u.avatar_url,
  COUNT(mr.id) as reaction_count,
  ARRAY_AGG(DISTINCT mr.emoji) FILTER (WHERE mr.emoji IS NOT NULL) as reactions
FROM public.commission_messages cm
LEFT JOIN public.users u ON u.id = cm.user_id
LEFT JOIN public.message_reactions mr ON mr.message_id = cm.id
GROUP BY cm.id, u.display_name, u.avatar_url;

-- View for commission chat summary
CREATE OR REPLACE VIEW public.commission_chat_summary AS
SELECT 
  c.id as commission_id,
  c.category_name,
  c.type_name,
  c.status,
  COUNT(cm.id) as message_count,
  MAX(cm.created_at) as last_message_at,
  COUNT(DISTINCT cm.user_id) as participant_count
FROM public.commissions c
LEFT JOIN public.commission_messages cm ON cm.commission_id = c.id
GROUP BY c.id, c.category_name, c.type_name, c.status;

-- =====================================================
-- 12. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.commission_messages IS 'Enhanced chat messages for commission communications';
COMMENT ON TABLE public.message_reactions IS 'Emoji reactions to messages';
COMMENT ON TABLE public.typing_indicators IS 'Real-time typing indicators for chat';
COMMENT ON TABLE public.chat_settings IS 'User preferences for chat notifications and behavior';
COMMENT ON TABLE public.message_attachments IS 'File attachments for messages';

COMMENT ON COLUMN public.commission_messages.read_by IS 'JSON array of user IDs who have read this message';
COMMENT ON COLUMN public.commission_messages.reply_to_id IS 'ID of the message this is replying to';
COMMENT ON COLUMN public.message_reactions.emoji IS 'Unicode emoji or custom emoji code';

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- To enable real-time subscriptions in your app:
-- 1. Subscribe to commission_messages changes
-- 2. Subscribe to message_reactions changes  
-- 3. Subscribe to typing_indicators changes
-- 4. Use the provided functions for read receipts and unread counts

-- Example usage:
-- SELECT public.mark_message_read('message-uuid', 'user-uuid');
-- SELECT public.get_unread_count('commission-uuid', 'user-uuid'); 