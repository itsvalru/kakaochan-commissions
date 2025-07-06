-- Diagnostic query to check current database state
-- Run this first to understand what data you have

-- Check current status distribution
SELECT status, COUNT(*) as count 
FROM public.commissions 
GROUP BY status 
ORDER BY status;

-- Check if there are any commissions with old status values
SELECT id, status, created_at, category_name, type_name
FROM public.commissions 
WHERE status IN ('pending_review', 'awaiting_payment', 'in_progress', 'delivered', 'closed')
ORDER BY created_at DESC;

-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'commissions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current constraints
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.commissions'::regclass; 