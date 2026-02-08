-- Provider profile theme system (single layout + curated color schemes)
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS profile_theme TEXT NOT NULL DEFAULT 'MIDNIGHT';

-- Backfill legacy template choices to the new theme model
UPDATE providers
SET profile_theme = CASE
  WHEN profile_template = 'ELEVATED' THEN 'FOREST'
  ELSE 'MIDNIGHT'
END
WHERE profile_theme IS NULL
   OR profile_theme NOT IN ('MIDNIGHT', 'FOREST', 'OCEAN', 'SLATE');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'providers_profile_theme_check'
  ) THEN
    ALTER TABLE providers
      ADD CONSTRAINT providers_profile_theme_check
      CHECK (profile_theme IN ('MIDNIGHT', 'FOREST', 'OCEAN', 'SLATE'));
  END IF;
END $$;
