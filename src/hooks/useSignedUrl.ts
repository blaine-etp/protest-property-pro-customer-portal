import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSignedUrlResult {
  signedUrl: string | null;
  loading: boolean;
  error: string | null;
}

export const useSignedUrl = (bucket: string, path: string, expiresIn: number = 7200): UseSignedUrlResult => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bucket || !path) {
      setLoading(false);
      return;
    }

    const generateSignedUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, expiresIn);

        if (error) throw error;
        
        setSignedUrl(data.signedUrl);
      } catch (err: any) {
        console.error('Error generating signed URL:', err);
        setError(err.message || 'Failed to generate signed URL');
        setSignedUrl(null);
      } finally {
        setLoading(false);
      }
    };

    generateSignedUrl();
  }, [bucket, path, expiresIn]);

  return { signedUrl, loading, error };
};

// Hook for multiple signed URLs
export const useSignedUrls = (bucket: string, paths: string[], expiresIn: number = 7200) => {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bucket || !paths.length) {
      setLoading(false);
      return;
    }

    const generateSignedUrls = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const urlPromises = paths.map(async (path) => {
          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);
            
          if (error) throw error;
          return { path, signedUrl: data.signedUrl };
        });

        const results = await Promise.all(urlPromises);
        const urlMap = results.reduce((acc, { path, signedUrl }) => {
          acc[path] = signedUrl;
          return acc;
        }, {} as Record<string, string>);
        
        setSignedUrls(urlMap);
      } catch (err: any) {
        console.error('Error generating signed URLs:', err);
        setError(err.message || 'Failed to generate signed URLs');
        setSignedUrls({});
      } finally {
        setLoading(false);
      }
    };

    generateSignedUrls();
  }, [bucket, paths.join(','), expiresIn]);

  return { signedUrls, loading, error };
};