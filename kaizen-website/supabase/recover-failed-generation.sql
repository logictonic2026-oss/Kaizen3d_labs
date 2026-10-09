-- Run in the Supabase SQL Editor as the project owner.
-- Keep completed generations counted, but exclude attempts explicitly reviewed
-- and marked generation_failed. No enquiry records are deleted.
CREATE OR REPLACE FUNCTION public.has_used_free_generation(
  user_email text,
  user_phone text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.design_enquiries AS enquiry
    WHERE enquiry.request_type = '3D Model Generation (Meshy)'
      AND enquiry.status IS DISTINCT FROM 'generation_failed'
      AND (
        (NULLIF(trim(user_email), '') IS NOT NULL
          AND lower(trim(enquiry.email)) = lower(trim(user_email)))
        OR (NULLIF(regexp_replace(user_phone, '[^0-9]', '', 'g'), '') IS NOT NULL
          AND regexp_replace(enquiry.phone, '[^0-9]', '', 'g')
            = regexp_replace(user_phone, '[^0-9]', '', 'g'))
      )
  );
$$;

REVOKE ALL ON FUNCTION public.has_used_free_generation(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_used_free_generation(text, text) TO anon, authenticated;

-- Find the affected user's attempts. Replace the example email, then review
-- each record against Meshy task history. Do not mark a successful task failed.
-- SELECT id, email, phone, status, created_at
-- FROM public.design_enquiries
-- WHERE lower(email) = lower('affected-user@example.com')
--   AND request_type = '3D Model Generation (Meshy)'
-- ORDER BY created_at DESC;

-- Reset only the reviewed failed attempt by its exact ID:
-- UPDATE public.design_enquiries
-- SET status = 'generation_failed'
-- WHERE id = 'REPLACE_WITH_FAILED_ENQUIRY_UUID'::uuid
--   AND request_type = '3D Model Generation (Meshy)';
