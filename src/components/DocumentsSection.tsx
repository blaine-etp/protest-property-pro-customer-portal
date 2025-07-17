import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, File, Loader2 } from 'lucide-react';
import { storageService, dataService } from '@/services';
import { useToast } from '@/hooks/use-toast';

interface CustomerDocument {
  id: string;
  document_type: string;
  file_path: string;
  generated_at: string;
  status: string;
  property_id: string;
}

interface DocumentsSectionProps {
  propertyId: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ propertyId }) => {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [propertyId]);

  const fetchDocuments = async () => {
    try {
      const allDocs = await dataService.getDocuments();
      // Mock documents with proper structure
      const mockPropertyDocs: CustomerDocument[] = [
        {
          id: `doc-${propertyId}-1`,
          document_type: 'form-50-162',
          file_path: `property-${propertyId}/form-50-162.pdf`,
          generated_at: new Date().toISOString(),
          status: 'generated',
          property_id: propertyId
        }
      ];
      setDocuments(mockPropertyDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (document: CustomerDocument) => {
    setDownloading(document.id);
    
    try {
      const blob = await storageService.downloadFile('customer-documents', document.file_path);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.document_type}-${new Date(document.generated_at).toLocaleDateString()}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: "Document downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const formatDocumentType = (type: string) => {
    switch (type) {
      case 'form-50-162':
        return 'Form 50-162';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading documents...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No documents available for this property yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <File className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{formatDocumentType(doc.document_type)}</p>
              <p className="text-xs text-muted-foreground">
                Generated on {formatDate(doc.generated_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={doc.status === 'generated' ? 'default' : 'secondary'}>
              {doc.status}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadDocument(doc)}
              disabled={downloading === doc.id}
            >
              {downloading === doc.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentsSection;