-- Migration: Remove is_draft column from commissions table
-- Since status field now fully covers the workflow including "draft"

-- Drop the is_draft column with CASCADE to automatically drop dependent objects
ALTER TABLE public.commissions DROP COLUMN IF EXISTS is_draft CASCADE;

-- Create new policy using status field instead of is_draft
CREATE POLICY "Users can update their own draft commissions" ON public.commissions
  FOR UPDATE USING (user_id = auth.uid() AND status = 'draft'); 