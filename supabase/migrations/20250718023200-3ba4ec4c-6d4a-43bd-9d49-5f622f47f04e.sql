-- Make author_id nullable since we don't have authentication
ALTER TABLE public.blog_posts ALTER COLUMN author_id DROP NOT NULL;