import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, FileText, Calendar } from "lucide-react";
import { useCustomerData } from "@/hooks/useCustomerData";
import { useTokenCustomerData } from "@/hooks/useTokenCustomerData";
import { supabase } from "@/integrations/supabase/client";

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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any | null>(null);
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Get URL parameters for token-based access
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  // Use appropriate data hook based on access method
  const tokenData = useTokenCustomerData(token || '');
  const emailData = useCustomerData(email || '');
  
  // Determine which data source to use
  const customerData = token ? tokenData : emailData;
  const { profile: customerProfile, loading: customerLoading, error: customerError } = customerData;

  useEffect(() => {
    if (token || email) {
      // Use token/email based access - profile data comes from customerData
      if (customerProfile && !customerLoading) {
        setProfile({
          first_name: customerProfile.first_name || '',
          last_name: customerProfile.last_name || '',
          user_id: customerProfile.user_id,
        });
      }
    }
  }, [customerProfile, customerLoading, token, email]);

  useEffect(() => {
    if (profile?.user_id) {
      fetchDocuments();
    }
  }, [profile?.user_id]);

  const fetchDocuments = async () => {
    if (!profile?.user_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_documents')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (customerDocument: CustomerDocument) => {
    try {
      console.log('Attempting to download:', customerDocument.file_path);
      
      // Try to download the file directly
      const { data, error } = await supabase.storage
        .from('customer-documents')
        .download(customerDocument.file_path);

      if (error) {
        console.error('Download error:', error);
        toast({
          title: "Download Failed",
          description: `Storage error: ${error.message}. The file may not exist in storage.`,
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        toast({
          title: "Download Failed",
          description: "No file data received from storage.",
          variant: "destructive",
        });
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${customerDocument.document_type}-${customerDocument.id}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your document is being downloaded.",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download Failed",
        description: "An unexpected error occurred while downloading the document.",
        variant: "destructive",
      });
    }
  };

  const getDocumentDisplayName = (docType: string) => {
    switch (docType) {
      case 'form-50-162':
        return 'Form 50-162 (Property Tax Protest)';
      case 'services-agreement':
        return 'ETP Services Agreement';
      default:
        return docType;
    }
  };

  const getDocumentIcon = (docType: string) => {
    return <FileText className="h-5 w-5 text-blue-600" />;
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

  if (customerError || !profile) {
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
            Welcome back, {profile?.first_name}! View and download all your property documents.
          </p>
        </div>

        <div className="space-y-6">
          {/* Documents Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Document Summary</CardTitle>
              <CardDescription>Your document collection overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">
                    {documents.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Form 50-162s</p>
                  <p className="text-2xl font-bold">
                    {documents.filter(doc => doc.document_type === 'form-50-162').length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Service Agreements</p>
                  <p className="text-2xl font-bold">
                    {documents.filter(doc => doc.document_type === 'services-agreement').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>
                All your property tax documents and agreements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((customerDocument) => (
                  <div key={customerDocument.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        {getDocumentIcon(customerDocument.document_type)}
                      </div>
                      <div>
                        <p className="font-medium">{getDocumentDisplayName(customerDocument.document_type)}</p>
                        <p className="text-sm text-muted-foreground">Property ID: {customerDocument.property_id}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Generated: {new Date(customerDocument.generated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="default" className="text-xs">
                        {customerDocument.status.toUpperCase()}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(customerDocument)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {documents.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                  <p className="text-muted-foreground">
                    Your property documents will appear here once they are generated.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Documents;