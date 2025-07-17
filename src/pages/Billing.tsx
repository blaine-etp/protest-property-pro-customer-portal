import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Calendar, DollarSign } from "lucide-react";
import { mockAuthService } from "@/services/mockAuthService";

interface Profile {
  first_name: string;
  last_name: string;
  lifetime_savings: number;
}

// Dummy invoice data - clearly labeled as example data
const dummyInvoices = [
  {
    id: "INV-2024-001",
    date: "2024-06-15",
    amount: 250.00,
    status: "paid",
    description: "Property Tax Appeal Service - 123 Main St",
    downloadUrl: "#"
  },
  {
    id: "INV-2024-002", 
    date: "2024-05-20",
    amount: 175.00,
    status: "paid",
    description: "Property Tax Appeal Service - 456 Oak Ave",
    downloadUrl: "#"
  },
  {
    id: "INV-2024-003",
    date: "2024-04-10", 
    amount: 300.00,
    status: "paid",
    description: "Property Tax Appeal Service - 789 Pine Rd",
    downloadUrl: "#"
  }
];

const Billing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const sessionResult = await mockAuthService.getSession();
        if (sessionResult?.data?.session?.user) {
          const user = sessionResult.data.session.user;
          // Get user profile from mock data
          const userData = {
            first_name: user.email === 'customer@example.com' ? 'John' : 'Demo',
            last_name: user.email === 'customer@example.com' ? 'Doe' : 'User',
            lifetime_savings: 15000
          };
          setProfile(userData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleDownload = (invoiceId: string) => {
    toast({
      title: "Download Demo",
      description: "This is a demo - no actual invoice file available",
      variant: "default",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading billing information...</p>
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
                Unable to load billing information. Please check your access credentials.
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
          <h1 className="text-3xl font-bold">Billing & Invoices</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profile?.first_name}! View and download your payment history.
          </p>
        </div>

        <div className="space-y-6">
          {/* Billing Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Summary</CardTitle>
              <CardDescription>Your account and payment overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Lifetime Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${profile?.lifetime_savings?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold">
                    ${dummyInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <Badge variant="default" className="text-sm">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>
                <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                  ⚠️ DEMO DATA - These are example invoices for demonstration purposes
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dummyInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold">${invoice.amount.toFixed(2)}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="text-xs">
                          {invoice.status.toUpperCase()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(invoice.id)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {dummyInvoices.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No invoices found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing;