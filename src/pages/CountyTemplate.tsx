
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

export function CountyTemplate() {
  const { slug } = useParams<{ slug: string }>();
  const [county, setCounty] = useState<County | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

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
    />
  );
}
