-- Ensure posts.archive_link exists (older DBs may have been created before this column was added)
ALTER TABLE IF EXISTS public.posts
  ADD COLUMN IF NOT EXISTS archive_link TEXT;


