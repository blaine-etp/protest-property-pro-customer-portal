-- Drop the existing auth-based policies
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;

-- Create completely public policies for blog images
CREATE POLICY "Anyone can upload blog images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Anyone can update blog images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'blog-images');

CREATE POLICY "Anyone can delete blog images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'blog-images');

-- Update blog post policies to be public
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;

CREATE POLICY "Anyone can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (true);

-- Update blog tags policies to be public  
DROP POLICY IF EXISTS "Admins can manage blog tags" ON public.blog_tags;

CREATE POLICY "Anyone can manage blog tags" 
ON public.blog_tags 
FOR ALL 
USING (true);

-- Update blog post tags policies to be public
DROP POLICY IF EXISTS "Admins can manage blog post tags" ON public.blog_post_tags;

CREATE POLICY "Anyone can manage blog post tags" 
ON public.blog_post_tags 
FOR ALL 
USING (true);