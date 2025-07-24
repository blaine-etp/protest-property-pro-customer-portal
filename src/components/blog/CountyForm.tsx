import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleHtmlEditor } from "@/components/ui/simple-html-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface County {
  id: string;
  name: string;
  slug: string;
  state: string;
  county_code?: string;
  current_tax_year?: number;
  protest_deadline?: string;
  hearing_period_start?: string;
  hearing_period_end?: string;
  appraisal_district_name?: string;
  appraisal_district_phone?: string;
  appraisal_district_website?: string;
  appraisal_district_address?: string;
  appraisal_district_city?: string;
  appraisal_district_zip?: string;
  how_to_content?: string;
  county_info_content?: string;
  page_title?: string;
  page_content?: string;
  hero_image_url?: string;
  courthouse_image_url?: string;
  landscape_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  status: string;
  featured: boolean;
}

interface CountyFormProps {
  county?: County | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CountyForm({ county, onSuccess, onCancel }: CountyFormProps) {
  const [formData, setFormData] = useState({
    name: county?.name || "",
    slug: county?.slug || "",
    state: county?.state || "Texas",
    county_code: county?.county_code || "",
    current_tax_year: county?.current_tax_year || new Date().getFullYear(),
    protest_deadline: county?.protest_deadline || "",
    hearing_period_start: county?.hearing_period_start || "",
    hearing_period_end: county?.hearing_period_end || "",
    appraisal_district_name: county?.appraisal_district_name || "",
    appraisal_district_phone: county?.appraisal_district_phone || "",
    appraisal_district_website: county?.appraisal_district_website || "",
    appraisal_district_address: county?.appraisal_district_address || "",
    appraisal_district_city: county?.appraisal_district_city || "",
    appraisal_district_zip: county?.appraisal_district_zip || "",
    how_to_content: county?.how_to_content || "",
    county_info_content: county?.county_info_content || "",
    page_title: county?.page_title || "",
    page_content: county?.page_content || "",
    hero_image_url: county?.hero_image_url || "",
    courthouse_image_url: county?.courthouse_image_url || "",
    landscape_image_url: county?.landscape_image_url || "",
    meta_title: county?.meta_title || "",
    meta_description: county?.meta_description || "",
    meta_keywords: county?.meta_keywords || "",
    status: county?.status || "draft",
    featured: county?.featured || false,
  });

  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));

    // Auto-generate slug when name changes
    if (field === 'name' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ 
        ...prev, 
        slug: `${slug}-texas`
      }));
    }

    // Auto-generate page title when name changes
    if (field === 'name' && typeof value === 'string') {
      setFormData(prev => ({ 
        ...prev, 
        page_title: `${value} County Property Tax Information`
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (county) {
        // Update existing county
        const { error } = await supabase
          .from('counties')
          .update(formData)
          .eq('id', county.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "County updated successfully",
        });
      } else {
        // Create new county
        const { error } = await supabase
          .from('counties')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "County created successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving county:', error);
      toast({
        title: "Error",
        description: "Failed to save county",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {county ? 'Edit County' : 'Create New County'}
          </h2>
          <p className="text-muted-foreground">
            {county ? 'Update county information and content' : 'Add a new county with tax protest information'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : county ? 'Update County' : 'Create County'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="page-content">Page Content</TabsTrigger>
          <TabsTrigger value="content">Additional Content</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General county details and tax year information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">County Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Harris County"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="harris-county-texas"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={formData.state} onValueChange={(value) => handleChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Texas">Texas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="county_code">County Code</Label>
                  <Input
                    id="county_code"
                    value={formData.county_code}
                    onChange={(e) => handleChange('county_code', e.target.value)}
                    placeholder="201"
                  />
                </div>
                <div>
                  <Label htmlFor="current_tax_year">Current Tax Year</Label>
                  <Input
                    id="current_tax_year"
                    type="number"
                    value={formData.current_tax_year}
                    onChange={(e) => handleChange('current_tax_year', parseInt(e.target.value) || new Date().getFullYear())}
                    placeholder="2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="protest_deadline">Protest Deadline</Label>
                  <Input
                    id="protest_deadline"
                    type="date"
                    value={formData.protest_deadline}
                    onChange={(e) => handleChange('protest_deadline', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hearing_period_start">Hearing Period Start</Label>
                  <Input
                    id="hearing_period_start"
                    type="date"
                    value={formData.hearing_period_start}
                    onChange={(e) => handleChange('hearing_period_start', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hearing_period_end">Hearing Period End</Label>
                  <Input
                    id="hearing_period_end"
                    type="date"
                    value={formData.hearing_period_end}
                    onChange={(e) => handleChange('hearing_period_end', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleChange('featured', checked as boolean)}
                  />
                  <Label htmlFor="featured">Featured County</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="page-content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Main Page Content</CardTitle>
              <CardDescription>Content that appears on the county's main page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="page_title">Page Title</Label>
                <Input
                  id="page_title"
                  value={formData.page_title}
                  onChange={(e) => handleChange('page_title', e.target.value)}
                  placeholder="Harris County Property Tax Information"
                />
              </div>
              <div>
                <Label htmlFor="page_content">Main Page Content</Label>
                <SimpleHtmlEditor
                  content={formData.page_content}
                  onChange={(content) => handleChange('page_content', content)}
                  placeholder="Main content about property taxes, protests, and important information for residents of this county..."
                  className="min-h-[300px]"
                  showCopyFromCounty={true}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hero_image_url">Hero Image URL</Label>
                  <Input
                    id="hero_image_url"
                    value={formData.hero_image_url}
                    onChange={(e) => handleChange('hero_image_url', e.target.value)}
                    placeholder="https://example.com/hero-image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="courthouse_image_url">Courthouse Image URL</Label>
                  <Input
                    id="courthouse_image_url"
                    value={formData.courthouse_image_url}
                    onChange={(e) => handleChange('courthouse_image_url', e.target.value)}
                    placeholder="https://example.com/courthouse.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="landscape_image_url">Landscape Image URL</Label>
                  <Input
                    id="landscape_image_url"
                    value={formData.landscape_image_url}
                    onChange={(e) => handleChange('landscape_image_url', e.target.value)}
                    placeholder="https://example.com/landscape.jpg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Additional Content Sections</CardTitle>
              <CardDescription>How-to guide and additional county information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="how_to_content">How-To Content</Label>
                <SimpleHtmlEditor
                  content={formData.how_to_content}
                  onChange={(content) => handleChange('how_to_content', content)}
                  placeholder="Step-by-step process for property tax protests in this county..."
                  className="min-h-[250px]"
                  showCopyFromCounty={true}
                />
              </div>
              <div>
                <Label htmlFor="county_info_content">County Information Content</Label>
                <SimpleHtmlEditor
                  content={formData.county_info_content}
                  onChange={(content) => handleChange('county_info_content', content)}
                  placeholder="General information about property taxes in this county..."
                  className="min-h-[250px]"
                  showCopyFromCounty={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appraisal District Contact Information</CardTitle>
              <CardDescription>Contact details for the county appraisal district</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="appraisal_district_name">Appraisal District Name</Label>
                <Input
                  id="appraisal_district_name"
                  value={formData.appraisal_district_name}
                  onChange={(e) => handleChange('appraisal_district_name', e.target.value)}
                  placeholder="Harris County Appraisal District"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appraisal_district_phone">Phone Number</Label>
                  <Input
                    id="appraisal_district_phone"
                    value={formData.appraisal_district_phone}
                    onChange={(e) => handleChange('appraisal_district_phone', e.target.value)}
                    placeholder="(713) 957-7800"
                  />
                </div>
                <div>
                  <Label htmlFor="appraisal_district_website">Website</Label>
                  <Input
                    id="appraisal_district_website"
                    value={formData.appraisal_district_website}
                    onChange={(e) => handleChange('appraisal_district_website', e.target.value)}
                    placeholder="https://www.hcad.org"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="appraisal_district_address">Address</Label>
                <Input
                  id="appraisal_district_address"
                  value={formData.appraisal_district_address}
                  onChange={(e) => handleChange('appraisal_district_address', e.target.value)}
                  placeholder="13013 Northwest Freeway"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appraisal_district_city">City</Label>
                  <Input
                    id="appraisal_district_city"
                    value={formData.appraisal_district_city}
                    onChange={(e) => handleChange('appraisal_district_city', e.target.value)}
                    placeholder="Houston"
                  />
                </div>
                <div>
                  <Label htmlFor="appraisal_district_zip">ZIP Code</Label>
                  <Input
                    id="appraisal_district_zip"
                    value={formData.appraisal_district_zip}
                    onChange={(e) => handleChange('appraisal_district_zip', e.target.value)}
                    placeholder="77065"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Search engine optimization settings for better visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  placeholder="Harris County Property Tax Protest - Get Your Taxes Reduced"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.meta_title.length}/60 characters (recommended)
                </p>
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  placeholder="Professional property tax protest services for Harris County, Texas. Reduce your property taxes with our expert team."
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.meta_description.length}/160 characters (recommended)
                </p>
              </div>
              <div>
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={(e) => handleChange('meta_keywords', e.target.value)}
                  placeholder="property tax protest, Harris County, tax appeal, tax reduction"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate keywords with commas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
