// Supabase Storage Service
// Real Supabase storage operations

import { supabase } from '@/integrations/supabase/client';

class SupabaseStorageService {
  // List files in a bucket
  async listFiles(bucket: string, path?: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path || '');

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error listing files:', error);
      return { data: null, error };
    }
  }

  // Upload a file to storage
  async uploadFile(bucket: string, path: string, file: File) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (error) throw error;

      console.log(`Uploaded file ${path} to bucket ${bucket}`);
      return { data, error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
  }

  // Download a file from storage
  async downloadFile(bucket: string, path: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) throw error;
      if (!data) throw new Error('No data returned from download');

      return data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // Get public URL for a file
  getPublicUrl(bucket: string, path: string) {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return { data };
    } catch (error) {
      console.error('Error getting public URL:', error);
      throw error;
    }
  }

  // Remove files from storage
  async removeFile(bucket: string, paths: string[]) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) throw error;

      console.log(`Removed ${paths.length} file(s) from bucket ${bucket}`);
      return { data, error: null };
    } catch (error) {
      console.error('Error removing files:', error);
      return { data: null, error };
    }
  }

  // Get files for a specific user (not implemented in Supabase storage directly)
  async getUserFiles(userId: string, bucket: string) {
    // This would need to be implemented using database queries
    // to track user ownership of files
    console.warn('getUserFiles not implemented for Supabase storage');
    return [];
  }

  // Create a bucket
  async createBucket(name: string, options: { public?: boolean } = {}) {
    try {
      const bucketOptions = {
        public: options.public ?? false
      };
      
      const { data, error } = await supabase.storage
        .createBucket(name, bucketOptions);

      if (error) throw error;

      console.log(`Created bucket ${name} (public: ${bucketOptions.public})`);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating bucket:', error);
      return { data: null, error };
    }
  }

  // Get bucket details
  async getBucket(name: string) {
    try {
      const { data, error } = await supabase.storage
        .getBucket(name);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting bucket:', error);
      return { data: null, error };
    }
  }

  // Generate signed URL for private downloads
  async createSignedUrl(bucket: string, path: string, expiresIn: number = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return { data: null, error };
    }
  }
}

// Export singleton instance
export const supabaseStorageService = new SupabaseStorageService();