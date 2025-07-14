import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";

const Billing = () => {
  // Dummy invoice data - clearly labeled as example
  const dummyInvoices = [
    {
      id: "INV-2024-001",
      date: "2024-01-15",
      amount: "$49.99",
      status: "Paid",
      description: "Tax Protest Service - Property Assessment",
      downloadUrl: "#"
    },
    {
      id: "INV-2024-002", 
      date: "2024-02-15",
      amount: "$49.99",
      status: "Paid",
      description: "Tax Protest Service - Property Assessment",
      downloadUrl: "#"
    },
    {
      id: "INV-2024-003",
      date: "2024-03-15", 
      amount: "$75.00",
      status: "Paid",
      description: "Additional Property Appeal Service",
      downloadUrl: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Invoices</h1>
            <p className="text-muted-foreground">
              View and download your payment history and invoices.
            </p>
          </div>

          {/* Demo Notice */}
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <FileText className="h-5 w-5" />
                <p className="font-medium">
                  Demo Data Notice: The invoices below are dummy examples for demonstration purposes only.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Invoices List */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Your complete billing and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dummyInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{invoice.id}</p>
                          <Badge variant={invoice.status === "Paid" ? "default" : "secondary"}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                        <p className="text-xs text-muted-foreground">Issued: {invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{invoice.amount}</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {dummyInvoices.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
                  <p className="text-muted-foreground">
                    Your payment history will appear here once you make your first payment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Billing;