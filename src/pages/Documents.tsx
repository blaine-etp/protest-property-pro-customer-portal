import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, FileText, Calendar } from "lucide-react";
import { mockAuthService } from "@/services/mockAuthService";
import { MockDataService } from "@/services/mockDataService";

interface CustomerDocument {
  id: string;
  document_type: string;
  file_path: string;
  status: string;
  generated_at: string;
  created_at: string;
  property_address?: string;
}

const Documents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any | null>(null);
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sessionResult = await mockAuthService.getSession();
        if (sessionResult?.data?.session?.user) {
          const user = sessionResult.data.session.user;
          // Set mock profile
          const userData = {
            first_name: user.email === 'customer@example.com' ? 'John' : 'Demo',
            last_name: user.email === 'customer@example.com' ? 'Doe' : 'User',
            user_id: user.id,
          };
          setProfile(userData);
          
          // Load mock documents
          const dataService = new MockDataService();
          const mockDocuments = await dataService.getDocuments();
          // Convert to CustomerDocument format
          const customerDocs = mockDocuments.map(doc => ({
            id: doc.id,
            document_type: doc.type === 'form-50-162' ? 'form-50-162' : 'services-agreement',
            file_path: `/documents/${doc.id}.pdf`,
            status: 'generated',
            generated_at: doc.createdDate,
            created_at: doc.createdDate,
            property_address: doc.owner === 'John Smith' ? '123 Main St, Austin, TX 78701' : '456 Oak Ave, Austin, TX 78702'
          }));
          setDocuments(customerDocs);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDownload = (customerDocument: CustomerDocument) => {
    toast({
      title: "Download Started",
      description: "Your document download has started.",
    });
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

  if (!profile) {
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
                        <p className="text-sm text-muted-foreground">Document Type: {customerDocument.document_type}</p>
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