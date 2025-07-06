-- Safe Migration to update commission status system
-- This version checks for existing data and handles the transition carefully

-- Step 1: Add new timestamp columns first (these won't conflict)
ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS waitlisted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS payment_requested_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Check what statuses currently exist
DO $$
DECLARE
    status_count RECORD;
BEGIN
    -- Log current status distribution
    RAISE NOTICE 'Current status distribution:';
    FOR status_count IN 
        SELECT status, COUNT(*) as count 
        FROM public.commissions 
        GROUP BY status 
        ORDER BY status
    LOOP
        RAISE NOTICE 'Status: %, Count: %', status_count.status, status_count.count;
    END LOOP;
END $$;

-- Step 3: Update existing commissions to use the new status system
-- Only update if the old statuses exist
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

-- Step 4: Verify all statuses are now valid before changing constraint
DO $$
DECLARE
    invalid_status RECORD;
BEGIN
    -- Check for any invalid statuses
    FOR invalid_status IN 
        SELECT DISTINCT status 
        FROM public.commissions 
        WHERE status NOT IN ('draft', 'submitted', 'waitlist', 'payment', 'wip', 'finished')
    LOOP
        RAISE EXCEPTION 'Invalid status found: %. Please fix this before continuing.', invalid_status.status;
    END LOOP;
    
    RAISE NOTICE 'All statuses are valid. Proceeding with constraint update...';
END $$;

-- Step 5: Now update the status constraint to allow the new status values
ALTER TABLE public.commissions 
DROP CONSTRAINT IF EXISTS commissions_status_check;

ALTER TABLE public.commissions 
ADD CONSTRAINT commissions_status_check 
CHECK (status IN ('draft', 'submitted', 'waitlist', 'payment', 'wip', 'finished'));

-- Step 6: Update the default status to 'draft' instead of 'pending_review'
ALTER TABLE public.commissions 
ALTER COLUMN status SET DEFAULT 'draft';

-- Step 7: Final verification
DO $$
DECLARE
    final_status_count RECORD;
BEGIN
    RAISE NOTICE 'Final status distribution:';
    FOR final_status_count IN 
        SELECT status, COUNT(*) as count 
        FROM public.commissions 
        GROUP BY status 
        ORDER BY status
    LOOP
        RAISE NOTICE 'Status: %, Count: %', final_status_count.status, final_status_count.count;
    END LOOP;
END $$; 