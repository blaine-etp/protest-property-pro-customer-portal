import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
}

interface EvidenceGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evidence: EvidenceItem[];
  onDelete: (evidenceId: string, filePath: string) => void;
}

export const EvidenceGallery: React.FC<EvidenceGalleryProps> = ({
  open,
  onOpenChange,
  evidence,
  onDelete,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (item: EvidenceItem) => {
    try {
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

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % evidence.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + evidence.length) % evidence.length);
  };

  const openFullscreen = (index: number) => {
    setSelectedIndex(index);
    setFullscreenOpen(true);
  };

  if (!evidence.length) return null;

  return (
    <>
      {/* Gallery Grid Modal */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evidence Gallery</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidence.map((item, index) => (
              <div key={item.id} className="group relative">
                <div 
                  className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => openFullscreen(index)}
                >
                  <img
                    src={`${supabase.storage.from('property-evidence').getPublicUrl(item.file_path).data.publicUrl}`}
                    alt={item.description || item.original_filename}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(item.id, item.file_path)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-lg">
                  <div className="text-white">
                    {item.category && (
                      <Badge variant="secondary" className="mb-1 text-xs">
                        {item.category}
                      </Badge>
                    )}
                    <p className="text-sm font-medium truncate">
                      {item.original_filename}
                    </p>
                    <p className="text-xs opacity-75">
                      {formatDate(item.uploaded_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Modal */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-full max-h-full w-full h-full p-0 bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFullscreenOpen(false)}
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation buttons */}
            {evidence.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Main image */}
            <img
              src={`${supabase.storage.from('property-evidence').getPublicUrl(evidence[selectedIndex]?.file_path).data.publicUrl}`}
              alt={evidence[selectedIndex]?.description || evidence[selectedIndex]?.original_filename}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image info */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="bg-black/60 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {evidence[selectedIndex]?.category && (
                      <Badge variant="secondary" className="mb-2">
                        {evidence[selectedIndex].category}
                      </Badge>
                    )}
                    <h3 className="font-medium">
                      {evidence[selectedIndex]?.original_filename}
                    </h3>
                    {evidence[selectedIndex]?.description && (
                      <p className="text-sm opacity-75 mt-1">
                        {evidence[selectedIndex].description}
                      </p>
                    )}
                    <p className="text-xs opacity-50 mt-2">
                      Uploaded: {formatDate(evidence[selectedIndex]?.uploaded_at || '')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(evidence[selectedIndex])}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        onDelete(evidence[selectedIndex].id, evidence[selectedIndex].file_path);
                        setFullscreenOpen(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Image counter */}
            {evidence.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white bg-black/60 rounded-full px-3 py-1 text-sm">
                {selectedIndex + 1} of {evidence.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};