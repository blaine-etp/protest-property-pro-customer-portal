
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CountyBasicsTemplate } from "@/components/CountyBasicsTemplate";
import { useToast } from "@/hooks/use-toast";

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
  meta_title?: string;
  meta_description?: string;
  status: string;
}

export function CountyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [county, setCounty] = useState<County | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (county) {
      document.title = county.page_title || `${county.name} County Property Tax Information`;
      
      // Set meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          county.meta_description || `Property tax information for ${county.name} County, Texas.`
        );
      }
    }
  }, [county]);

  useEffect(() => {
    if (slug) {
      fetchCounty(slug);
    }
  }, [slug]);

  const fetchCounty = async (pageSlug: string) => {
    try {
      const { data: countyData, error: countyError } = await supabase
        .from('counties')
        .select('*')
        .eq('slug', pageSlug)
        .eq('status', 'published')
        .single();

      if (countyError || !countyData) {
        setNotFound(true);
        return;
      }

      setCounty(countyData);
    } catch (error) {
      console.error('Error fetching county:', error);
      toast({
        title: "Error",
        description: "Failed to load county information",
        variant: "destructive",
      });
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCounty = async (updatedCounty: County) => {
    if (!county) return;

    try {
      const { error } = await supabase
        .from('counties')
        .update({
          page_title: updatedCounty.page_title,
          page_content: updatedCounty.page_content,
          hero_image_url: updatedCounty.hero_image_url,
          courthouse_image_url: updatedCounty.courthouse_image_url,
          landscape_image_url: updatedCounty.landscape_image_url
        })
        .eq('id', county.id);

      if (error) throw error;

      setCounty(updatedCounty);
      toast({
        title: "Success",
        description: "County page updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating county:', error);
      toast({
        title: "Error",
        description: "Failed to update county page",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !county) {
    return <Navigate to="/404" replace />;
  }

  return (
    <CountyBasicsTemplate
      county={county}
      onSave={handleSaveCounty}
    />
  );
}
