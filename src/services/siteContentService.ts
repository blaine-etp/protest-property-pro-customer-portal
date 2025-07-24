import { supabase } from "@/integrations/supabase/client";

export interface SiteContentItem {
  id: string;
  content_type: string;
  content_key: string;
  content_value: any;
  created_at: string;
  updated_at: string;
}

export const siteContentService = {
  async getContentByType(contentType: string) {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('content_type', contentType);
    
    if (error) throw error;
    return data;
  },

  async getContentByKey(contentType: string, contentKey: string) {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('content_type', contentType)
      .eq('content_key', contentKey)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async upsertContent(contentType: string, contentKey: string, contentValue: any) {
    const { data, error } = await supabase
      .from('site_content')
      .upsert({
        content_type: contentType,
        content_key: contentKey,
        content_value: contentValue
      }, {
        onConflict: 'content_type,content_key'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteContent(contentType: string, contentKey: string) {
    const { error } = await supabase
      .from('site_content')
      .delete()
      .eq('content_type', contentType)
      .eq('content_key', contentKey);
    
    if (error) throw error;
  }
};