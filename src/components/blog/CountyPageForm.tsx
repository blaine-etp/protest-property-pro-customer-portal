import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft } from "lucide-react";

interface CountyPage {
  id?: string;
  county_id: string;
  page_type: string;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  status: string;
  featured: boolean;
  sort_order: number;
}

interface County {
  id: string;
  name: string;
  slug: string;
}

interface CountyPageFormProps {
  countyPage?: CountyPage | null;
  county: County;
  onSuccess: () => void;
  onCancel: () => void;
}

const pageTypes = [
  { value: 'how-to', label: 'How-To Guide', urlSuffix: 'how-to-protest-property-taxes' },
  { value: 'basics', label: 'Property Tax Basics', urlSuffix: 'property-tax-basics' },
  { value: 'deadlines', label: 'Deadlines & Dates', urlSuffix: 'tax-protest-deadlines' },
  { value: 'appeals', label: 'Appeals Process', urlSuffix: 'tax-appeal-process' },
  { value: 'exemptions', label: 'Tax Exemptions', urlSuffix: 'property-tax-exemptions' },
  { value: 'values', label: 'Property Values', urlSuffix: 'property-value-information' },
];

export function CountyPageForm({ countyPage, county, onSuccess, onCancel }: CountyPageFormProps) {
  const [formData, setFormData] = useState<CountyPage>({
    county_id: county.id,
    page_type: '',
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: 'draft',
    featured: false,
    sort_order: 0,
    ...countyPage,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Auto-generate slug when page type changes
    if (formData.page_type && !countyPage?.id) {
      const selectedType = pageTypes.find(type => type.value === formData.page_type);
      if (selectedType) {
        const newSlug = `${county.slug}-${selectedType.urlSuffix}`;
        const newTitle = `${county.name} ${selectedType.label}`;
        setFormData(prev => ({
          ...prev,
          slug: newSlug,
          title: newTitle,
          meta_title: newTitle
        }));
      }
    }
  }, [formData.page_type, county, countyPage?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (countyPage?.id) {
        // Update existing page
        const { error } = await supabase
          .from('county_pages')
          .update({
            page_type: formData.page_type,
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            meta_keywords: formData.meta_keywords,
            status: formData.status,
            featured: formData.featured,
            sort_order: formData.sort_order,
          })
          .eq('id', countyPage.id);

        if (error) throw error;
        toast({ title: "Success", description: "County page updated successfully" });
      } else {
        // Create new page
        const { error } = await supabase
          .from('county_pages')
          .insert(formData);

        if (error) throw error;
        toast({ title: "Success", description: "County page created successfully" });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving county page:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save county page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {countyPage?.id ? 'Edit' : 'Create'} County Page
          </h2>
          <p className="text-muted-foreground">
            Managing content for {county.name} County
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to County
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO Settings</TabsTrigger>
            <TabsTrigger value="settings">Page Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Content</CardTitle>
                <CardDescription>
                  Configure the main content and type for this county page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="page_type">Page Type</Label>
                    <Select
                      value={formData.page_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, page_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select page type" />
                      </SelectTrigger>
                      <SelectContent>
                        {pageTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter page title"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This will be accessible at: /county/{formData.slug}
                  </p>
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter page content..."
                    className="min-h-[200px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize this page for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO optimized title (recommended: 50-60 characters)"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Brief description for search results (recommended: 150-160 characters)"
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_keywords">Meta Keywords</Label>
                  <Input
                    id="meta_keywords"
                    value={formData.meta_keywords || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                    placeholder="comma, separated, keywords"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Settings</CardTitle>
                <CardDescription>
                  Configure visibility and display options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured page</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Page'}
          </Button>
        </div>
      </form>
    </div>
  );
}