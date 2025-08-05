import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Camera, FileImage } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EvidenceUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  taxYear: number;
  onUploadSuccess: () => void;
}

interface FileWithPreview extends File {
  id: string;
  preview: string;
}

const EVIDENCE_CATEGORIES = [
  'Property Damage',
  'Maintenance Issues',
  'Environmental Issues',
  'Infrastructure Problems',
  'Neighborhood Issues',
  'Other'
];

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  open,
  onOpenChange,
  propertyId,
  taxYear,
  onUploadSuccess,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const newFiles: FileWithPreview[] = selectedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.id = Math.random().toString(36).substr(2, 9);
      fileWithPreview.preview = URL.createObjectURL(file);
      return fileWithPreview;
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Clean up preview URL
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Get current protest for this property and tax year
      const { data: protests } = await supabase
        .from('protests')
        .select('id')
        .eq('property_id', propertyId)
        .eq('tax_year', taxYear)
        .single();

      const protestId = protests?.id || null;

      // Get contact info from property
      const { data: property } = await supabase
        .from('properties')
        .select('contact_id')
        .eq('id', propertyId)
        .single();

      const contactId = property?.contact_id || null;

      for (const file of files) {
        // Generate unique file path
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
        const filePath = `${propertyId}/${taxYear}/${fileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('property-evidence')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('evidence_uploads')
          .insert({
            property_id: propertyId,
            protest_id: protestId,
            contact_id: contactId,
            file_path: filePath,
            original_filename: file.name,
            file_size: file.size,
            content_type: file.type,
            category: category || null,
            description: description || null,
            tax_year: taxYear,
          });

        if (dbError) throw dbError;
      }

      // Clean up preview URLs
      files.forEach(file => URL.revokeObjectURL(file.preview));
      
      // Reset form
      setFiles([]);
      setCategory('');
      setDescription('');
      
      onUploadSuccess();
    } catch (error: any) {
      console.error('Error uploading evidence:', error);
      toast({
        title: "Error",
        description: "Failed to upload evidence files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!uploading) {
      // Clean up preview URLs
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
      setCategory('');
      setDescription('');
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Evidence - {taxYear}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload">Select Images</Label>
            <div className="mt-2">
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select images or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG up to 10MB each
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* File Previews */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((file) => (
                <div key={file.id} className="relative group">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs text-white bg-black/50 rounded px-2 py-1 truncate">
                      {file.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Category */}
          <div>
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={category} onValueChange={setCategory} disabled={uploading}>
              <SelectTrigger>
                <SelectValue placeholder="Select evidence category" />
              </SelectTrigger>
              <SelectContent>
                {EVIDENCE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the evidence shows and how it affects property value..."
              disabled={uploading}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleModalClose(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.length} file{files.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};