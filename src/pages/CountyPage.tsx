
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
  hero_image_alt?: string;
  courthouse_image_alt?: string;
  landscape_image_alt?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  structured_data?: any;
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
      // Set document title using meta_title or fallback
      document.title = county.meta_title || county.page_title || `${county.name} County Property Tax Information`;
      
      // Remove existing meta tags and add new ones
      const existingMetas = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]');
      existingMetas.forEach(meta => meta.remove());
      
      const head = document.head;
      
      // Meta description
      const metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      metaDescription.content = county.meta_description || `Property tax information for ${county.name} County, Texas.`;
      head.appendChild(metaDescription);
      
      // Meta keywords
      if (county.meta_keywords) {
        const metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        metaKeywords.content = county.meta_keywords;
        head.appendChild(metaKeywords);
      }
      
      // Open Graph tags
      const ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      ogTitle.content = county.og_title || county.meta_title || county.page_title || `${county.name} County Property Tax Information`;
      head.appendChild(ogTitle);
      
      const ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      ogDescription.content = county.og_description || county.meta_description || `Property tax information for ${county.name} County, Texas.`;
      head.appendChild(ogDescription);
      
      if (county.og_image) {
        const ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        ogImage.content = county.og_image;
        head.appendChild(ogImage);
      }
      
      const ogType = document.createElement('meta');
      ogType.setAttribute('property', 'og:type');
      ogType.content = 'website';
      head.appendChild(ogType);
      
      // Twitter Card tags
      const twitterCard = document.createElement('meta');
      twitterCard.name = 'twitter:card';
      twitterCard.content = 'summary_large_image';
      head.appendChild(twitterCard);
      
      const twitterTitle = document.createElement('meta');
      twitterTitle.name = 'twitter:title';
      twitterTitle.content = county.twitter_title || county.og_title || county.meta_title || county.page_title || `${county.name} County Property Tax Information`;
      head.appendChild(twitterTitle);
      
      const twitterDescription = document.createElement('meta');
      twitterDescription.name = 'twitter:description';
      twitterDescription.content = county.twitter_description || county.og_description || county.meta_description || `Property tax information for ${county.name} County, Texas.`;
      head.appendChild(twitterDescription);
      
      if (county.twitter_image) {
        const twitterImage = document.createElement('meta');
        twitterImage.name = 'twitter:image';
        twitterImage.content = county.twitter_image;
        head.appendChild(twitterImage);
      }
      
      // Canonical URL
      if (county.canonical_url) {
        const canonical = document.createElement('link');
        canonical.rel = 'canonical';
        canonical.href = county.canonical_url;
        head.appendChild(canonical);
      }
      
      // Structured Data (JSON-LD)
      const existingStructuredData = document.querySelector('script[type="application/ld+json"]');
      if (existingStructuredData) {
        existingStructuredData.remove();
      }
      
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "GovernmentOffice",
        "name": `${county.name} County Appraisal District`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": county.appraisal_district_address,
          "addressLocality": county.appraisal_district_city,
          "addressRegion": county.state,
          "postalCode": county.appraisal_district_zip
        },
        "telephone": county.appraisal_district_phone,
        "url": county.appraisal_district_website,
        "description": county.meta_description || `Property tax information for ${county.name} County, Texas.`,
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": `${county.name} County, ${county.state}`
        }
      };
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      head.appendChild(script);
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
          landscape_image_url: updatedCounty.landscape_image_url,
          hero_image_alt: updatedCounty.hero_image_alt,
          courthouse_image_alt: updatedCounty.courthouse_image_alt,
          landscape_image_alt: updatedCounty.landscape_image_alt,
          meta_title: updatedCounty.meta_title,
          meta_description: updatedCounty.meta_description,
          meta_keywords: updatedCounty.meta_keywords,
          og_title: updatedCounty.og_title,
          og_description: updatedCounty.og_description,
          og_image: updatedCounty.og_image,
          twitter_title: updatedCounty.twitter_title,
          twitter_description: updatedCounty.twitter_description,
          twitter_image: updatedCounty.twitter_image,
          canonical_url: updatedCounty.canonical_url,
          structured_data: updatedCounty.structured_data
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
