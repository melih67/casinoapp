-- Migration script to add multiplier column to existing bets table
-- Run this SQL script in your Supabase SQL Editor if you already have the database set up

-- Add multiplier column to bets table
ALTER TABLE public.bets 
ADD COLUMN IF NOT EXISTS multiplier DECIMAL(10,4) DEFAULT 0.00 NOT NULL;

-- Add comment to the column
COMMENT ON COLUMN public.bets.multiplier IS 'Game multiplier for calculating payouts';

-- Update existing bets to have a default multiplier of 1.0 if they don't have one
UPDATE public.bets 
SET multiplier = 1.0 
WHERE multiplier = 0.00;