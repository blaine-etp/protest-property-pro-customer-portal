import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Upload, FileIcon, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  status: string;
  generated_at?: string;
  file_size?: number;
}

interface ProtestDocumentsProps {
  protestId: string;
}

export function ProtestDocuments({ protestId }: ProtestDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [protestId]);

  const fetchDocuments = async () => {
    try {
      // Mock documents for now
      const mockDocs: Document[] = [
        {
          id: '1',
          document_type: 'evidence_packet',
          file_name: 'Evidence_Packet_2024.pdf',
          status: 'generated',
          generated_at: '2024-01-15T10:00:00Z',
          file_size: 2048000
        },
        {
          id: '2',
          document_type: 'form_50_162',
          file_name: 'Form_50_162.pdf',
          status: 'pending',
          file_size: 512000
        }
      ];
      
      setDocuments(mockDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDocument = async (documentType: string) => {
    console.log(`Generating ${documentType} for protest ${protestId}`);
    // Implementation will be added when backend is ready
  };

  const downloadDocument = async (document: Document) => {
    console.log(`Downloading ${document.file_name}`);
    // Implementation will be added when backend is ready
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <FileIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDocumentType = (type: string) => {
    switch (type) {
      case 'evidence_packet': return 'Evidence Packet';
      case 'form_50_162': return 'Form 50-162';
      case 'hearing_notice': return 'Hearing Notice';
      case 'settlement_agreement': return 'Settlement Agreement';
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents & Evidence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateDocument('evidence_packet')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Generate Evidence Packet
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateDocument('form_50_162')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Form 50-162
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateDocument('hearing_notice')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Hearing Notice
          </Button>
        </div>

        {/* Documents Table */}
        {loading ? (
          <p className="text-center text-muted-foreground">Loading documents...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    {formatDocumentType(doc.document_type)}
                  </TableCell>
                  <TableCell>{doc.file_name}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(doc.status)}
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {doc.status === 'generated' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(doc)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {doc.status === 'error' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateDocument(doc.document_type)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No documents generated yet. Use the buttons above to create documents.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}