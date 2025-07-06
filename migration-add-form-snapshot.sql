-- Migration: Add form_snapshot and total_price fields to commissions table
-- Run this if you have an existing commissions table without these fields

-- Add total_price column
ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);

-- Add form_snapshot column
ALTER TABLE public.commissions 
ADD COLUMN IF NOT EXISTS form_snapshot JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.commissions.total_price IS 'Calculated total price from form';
COMMENT ON COLUMN public.commissions.form_snapshot IS 'Complete form state for drafts'; 