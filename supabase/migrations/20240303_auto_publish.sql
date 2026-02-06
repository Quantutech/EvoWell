
-- Function to automatically publish/unpublish based on moderation status
CREATE OR REPLACE FUNCTION auto_publish_on_moderation_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When provider is APPROVED, auto-publish if not already
  IF NEW.moderation_status = 'APPROVED' AND 
     (OLD.moderation_status IS NULL OR OLD.moderation_status != 'APPROVED') THEN
    NEW.is_published := true;
  END IF;
  
  -- When provider is REJECTED, auto-unpublish
  IF NEW.moderation_status = 'REJECTED' THEN
    NEW.is_published := false;
  END IF;
  
  -- When provider is set to PENDING, unpublish (safety measure)
  IF NEW.moderation_status = 'PENDING' THEN
    NEW.is_published := false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to allow re-running
DROP TRIGGER IF EXISTS trigger_auto_publish_on_approval ON public.providers;

-- Create trigger that runs BEFORE UPDATE
CREATE TRIGGER trigger_auto_publish_on_approval
  BEFORE UPDATE ON public.providers
  FOR EACH ROW
  WHEN (OLD.moderation_status IS DISTINCT FROM NEW.moderation_status)
  EXECUTE FUNCTION auto_publish_on_moderation_change();

-- One-time fix: Publish all providers that are approved but not published
UPDATE public.providers 
SET 
  is_published = true,
  updated_at = NOW()
WHERE 
  moderation_status = 'APPROVED' 
  AND (is_published = false OR is_published IS NULL);
