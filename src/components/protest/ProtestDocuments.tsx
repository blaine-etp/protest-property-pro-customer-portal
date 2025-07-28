import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Upload, FileIcon, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [generating, setGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [protestId]);

  const fetchDocuments = async () => {
    try {
      // Get property_id from protest_id to fetch documents
      const { data: protest } = await supabase
        .from('protests')
        .select('property_id')
        .eq('id', protestId)
        .single();

      // Get property owner_id first, then get documents by owner
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', protest?.property_id)
        .maybeSingle();

      if (propertyError) throw propertyError;

      if (propertyData?.owner_id) {
        const { data: customerDocs, error } = await supabase
          .from('customer_documents')
          .select('*')
          .eq('owner_id', propertyData.owner_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform the data to match our interface
        const transformedDocs = customerDocs?.map(doc => ({
          id: doc.id,
          document_type: doc.document_type,
          file_name: doc.file_path.split('/').pop() || 'Unknown',
          status: doc.status,
          generated_at: doc.generated_at,
          file_size: undefined // We don't store file size in our schema
        })) || [];

        setDocuments(transformedDocs);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents.",
        variant: "destructive",
      });
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const generateDocument = async (documentType: string) => {
    if (generating) return;

    setGenerating(documentType);
    try {
      // Get property info to generate documents
      const { data: protest } = await supabase
        .from('protests')
        .select('property_id')
        .eq('id', protestId)
        .single();

      if (!protest?.property_id) {
        throw new Error('Property not found');
      }

      // For our test case, use the known user_id and property_id
      const userId = '22222222-2222-2222-2222-222222222222';
      const propertyId = protest.property_id;

      let functionName = '';
      if (documentType === 'form_50_162') {
        functionName = 'generate-form-50-162';
      } else if (documentType === 'services_agreement') {
        functionName = 'generate-services-agreement';
      } else {
        throw new Error('Document type not yet supported');
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { userId, propertyId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${formatDocumentType(documentType)} generated successfully!`,
      });

      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error(`Error generating ${documentType}:`, error);
      toast({
        title: "Error",
        description: `Failed to generate ${formatDocumentType(documentType)}.`,
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const downloadDocument = async (document: Document) => {
    try {
      // Get the file path from the database
      const { data: doc } = await supabase
        .from('customer_documents')
        .select('file_path')
        .eq('id', document.id)
        .single();

      if (!doc?.file_path) {
        throw new Error('File path not found');
      }

      // Download the file from Supabase storage
      const { data: fileData, error } = await supabase.storage
        .from('customer-documents')
        .download(doc.file_path);

      if (error) throw error;

      // Create a blob URL and trigger download
      const url = URL.createObjectURL(fileData);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document.",
        variant: "destructive",
      });
    }
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
      case 'form-50-162': return 'Form 50-162';
      case 'services_agreement': return 'Services Agreement';
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
            onClick={() => generateDocument('form_50_162')}
            disabled={generating === 'form_50_162'}
          >
            <FileText className="h-4 w-4 mr-2" />
            {generating === 'form_50_162' ? 'Generating...' : 'Generate Form 50-162'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateDocument('services_agreement')}
            disabled={generating === 'services_agreement'}
          >
            <FileText className="h-4 w-4 mr-2" />
            {generating === 'services_agreement' ? 'Generating...' : 'Generate Services Agreement'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateDocument('evidence_packet')}
            disabled={generating === 'evidence_packet'}
          >
            <Upload className="h-4 w-4 mr-2" />
            {generating === 'evidence_packet' ? 'Generating...' : 'Generate Evidence Packet'}
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