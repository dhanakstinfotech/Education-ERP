-- Add fee_status to arrear registrations (matches registrations table)
ALTER TABLE arrear_registrations
  ADD COLUMN IF NOT EXISTS fee_status text NOT NULL DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'arrear_registrations_fee_status_check'
  ) THEN
    ALTER TABLE arrear_registrations
      ADD CONSTRAINT arrear_registrations_fee_status_check
      CHECK (fee_status IN ('paid','pending','waived'));
  END IF;
END $$;

-- Backfill existing rows
UPDATE arrear_registrations SET fee_status = 'paid' WHERE status = 'approved' AND fee_status = 'pending';
UPDATE arrear_registrations SET fee_status = 'pending' WHERE status = 'pending';

-- Idempotent migration helper (called from app on startup)
CREATE OR REPLACE FUNCTION public.ensure_arrear_fee_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'arrear_registrations'
      AND column_name = 'fee_status'
  ) THEN
    ALTER TABLE arrear_registrations
      ADD COLUMN fee_status text NOT NULL DEFAULT 'pending';
    ALTER TABLE arrear_registrations
      ADD CONSTRAINT arrear_registrations_fee_status_check
      CHECK (fee_status IN ('paid','pending','waived'));
    UPDATE arrear_registrations SET fee_status = 'paid' WHERE status = 'approved';
    UPDATE arrear_registrations SET fee_status = 'pending' WHERE status = 'pending';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_arrear_fee_status() TO anon, authenticated;
