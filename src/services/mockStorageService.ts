// Mock Storage Service
// Replaces all Supabase storage operations with localStorage simulation

interface MockStorageFile {
  id: string;
  name: string;
  bucket_id: string;
  owner: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  content_type: string;
  size: number;
  url: string; // Mock URL for display
}

class MockStorageService {
  private readonly MOCK_FILES_KEY = 'mock_storage_files';

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const existingFiles = this.getMockFiles();
    if (existingFiles.length === 0) {
      // Create some sample documents
      const sampleFiles: MockStorageFile[] = [
        {
          id: 'file-1',
          name: 'customer-1/form-50-162.pdf',
          bucket_id: 'customer-documents',
          owner: 'customer-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
          content_type: 'application/pdf',
          size: 245760,
          url: '/mock-documents/form-50-162.pdf'
        },
        {
          id: 'file-2',
          name: 'customer-1/services-agreement.pdf',
          bucket_id: 'customer-documents',
          owner: 'customer-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
          content_type: 'application/pdf',
          size: 189440,
          url: '/mock-documents/services-agreement.pdf'
        },
        {
          id: 'file-3',
          name: 'templates/form-50-162-template.pdf',
          bucket_id: 'pdf-templates',
          owner: 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
          content_type: 'application/pdf',
          size: 123456,
          url: '/mock-templates/form-50-162-template.pdf'
        }
      ];

      localStorage.setItem(this.MOCK_FILES_KEY, JSON.stringify(sampleFiles));
    }
  }

  private getMockFiles(): MockStorageFile[] {
    const files = localStorage.getItem(this.MOCK_FILES_KEY);
    return files ? JSON.parse(files) : [];
  }

  // Simulate supabase.storage.from(bucket).list()
  async listFiles(bucket: string, path?: string) {
    await new Promise(resolve => setTimeout(resolve, 200));

    const files = this.getMockFiles();
    let filteredFiles = files.filter(f => f.bucket_id === bucket);

    if (path) {
      filteredFiles = filteredFiles.filter(f => f.name.startsWith(path));
    }

    return {
      data: filteredFiles.map(f => ({
        name: f.name,
        id: f.id,
        updated_at: f.updated_at,
        created_at: f.created_at,
        last_accessed_at: f.last_accessed_at,
        metadata: {
          size: f.size,
          mimetype: f.content_type
        }
      })),
      error: null
    };
  }

  // Simulate supabase.storage.from(bucket).upload()
  async uploadFile(bucket: string, path: string, file: File) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newFile: MockStorageFile = {
      id: `file-${Date.now()}`,
      name: path,
      bucket_id: bucket,
      owner: 'current-user', // In real app, this would be auth.uid()
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      content_type: file.type,
      size: file.size,
      url: `/mock-uploads/${path}`
    };

    const files = this.getMockFiles();
    files.push(newFile);
    localStorage.setItem(this.MOCK_FILES_KEY, JSON.stringify(files));

    console.log(`Mock: Uploaded file ${path} to bucket ${bucket}`);

    return {
      data: {
        path: path,
        id: newFile.id,
        fullPath: `${bucket}/${path}`
      },
      error: null
    };
  }

  // Simulate supabase.storage.from(bucket).download()
  async downloadFile(bucket: string, path: string): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const files = this.getMockFiles();
    const file = files.find(f => f.bucket_id === bucket && f.name === path);

    if (!file) {
      throw new Error('File not found');
    }

    // Return a mock blob directly
    const mockContent = `Mock content for ${path}`;
    return new Blob([mockContent], { type: file.content_type });
  }

  // Simulate supabase.storage.from(bucket).getPublicUrl()
  getPublicUrl(bucket: string, path: string) {
    // Return mock public URL
    return {
      data: {
        publicUrl: `/mock-storage/${bucket}/${path}`
      }
    };
  }

  // Simulate supabase.storage.from(bucket).remove()
  async removeFile(bucket: string, paths: string[]) {
    await new Promise(resolve => setTimeout(resolve, 200));

    const files = this.getMockFiles();
    const remainingFiles = files.filter(f => 
      !(f.bucket_id === bucket && paths.includes(f.name))
    );

    localStorage.setItem(this.MOCK_FILES_KEY, JSON.stringify(remainingFiles));

    console.log(`Mock: Removed ${paths.length} file(s) from bucket ${bucket}`);

    return {
      data: paths.map(path => ({ name: path })),
      error: null
    };
  }

  // Get files for a specific user
  async getUserFiles(userId: string, bucket: string) {
    await new Promise(resolve => setTimeout(resolve, 200));

    const files = this.getMockFiles();
    return files.filter(f => 
      f.bucket_id === bucket && 
      (f.owner === userId || f.name.startsWith(`${userId}/`))
    );
  }

  // Clear all mock storage data
  clearMockStorage() {
    localStorage.removeItem(this.MOCK_FILES_KEY);
    this.initializeMockData();
  }

  // Create a bucket (mock)
  async createBucket(name: string, options: { public?: boolean } = {}) {
    console.log(`Mock: Created bucket ${name} (public: ${options.public})`);
    return { data: { name }, error: null };
  }

  // Get bucket details (mock)
  async getBucket(name: string) {
    return {
      data: {
        id: name,
        name: name,
        public: true, // For mock purposes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    };
  }
}

// Export singleton instance
export const mockStorageService = new MockStorageService();

// Export types
export type { MockStorageFile };