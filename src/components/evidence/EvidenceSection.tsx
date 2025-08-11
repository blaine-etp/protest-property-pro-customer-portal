import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Trash2, Eye } from 'lucide-react';
import { EvidenceUploadModal } from './EvidenceUploadModal';
import { EvidenceGallery } from './EvidenceGallery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSignedUrls } from '@/hooks/useSignedUrl';

interface EvidenceItem {
  id: string;
  file_path: string;
  original_filename: string;
  description?: string;
  category?: string;
  uploaded_at: string;
  tax_year: number;
}

interface EvidenceSectionProps {
  propertyId: string;
  taxYear?: number;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({ 
  propertyId, 
  taxYear = new Date().getFullYear() 
}) => {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { toast } = useToast();

  // Get signed URLs for evidence images
  const evidencePaths = evidence.map(item => item.file_path);
  const { signedUrls, loading: urlsLoading } = useSignedUrls('property-evidence', evidencePaths, 7200);

  useEffect(() => {
    fetchEvidence();
  }, [propertyId, taxYear]);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('evidence_uploads')
        .select('*')
        .eq('property_id', propertyId)
        .eq('tax_year', taxYear)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setEvidence(data || []);
    } catch (error: any) {
      console.error('Error fetching evidence:', error);
      toast({
        title: "Error",
        description: "Failed to load evidence files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchEvidence();
    setUploadModalOpen(false);
    toast({
      title: "Success",
      description: "Evidence uploaded successfully",
    });
  };

  const handleDeleteEvidence = async (evidenceId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('property-evidence')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('evidence_uploads')
        .delete()
        .eq('id', evidenceId);

      if (dbError) throw dbError;

      // Update local state
      setEvidence(prev => prev.filter(item => item.id !== evidenceId));
      
      toast({
        title: "Success",
        description: "Evidence deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting evidence:', error);
      toast({
        title: "Error",
        description: "Failed to delete evidence",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium">Evidence ({taxYear})</h4>
              <p className="text-sm text-muted-foreground">
                {evidence.length} file{evidence.length !== 1 ? 's' : ''} uploaded
              </p>
            </div>
            <div className="flex gap-2">
              {evidence.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGalleryOpen(true)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadModalOpen(true)}
              >
                <Camera className="h-4 w-4 mr-1" />
                Upload Evidence
              </Button>
            </div>
          </div>

          {evidence.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {evidence.slice(0, 4).map((item) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    {urlsLoading || !signedUrls[item.file_path] ? (
                      <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                    ) : (
                      <img
                        src={signedUrls[item.file_path]}
                        alt={item.description || item.original_filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-muted flex items-center justify-center"><span class="text-sm text-muted-foreground">Failed to load</span></div>';
                        }}
                      />
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEvidence(item.id, item.file_path)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  {item.category && (
                    <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">
                      {item.category}
                    </Badge>
                  )}
                </div>
              ))}
              {evidence.length > 4 && (
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    +{evidence.length - 4} more
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No evidence uploaded yet</p>
              <p className="text-xs">Upload photos of property issues to support your tax appeal</p>
            </div>
          )}
        </CardContent>
      </Card>

      <EvidenceUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        propertyId={propertyId}
        taxYear={taxYear}
        onUploadSuccess={handleUploadSuccess}
      />

      <EvidenceGallery
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        evidence={evidence}
        onDelete={handleDeleteEvidence}
      />
    </>
  );
};