import { supabase } from "@/integrations/supabase/client";

export interface SiteContentData {
  [key: string]: any;
}

export const siteContentService = {
  async getSiteContent(contentKey: string): Promise<SiteContentData | null> {
    const { data, error } = await supabase
      .from('site_content')
      .select('content_value')
      .eq('content_key', contentKey)
      .single();

    if (error) {
      console.error('Error fetching site content:', error);
      return null;
    }

    return (data?.content_value as SiteContentData) || null;
  },

  async updateSiteContent(contentKey: string, contentType: string, contentValue: SiteContentData): Promise<boolean> {
    const { error } = await supabase
      .from('site_content')
      .upsert({
        content_key: contentKey,
        content_type: contentType,
        content_value: contentValue
      });

    if (error) {
      console.error('Error updating site content:', error);
      return false;
    }

    return true;
  }
};