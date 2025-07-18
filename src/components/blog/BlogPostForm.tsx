import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TagInput } from "./TagInput";

interface BlogPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  post_type: string;
  category: string;
  status: string;
  featured: boolean;
  thumbnail_image_url: string | null;
  published_at: string | null;
  read_time_minutes: number;
  author_id: string;
}

interface BlogPostFormProps {
  post?: BlogPost | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BlogPostForm({ post, onSuccess, onCancel }: BlogPostFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    post_type: "article",
    category: "Tax Appeals",
    status: "draft",
    featured: false,
    read_time_minutes: 5,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        post_type: post.post_type,
        category: post.category,
        status: post.status,
        featured: post.featured,
        read_time_minutes: post.read_time_minutes,
      });
      setThumbnailPreview(post.thumbnail_image_url);
      // Load existing tags
      loadPostTags(post.id!);
    }
  }, [post]);

  const loadPostTags = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_post_tags')
        .select(`
          blog_tags (
            name
          )
        `)
        .eq('post_id', postId);

      if (error) throw error;
      
      const tagNames = data?.map(item => (item.blog_tags as any).name) || [];
      setTags(tagNames);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (): Promise<string | null> => {
    if (!thumbnailFile) return null;

    setUploading(true);
    try {
      const fileExt = thumbnailFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `blog-thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, thumbnailFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast({
        title: "Error",
        description: "Failed to upload thumbnail image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveTags = async (postId: string) => {
    try {
      // First, remove existing tags
      await supabase
        .from('blog_post_tags')
        .delete()
        .eq('post_id', postId);

      if (tags.length === 0) return;

      // Create or get tag IDs
      const tagIds = [];
      for (const tagName of tags) {
        const { data: existingTag, error: selectError } = await supabase
          .from('blog_tags')
          .select('id')
          .eq('name', tagName)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          throw selectError;
        }

        let tagId;
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const { data: newTag, error: insertError } = await supabase
            .from('blog_tags')
            .insert({ name: tagName })
            .select('id')
            .single();

          if (insertError) throw insertError;
          tagId = newTag.id;
        }

        tagIds.push(tagId);
      }

      // Create tag associations
      const tagAssociations = tagIds.map(tagId => ({
        post_id: postId,
        tag_id: tagId,
      }));

      const { error } = await supabase
        .from('blog_post_tags')
        .insert(tagAssociations);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving tags:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let thumbnailUrl = post?.thumbnail_image_url;
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail();
        if (!thumbnailUrl) return; // Upload failed
      }

      const postData = {
        ...formData,
        thumbnail_image_url: thumbnailUrl,
        author_id: null, // No authentication, so no author
        published_at: formData.status === 'published' && !post?.published_at 
          ? new Date().toISOString() 
          : post?.published_at,
      };

      let postId;
      if (post?.id) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);

        if (error) throw error;
        postId = post.id;
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('blog_posts')
          .insert(postData)
          .select('id')
          .single();

        if (error) throw error;
        postId = data.id;
      }

      // Save tags
      await saveTags(postId);

      toast({
        title: "Success",
        description: `Post ${post?.id ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: `Failed to ${post?.id ? 'update' : 'create'} post`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  useEffect(() => {
    const readTime = calculateReadTime(formData.content);
    setFormData(prev => ({ ...prev, read_time_minutes: readTime }));
  }, [formData.content]);

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>
          {post?.id ? 'Edit Post' : 'Create New Post'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter post title"
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Brief description of the post"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="post_type">Post Type</Label>
                <Select
                  value={formData.post_type}
                  onValueChange={(value) => handleInputChange('post_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="infographic">Infographic</SelectItem>
                    <SelectItem value="case_study">Case Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tax Appeals">Tax Appeals</SelectItem>
                    <SelectItem value="Success Stories">Success Stories</SelectItem>
                    <SelectItem value="Market News">Market News</SelectItem>
                    <SelectItem value="County News">County News</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="read_time">Read Time (minutes)</Label>
                <Input
                  id="read_time"
                  type="number"
                  min="1"
                  value={formData.read_time_minutes}
                  onChange={(e) => handleInputChange('read_time_minutes', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange('featured', checked)}
              />
              <Label htmlFor="featured">Featured Post</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Thumbnail Image</Label>
              <div className="space-y-4">
                {thumbnailPreview && (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setThumbnailPreview(null);
                        setThumbnailFile(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail" className="cursor-pointer text-sm font-medium">
                      Click to upload thumbnail
                    </Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <TagInput
                tags={tags}
                onTagsChange={setTags}
                placeholder="Add tags..."
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Write your post content here..."
            rows={15}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Estimated read time: {formData.read_time_minutes} minute{formData.read_time_minutes !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || uploading}>
            {saving ? 'Saving...' : uploading ? 'Uploading...' : post?.id ? 'Update Post' : 'Create Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}