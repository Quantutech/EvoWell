-- Create endorsements table
CREATE TABLE IF NOT EXISTS endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endorsed_provider_id UUID NOT NULL REFERENCES providers(id),
  endorser_user_id UUID NOT NULL REFERENCES users(id),
  endorser_role VARCHAR(20) NOT NULL CHECK (endorser_role IN ('admin', 'provider')),
  endorsement_type VARCHAR(20) NOT NULL CHECK (endorsement_type IN ('evowell', 'peer')),
  reason VARCHAR(50) NULL CHECK (
    reason IS NULL OR reason IN (
      'clinical_expertise',
      'professional_collaboration',
      'ethical_practice',
      'strong_outcomes',
      'community_contribution'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT unique_endorsement UNIQUE (endorsed_provider_id, endorser_user_id)
);

-- Create indexes for performance
CREATE INDEX idx_endorsements_provider ON endorsements(endorsed_provider_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_endorsements_endorser ON endorsements(endorser_user_id) WHERE deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Public Read Access
-- Anyone can read endorsements that haven't been deleted
CREATE POLICY "Public endorsements are viewable by everyone" 
ON endorsements FOR SELECT 
USING (deleted_at IS NULL);

-- 2. Insert Access
-- Only authenticated users who are providers or admins can insert
-- Note: We also validate the role in the application logic, but RLS adds a layer of security.
CREATE POLICY "Providers and Admins can create endorsements" 
ON endorsements FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND
  (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('provider', 'admin')
    )
  )
);

-- 3. Update Access (Soft Delete)
-- Only admins can soft-delete endorsements
CREATE POLICY "Admins can revoke endorsements" 
ON endorsements FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
