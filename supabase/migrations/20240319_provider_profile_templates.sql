-- Provider profile presentation and intake-status fields
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS profile_template TEXT NOT NULL DEFAULT 'CLASSIC',
  ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'ACCEPTING',
  ADD COLUMN IF NOT EXISTS accessibility_notes TEXT,
  ADD COLUMN IF NOT EXISTS show_license_number BOOLEAN NOT NULL DEFAULT false;

-- Constrain template values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'providers_profile_template_check'
  ) THEN
    ALTER TABLE providers
      ADD CONSTRAINT providers_profile_template_check
      CHECK (profile_template IN ('CLASSIC', 'ELEVATED'));
  END IF;
END $$;

-- Constrain intake availability values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'providers_availability_status_check'
  ) THEN
    ALTER TABLE providers
      ADD CONSTRAINT providers_availability_status_check
      CHECK (availability_status IN ('ACCEPTING', 'WAITLIST', 'NOT_ACCEPTING'));
  END IF;
END $$;
