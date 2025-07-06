-- Fresh Start Migration - Delete all commissions and update schema
-- This is the cleanest approach if you want to start fresh

-- Step 1: Delete all existing commissions (this will also delete related messages)
DELETE FROM public.commission_messages;
DELETE FROM public.commissions;

-- Step 2: Add new timestamp columns
ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS waitlisted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS payment_requested_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Update the status constraint to allow the new status values
ALTER TABLE public.commissions 
DROP CONSTRAINT IF EXISTS commissions_status_check;

ALTER TABLE public.commissions 
ADD CONSTRAINT commissions_status_check 
CHECK (status IN ('draft', 'submitted', 'waitlist', 'payment', 'wip', 'finished'));

-- Step 4: Update the default status to 'draft' instead of 'pending_review'
ALTER TABLE public.commissions 
ALTER COLUMN status SET DEFAULT 'draft';

-- Step 5: Verify the changes
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'New status system: draft -> submitted -> waitlist -> payment -> wip -> finished';
    RAISE NOTICE 'New columns added: waitlisted_at, payment_requested_at, work_started_at';
END $$; 