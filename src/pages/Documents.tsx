import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Download, FileText, File, User, Clock, 
  CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { useAuthenticatedCustomerData } from '@/hooks/useAuthenticatedCustomerData';
import { authService } from '@/services';

interface CustomerDocument {
  id: string;
  document_type: string;
  file_path: string;
  property_id: string;
  status: string;
  generated_at: string;
  created_at: string;
  property_address?: string;
}

const Documents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  // Use authenticated customer data
  const { profile, properties, loading, error } = useAuthenticatedCustomerData();
  
  // Mock documents for demo
  const mockDocuments: CustomerDocument[] = [
    {
      id: 'doc-1',
      document_type: 'form_50_162',
      file_path: 'customer-1/form-50-162-2024.pdf',
      property_id: 'prop-1',
      status: 'ready',
      generated_at: '2024-01-15T10:30:00Z',
      created_at: '2024-01-15T10:30:00Z',
      property_address: '123 Main St, Austin TX'
    },
    {
      id: 'doc-2',
      document_type: 'etp_agreement',
      file_path: 'customer-1/etp-operating-agreement.pdf',
      property_id: 'prop-1',
      status: 'ready',
      generated_at: '2024-01-10T14:20:00Z',
      created_at: '2024-01-10T14:20:00Z',
      property_address: '123 Main St, Austin TX'
    },
    {
      id: 'doc-3',
      document_type: 'services_agreement',
      file_path: 'customer-1/services-agreement-2024.pdf',
      property_id: 'prop-2',
      status: 'ready',
      generated_at: '2024-02-01T09:15:00Z',
      created_at: '2024-02-01T09:15:00Z',
      property_address: '456 Oak Ave, Austin TX'
    },
    {
      id: 'doc-4',
      document_type: 'form_50_162',
      file_path: 'customer-1/form-50-162-2023.pdf',
      property_id: 'prop-2',
      status: 'ready',
      generated_at: '2023-12-15T16:45:00Z',
      created_at: '2023-12-15T16:45:00Z',
      property_address: '456 Oak Ave, Austin TX'
    },
    {
      id: 'doc-5',
      document_type: 'protest_results',
      file_path: 'customer-1/protest-results-2023.pdf',
      property_id: 'prop-1',
      status: 'ready',
      generated_at: '2023-11-20T11:30:00Z',
      created_at: '2023-11-20T11:30:00Z',
      property_address: '123 Main St, Austin TX'
    }
  ];

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const session = await authService.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleDownload = async (customerDocument: CustomerDocument) => {
    try {
      setDownloading(customerDocument.id);
      
      // Mock download for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Demo Download",
        description: `This would download ${getDocumentDisplayName(customerDocument.document_type)} in a real application.`,
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "An error occurred while downloading the document.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const getDocumentDisplayName = (docType: string): string => {
    switch (docType) {
      case 'form_50_162':
        return 'Form 50-162 (Property Tax Protest)';
      case 'etp_agreement':
        return 'ETP Operating Agreement';
      case 'services_agreement':
        return 'Services Agreement';
      case 'appeal_letter':
        return 'Appeal Letter';
      case 'protest_results':
        return 'Protest Results';
      default:
        return docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getDocumentIcon = (docType: string) => {
    switch (docType) {
      case 'form_50_162':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'etp_agreement':
        return <File className="h-5 w-5 text-purple-600" />;
      case 'services_agreement':
        return <File className="h-5 w-5 text-green-600" />;
      case 'appeal_letter':
        return <File className="h-5 w-5 text-orange-600" />;
      case 'protest_results':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                Unable to load documents. Please check your access credentials.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/customer-portal')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customer Portal
          </Button>
          <h1 className="text-3xl font-bold">All Documents</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profile.first_name}! Access and download all your property documents.
          </p>
        </div>

        <div className="space-y-6">
          {/* Document Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Document Summary</CardTitle>
              <CardDescription>Overview of your available documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">Total Documents</p>
                      <p className="text-2xl font-bold">{mockDocuments.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">Ready</p>
                      <p className="text-2xl font-bold">
                        {mockDocuments.filter(doc => doc.status === 'ready').length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="font-medium">Processing</p>
                      <p className="text-2xl font-bold">
                        {mockDocuments.filter(doc => doc.status === 'processing').length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>Download and view your property-related documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDocuments.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        {getDocumentIcon(document.document_type)}
                      </div>
                      <div>
                        <p className="font-medium">{getDocumentDisplayName(document.document_type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {document.property_address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Generated: {new Date(document.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={document.status === 'ready' ? 'default' : 'secondary'}>
                        {document.status === 'ready' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </Badge>
                      <div className="flex space-x-2">
                        {document.status === 'ready' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownload(document)}
                            disabled={downloading === document.id}
                          >
                            {downloading === document.id ? (
                              <>
                                <Clock className="h-4 w-4 mr-1 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {mockDocuments.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No documents found</h3>
                  <p className="text-muted-foreground">
                    Your documents will appear here once they are generated.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demo Notice */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">?</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">Demo Documents</h3>
                <p className="text-sm text-muted-foreground">
                  These are demonstration documents including Form 50-162 (Property Tax Protest forms) 
                  and ETP Operating Agreements. In the real application, actual documents would be 
                  generated and made available for download.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;