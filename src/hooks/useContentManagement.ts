
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService, SiteContent } from '@/services/contentService';
import { useToast } from '@/hooks/use-toast';

export const useContentBySection = (section: string) => {
  return useQuery({
    queryKey: ['content', section],
    queryFn: () => contentService.getContentBySection(section),
  });
};

export const useContentBySectionAndKey = (section: string, key: string) => {
  return useQuery({
    queryKey: ['content', section, key],
    queryFn: () => contentService.getContentBySectionAndKey(section, key),
  });
};

export const useAllContent = () => {
  return useQuery({
    queryKey: ['content', 'all'],
    queryFn: () => contentService.getAllContent(),
  });
};

export const useUpdateContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: Partial<SiteContent> }) =>
      contentService.updateContent(id, content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast({
        title: 'Content Updated',
        description: 'Content has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update content. Please try again.',
        variant: 'destructive',
      });
      console.error('Content update error:', error);
    },
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (content: Omit<SiteContent, 'id' | 'created_at' | 'updated_at' | 'created_by'>) =>
      contentService.createContent(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast({
        title: 'Content Created',
        description: 'Content has been successfully created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create content. Please try again.',
        variant: 'destructive',
      });
      console.error('Content creation error:', error);
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => contentService.deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast({
        title: 'Content Deleted',
        description: 'Content has been successfully deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Deletion Failed',
        description: 'Failed to delete content. Please try again.',
        variant: 'destructive',
      });
      console.error('Content deletion error:', error);
    },
  });
};
