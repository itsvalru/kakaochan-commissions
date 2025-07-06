-- Migration to update commission status system
-- New status flow: Draft -> Submitted -> Waitlist -> Payment -> WIP -> Finished

-- Step 1: Add new timestamp columns first (these won't conflict)
ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS waitlisted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS payment_requested_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Update existing commissions to use the new status system BEFORE changing the constraint
-- Convert existing statuses to new ones
UPDATE public.commissions 
SET status = CASE 
  WHEN status = 'pending_review' THEN 'submitted'
  WHEN status = 'awaiting_payment' THEN 'payment'
  WHEN status = 'in_progress' THEN 'wip'
  WHEN status = 'delivered' THEN 'finished'
  WHEN status = 'closed' THEN 'finished'
  ELSE status
END
WHERE status IN ('pending_review', 'awaiting_payment', 'in_progress', 'delivered', 'closed');

-- Step 3: Now update the status constraint to allow the new status values
ALTER TABLE public.commissions 
DROP CONSTRAINT IF EXISTS commissions_status_check;

ALTER TABLE public.commissions 
ADD CONSTRAINT commissions_status_check 
CHECK (status IN ('draft', 'submitted', 'waitlist', 'payment', 'wip', 'finished'));

-- Step 4: Update the default status to 'draft' instead of 'pending_review'
ALTER TABLE public.commissions 
ALTER COLUMN status SET DEFAULT 'draft'; 