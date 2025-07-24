
import { useContentBySection, useContentBySectionAndKey } from './useContentManagement';
import { contentService } from '@/services/contentService';
import { useMemo } from 'react';

// Hook for getting content with fallback values
export const useSiteContent = (section: string, key: string, fallback: any = null) => {
  const { data: content, isLoading, error } = useContentBySectionAndKey(section, key);
  
  return useMemo(() => {
    if (isLoading) return { value: fallback, isLoading: true, error: null };
    if (error) return { value: fallback, isLoading: false, error };
    if (!content) return { value: fallback, isLoading: false, error: null };
    
    const parsedValue = contentService.parseJsonContent(content);
    return { value: parsedValue, isLoading: false, error: null };
  }, [content, isLoading, error, fallback]);
};

// Hook for getting all content in a section
export const useSectionContent = (section: string) => {
  const { data: contentList, isLoading, error } = useContentBySection(section);
  
  return useMemo(() => {
    if (isLoading) return { content: {}, isLoading: true, error: null };
    if (error) return { content: {}, isLoading: false, error };
    if (!contentList) return { content: {}, isLoading: false, error: null };
    
    const contentMap = contentList.reduce((acc, item) => {
      acc[item.content_key] = contentService.parseJsonContent(item);
      return acc;
    }, {} as Record<string, any>);
    
    return { content: contentMap, isLoading: false, error: null };
  }, [contentList, isLoading, error]);
};
