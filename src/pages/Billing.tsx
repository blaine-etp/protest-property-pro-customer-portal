import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, FileText, CreditCard, DollarSign } from "lucide-react";
import { useAuthenticatedCustomerData } from "@/hooks/useAuthenticatedCustomerData";
import { authService } from "@/services";

// Enhanced mock invoice data for demonstration
const mockInvoices = [
  {
    id: 'INV-2024-001',
    date: '2024-01-15',
    amount: 1250.00,
    status: 'paid',
    description: 'Property Tax Protest Success Fee - 123 Main St, Austin TX',
    downloadUrl: '#',
    type: 'success_fee',
    taxYear: 2023,
    property: '123 Main St, Austin TX'
  },
  {
    id: 'INV-2024-002',
    date: '2024-02-15',
    amount: 875.50,
    status: 'paid',
    description: 'Property Tax Protest Success Fee - 456 Oak Ave, Austin TX',
    downloadUrl: '#',
    type: 'success_fee',
    taxYear: 2023,
    property: '456 Oak Ave, Austin TX'
  },
  {
    id: 'INV-2024-003',
    date: '2024-03-01',
    amount: 320.75,
    status: 'pending',
    description: 'Property Tax Appeal Filing Fee - 789 Pine Rd, Austin TX',
    downloadUrl: '#',
    type: 'filing_fee',
    taxYear: 2024,
    property: '789 Pine Rd, Austin TX'
  },
  {
    id: 'INV-2024-004',
    date: '2024-03-15',
    amount: 195.25,
    status: 'paid',
    description: 'Document Processing Fee - Multiple Properties',
    downloadUrl: '#',
    type: 'processing_fee',
    taxYear: 2024,
    property: 'Multiple Properties'
  },
  {
    id: 'INV-2023-015',
    date: '2023-12-15',
    amount: 2100.00,
    status: 'paid',
    description: 'Property Tax Protest Success Fee - 101 Elm St, Austin TX',
    downloadUrl: '#',
    type: 'success_fee',
    taxYear: 2022,
    property: '101 Elm St, Austin TX'
  },
  {
    id: 'INV-2023-014',
    date: '2023-11-30',
    amount: 450.00,
    status: 'paid',
    description: 'Consultation & Filing Fee - New Property Setup',
    downloadUrl: '#',
    type: 'consultation_fee',
    taxYear: 2023,
    property: 'New Property Setup'
  }
];

const Billing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use authenticated customer data
  const { profile, loading, error } = useAuthenticatedCustomerData();

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

  const handleDownload = (invoiceId: string) => {
    toast({
      title: "Demo Download",
      description: `This would download invoice ${invoiceId} in a real application.`,
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-600">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  if (error || !profile) {
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
            Welcome back, {profile.first_name}! Manage your billing and view invoice history.
          </p>
        </div>

        <div className="space-y-6">
          {/* Billing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Summary
              </CardTitle>
              <CardDescription>Overview of your account and savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground">Customer</h3>
                  <p className="text-2xl font-bold">
                    {profile.first_name} {profile.last_name}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground">Lifetime Savings</h3>
                  <p className="text-2xl font-bold text-green-600">
                    ${profile.lifetime_savings.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground">Total Invoices</h3>
                  <p className="text-2xl font-bold">
                    {mockInvoices.length}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground">Total Paid</h3>
                  <p className="text-2xl font-bold text-green-600">
                    ${mockInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Your complete invoice history and payment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>Date: {invoice.date}</span>
                          <span>Tax Year: {invoice.taxYear}</span>
                          <span className="capitalize">{invoice.type.replace('_', ' ')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{invoice.property}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold">${invoice.amount.toFixed(2)}</p>
                      {getStatusBadge(invoice.status)}
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownload(invoice.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {mockInvoices.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                  <p className="text-muted-foreground">
                    Your invoice history will appear here once services are rendered.
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
                <h3 className="font-medium mb-1">Demo Billing Data</h3>
                <p className="text-sm text-muted-foreground">
                  This demonstrates various invoice types including success fees, filing fees, 
                  and consultation charges. In the real application, actual invoices would be 
                  generated based on completed services and downloadable as PDFs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;