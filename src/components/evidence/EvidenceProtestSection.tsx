import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Download, Eye, FileImage, Package } from 'lucide-react';
import { EvidenceGallery } from './EvidenceGallery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EvidenceItem {
  id: string;
  file_path: string;
  original_filename: string;
  description?: string;
  category?: string;
  uploaded_at: string;
  tax_year: number;
  file_size: number;
  content_type: string;
}

interface EvidenceProtestSectionProps {
  protestId: string;
  propertyId?: string;
  taxYear?: number;
}

export const EvidenceProtestSection: React.FC<EvidenceProtestSectionProps> = ({ 
  protestId,
  propertyId,
  taxYear 
}) => {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvidence();
  }, [protestId, propertyId, taxYear]);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      
      let finalPropertyId = propertyId;
      let finalTaxYear = taxYear;

      // If we don't have property info, get it from the protest
      if (!finalPropertyId || !finalTaxYear) {
        const { data: protestData, error: protestError } = await supabase
          .from('protests')
          .select('property_id, tax_year')
          .eq('id', protestId)
          .single();

        if (protestError) throw protestError;
        
        finalPropertyId = finalPropertyId || protestData.property_id;
        finalTaxYear = finalTaxYear || protestData.tax_year;
      }

      if (!finalPropertyId) {
        setEvidence([]);
        return;
      }

      const { data, error } = await supabase
        .from('evidence_uploads')
        .select('*')
        .eq('property_id', finalPropertyId)
        .eq('tax_year', finalTaxYear)
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

  const downloadAllEvidence = async () => {
    if (!evidence.length) return;

    setDownloadingAll(true);
    try {
      // For now, download files individually
      // In a production app, you'd want to create a zip file
      for (const item of evidence) {
        const { data, error } = await supabase.storage
          .from('property-evidence')
          .download(item.file_path);

        if (error) throw error;

        // Create download link
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = item.original_filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Success",
        description: `Downloaded ${evidence.length} evidence files`,
      });
    } catch (error: any) {
      console.error('Error downloading evidence:', error);
      toast({
        title: "Error",
        description: "Failed to download evidence files",
        variant: "destructive",
      });
    } finally {
      setDownloadingAll(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryStats = () => {
    const categories = evidence.reduce((acc, item) => {
      const cat = item.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories);
  };

  const getTotalSize = () => {
    const totalBytes = evidence.reduce((sum, item) => sum + (item.file_size || 0), 0);
    return formatFileSize(totalBytes);
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Customer Evidence ({taxYear || 'N/A'})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Evidence Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{evidence.length}</p>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{getTotalSize()}</p>
              <p className="text-sm text-muted-foreground">Total Size</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{getCategoryStats().length}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {evidence.length > 0 ? formatDate(evidence[0].uploaded_at) : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Latest Upload</p>
            </div>
          </div>

          {/* Category Breakdown */}
          {evidence.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Evidence Categories</h4>
              <div className="flex flex-wrap gap-2">
                {getCategoryStats().map(([category, count]) => (
                  <Badge key={category} variant="secondary">
                    {category}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {evidence.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGalleryOpen(true)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Gallery ({evidence.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAllEvidence}
                  disabled={downloadingAll}
                >
                  <Package className="h-4 w-4 mr-1" />
                  {downloadingAll ? 'Downloading...' : 'Download All'}
                </Button>
              </>
            )}
          </div>

          {/* Evidence Preview Grid */}
          {evidence.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {evidence.slice(0, 6).map((item) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={`${supabase.storage.from('property-evidence').getPublicUrl(item.file_path).data.publicUrl}`}
                      alt={item.description || item.original_filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {item.category && (
                    <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">
                      {item.category}
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg">
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-background/80 rounded px-1">
                        <span className="text-xs">{formatFileSize(item.file_size)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {evidence.length > 6 && (
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    +{evidence.length - 6} more
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileImage className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No evidence uploaded by customer</p>
              <p className="text-xs">Evidence will appear here when customers upload files for this property</p>
            </div>
          )}
        </CardContent>
      </Card>

      <EvidenceGallery
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        evidence={evidence}
        onDelete={handleDeleteEvidence}
      />
    </>
  );
};