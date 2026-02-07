-- Create provider_wishlists table
CREATE TABLE IF NOT EXISTS provider_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_wishlist UNIQUE (provider_id, client_id)
);

-- Create indexes for performance
CREATE INDEX idx_wishlists_client ON provider_wishlists(client_id);
CREATE INDEX idx_wishlists_provider ON provider_wishlists(provider_id);

-- Enable Row Level Security
ALTER TABLE provider_wishlists ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Clients can view their own wishlists
CREATE POLICY "Clients can view own wishlists"
ON provider_wishlists FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

-- 2. Clients can create their own wishlists
-- Note: Logic should also prevent providers from saving, but RLS here ensures client_id matches the user.
-- The API logic/service will ensure role is 'client' or 'admin'.
CREATE POLICY "Clients can create own wishlists"
ON provider_wishlists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id);

-- 3. Clients can delete their own wishlists
CREATE POLICY "Clients can delete own wishlists"
ON provider_wishlists FOR DELETE
TO authenticated
USING (auth.uid() = client_id);

-- 4. Providers can view who wishlisted them
CREATE POLICY "Providers can view who wishlisted them"
ON provider_wishlists FOR SELECT
TO authenticated
USING (
  auth.uid() = provider_id
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'provider'
  )
);

-- 5. Admins can view all wishlists
CREATE POLICY "Admins can view all wishlists"
ON provider_wishlists FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 6. Admins can manage all wishlists (Insert/Delete)
CREATE POLICY "Admins can manage all wishlists"
ON provider_wishlists FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
