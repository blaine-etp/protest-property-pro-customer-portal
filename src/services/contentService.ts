
import { supabase } from "@/integrations/supabase/client";

export interface SiteContent {
  id: string;
  section: string;
  content_key: string;
  content_type: 'text' | 'rich_text' | 'image' | 'link' | 'json_array' | 'json_object';
  content_value: string | null;
  content_metadata: Record<string, any>;
  status: 'draft' | 'published';
  version_number: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export class ContentService {
  async getContentBySection(section: string): Promise<SiteContent[]> {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', section)
      .eq('status', 'published')
      .order('content_key');

    if (error) throw error;
    return data || [];
  }

  async getContentBySectionAndKey(section: string, key: string): Promise<SiteContent | null> {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', section)
      .eq('content_key', key)
      .eq('status', 'published')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async getAllContent(): Promise<SiteContent[]> {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('status', 'published')
      .order('section', { ascending: true })
      .order('content_key', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updateContent(id: string, content: Partial<SiteContent>): Promise<SiteContent> {
    const { data, error } = await supabase
      .from('site_content')
      .update(content)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createContent(content: Omit<SiteContent, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<SiteContent> {
    const { data, error } = await supabase
      .from('site_content')
      .insert(content)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteContent(id: string): Promise<void> {
    const { error } = await supabase
      .from('site_content')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Helper method to parse JSON content
  parseJsonContent(content: SiteContent): any {
    if (!content.content_value) return null;
    
    try {
      if (content.content_type === 'json_array' || content.content_type === 'json_object') {
        return JSON.parse(content.content_value);
      }
      return content.content_value;
    } catch (error) {
      console.error('Failed to parse JSON content:', error);
      return content.content_value;
    }
  }
}

export const contentService = new ContentService();
