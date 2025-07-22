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
  meta_description?: string;
  status: string;
}

interface CountyPage {
  id: string;
  title: string;
  content: string;
  meta_description?: string;
  status: string;
}

export function CountyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [county, setCounty] = useState<County | null>(null);
  const [page, setPage] = useState<CountyPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchCountyAndPage(slug);
    }
  }, [slug]);

  // Set page title and meta description
  useEffect(() => {
    if (page && county) {
      document.title = page.meta_description ? 
        `${page.title} | ${page.meta_description}` : 
        `${page.title} | ${county.name} County Tax Information`;
      
      // Set meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          page.meta_description || `Property tax information for ${county.name} County, Texas.`
        );
      }
    }
  }, [page, county]);

  const fetchCountyAndPage = async (pageSlug: string) => {
    try {
      // First, try to find the page by slug
      const { data: pageData, error: pageError } = await supabase
        .from('county_pages')
        .select(`
          *,
          counties (*)
        `)
        .eq('slug', pageSlug)
        .eq('status', 'published')
        .single();

      if (pageError || !pageData) {
        // If no direct page match, try to find county by slug for basics page
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

        // Look for a basics page for this county
        const { data: basicsPage, error: basicsError } = await supabase
          .from('county_pages')
          .select('*')
          .eq('county_id', countyData.id)
          .eq('page_type', 'basics')
          .eq('status', 'published')
          .single();

        if (basicsError || !basicsPage) {
          // Create a default basics page structure
          setCounty(countyData);
          setPage({
            id: 'default',
            title: `${countyData.name} County Property Tax Basics`,
            content: countyData.county_info_content || '',
            meta_description: countyData.meta_description,
            status: 'published'
          });
        } else {
          setCounty(countyData);
          setPage(basicsPage);
        }
      } else {
        setCounty(pageData.counties);
        setPage({
          id: pageData.id,
          title: pageData.title,
          content: pageData.content,
          meta_description: pageData.meta_description,
          status: pageData.status
        });
      }
    } catch (error) {
      console.error('Error fetching county page:', error);
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

  const handleSavePage = async (updatedPage: CountyPage) => {
    if (!county || !page || page.id === 'default') return;

    try {
      const { error } = await supabase
        .from('county_pages')
        .update({
          content: updatedPage.content,
          title: updatedPage.title
        })
        .eq('id', page.id);

      if (error) throw error;

      setPage(updatedPage);
      toast({
        title: "Success",
        description: "Page updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating page:', error);
      toast({
        title: "Error",
        description: "Failed to update page",
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

  if (notFound || !county || !page) {
    return <Navigate to="/404" replace />;
  }

  return (
    <CountyBasicsTemplate
      county={county}
      page={page}
      onSave={handleSavePage}
    />
  );
}