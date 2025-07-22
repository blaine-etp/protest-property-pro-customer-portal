
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Calendar, 
  Phone, 
  Globe, 
  Building, 
  Clock, 
  Upload,
  Image as ImageIcon,
  Edit3,
  Save,
  X
} from "lucide-react";

interface County {
  id: string;
  name: string;
  slug: string;
  state: string;
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
  county_info_content?: string;
  page_title?: string;
  page_content?: string;
  hero_image_url?: string;
  courthouse_image_url?: string;
  landscape_image_url?: string;
  meta_description?: string;
}

interface CountyBasicsTemplateProps {
  county: County;
  isEditMode?: boolean;
  onSave?: (updatedCounty: County) => void;
}

export function CountyBasicsTemplate({ 
  county, 
  isEditMode = false, 
  onSave 
}: CountyBasicsTemplateProps) {
  const [editMode, setEditMode] = useState(isEditMode);
  const [editedCounty, setEditedCounty] = useState(county);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (file: File, section: string) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${county.slug}-${section}-${Date.now()}.${fileExt}`;
      const filePath = `county-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setEditedCounty(prev => ({
        ...prev,
        [`${section}_image_url`]: publicUrl
      }));

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedCounty);
    }
    setEditMode(false);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        {editedCounty.hero_image_url ? (
          <img 
            src={editedCounty.hero_image_url} 
            alt={`${county.name} County`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
            {editMode && (
              <div className="text-center space-y-4">
                <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground" />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleImageUpload(file, 'hero');
                    };
                    input.click();
                  }}
                  disabled={uploading}
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Hero Image'}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Hero Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{county.state}</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {county.name} County
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              {county.meta_description || 
               `Everything you need to know about property taxes in ${county.name} County, Texas.`}
            </p>
            
            {editMode && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditMode(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick Facts Section */}
        <Card className="mb-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-foreground">Quick Facts</h2>
              {!editMode && onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Page
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-lg">{county.current_tax_year || 'Current'}</h3>
                <p className="text-sm text-muted-foreground">Tax Year</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-secondary/5">
                <Clock className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <h3 className="font-semibold text-lg">
                  {county.protest_deadline ? formatDate(county.protest_deadline) : 'Check District'}
                </h3>
                <p className="text-sm text-muted-foreground">Protest Deadline</p>
              </div>
              
              {county.appraisal_district_name && (
                <div className="text-center p-4 rounded-lg bg-accent/5">
                  <Building className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <h3 className="font-semibold text-lg break-words">
                    {county.appraisal_district_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Appraisal District</p>
                </div>
              )}
              
              {county.appraisal_district_phone && (
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <Phone className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">{county.appraisal_district_phone}</h3>
                  <p className="text-sm text-muted-foreground">District Phone</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="page_title">Page Title</Label>
                      <Input
                        id="page_title"
                        value={editedCounty.page_title || ''}
                        onChange={(e) => setEditedCounty(prev => ({ ...prev, page_title: e.target.value }))}
                        placeholder="County Property Tax Information"
                      />
                    </div>
                    <div>
                      <Label htmlFor="page_content">Page Content</Label>
                      <Textarea
                        id="page_content"
                        value={editedCounty.page_content || ''}
                        onChange={(e) => setEditedCounty(prev => ({ ...prev, page_content: e.target.value }))}
                        className="min-h-[300px] resize-none"
                        placeholder="Enter the main content for this county page..."
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-3xl font-bold mb-6">
                      {county.page_title || `${county.name} County Property Tax Information`}
                    </h2>
                    <div className="prose max-w-none">
                      {county.page_content ? (
                        <div className="whitespace-pre-wrap text-lg leading-relaxed">
                          {county.page_content}
                        </div>
                      ) : (
                        <div className="text-muted-foreground italic text-center py-8">
                          No content available. Click "Edit Page" to add content.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Section */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">County Highlights</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['courthouse', 'landscape'].map((section) => (
                    <div key={section} className="relative group">
                      {editedCounty[`${section}_image_url` as keyof County] ? (
                        <img
                          src={editedCounty[`${section}_image_url` as keyof County] as string}
                          alt={`${county.name} ${section}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground capitalize">{section} Image</p>
                          </div>
                        </div>
                      )}
                      
                      {editMode && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleImageUpload(file, section);
                              };
                              input.click();
                            }}
                            disabled={uploading}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  {county.appraisal_district_name && (
                    <div>
                      <div className="flex items-start gap-3">
                        <Building className="w-5 h-5 mt-1 text-primary" />
                        <div>
                          <p className="font-semibold">{county.appraisal_district_name}</p>
                          {county.appraisal_district_address && (
                            <p className="text-sm text-muted-foreground">
                              {county.appraisal_district_address}<br />
                              {county.appraisal_district_city}, {county.state} {county.appraisal_district_zip}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {county.appraisal_district_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <span>{county.appraisal_district_phone}</span>
                    </div>
                  )}
                  
                  {county.appraisal_district_website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <a 
                        href={county.appraisal_district_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Important Dates */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Important Dates</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Protest Deadline:</span>
                    <Badge variant="outline">
                      {county.protest_deadline ? formatDate(county.protest_deadline) : 'TBD'}
                    </Badge>
                  </div>
                  
                  {county.hearing_period_start && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Hearing Period:</span>
                      <Badge variant="secondary">
                        {formatDate(county.hearing_period_start)} - {formatDate(county.hearing_period_end)}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
