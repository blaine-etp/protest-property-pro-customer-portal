import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  MoreHorizontal,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  User,
  Upload,
  Database,
} from "lucide-react";
import { dataService } from "@/services";
import type { Bill, Invoice } from "@/services/types";

export function BillingSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("bills");
  const [bills, setBills] = useState<Bill[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [billsData, invoicesData] = await Promise.all([
        dataService.getBills(),
        dataService.getInvoices(),
      ]);
      setBills(billsData);
      setInvoices(invoicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
      console.error('Failed to load billing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBills = bills.filter(bill =>
    bill.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "yellow";
      case "Under Review": return "blue";
      case "Protested": return "orange";
      case "Paid": return "green";
      case "Sent": return "blue";
      case "Draft": return "gray";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <Clock className="h-4 w-4" />;
      case "Under Review": return <Eye className="h-4 w-4" />;
      case "Protested": return <AlertCircle className="h-4 w-4" />;
      case "Paid": return <CheckCircle className="h-4 w-4" />;
      case "Sent": return <CheckCircle className="h-4 w-4" />;
      case "Draft": return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Billing Management</h2>
            <p className="text-slate-600">Loading billing data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Billing Management</h2>
            <p className="text-red-600">Error: {error}</p>
          </div>
          <Button onClick={loadBillingData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Billing Management</h2>
          <div className="flex items-center gap-2">
            <p className="text-slate-600">Manage tax bills and client invoicing</p>
            <Badge variant="outline" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Mock Data
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Bills
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Billing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Bills</p>
                <p className="text-2xl font-bold">{bills.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tax Amount</p>
                <p className="text-2xl font-bold">$47.5K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Protested Bills</p>
                <p className="text-2xl font-bold text-orange-600">
                  {bills.filter(b => b.status === "Protested").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Revenue This Month</p>
                <p className="text-2xl font-bold text-purple-600">$2.45K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bills">Tax Bills</TabsTrigger>
          <TabsTrigger value="invoices">Client Invoices</TabsTrigger>
          <TabsTrigger value="analytics">Billing Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search bills by property, owner, or bill number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bills Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBills.map((bill) => (
              <Card key={bill.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{bill.propertyAddress}</CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        Bill: {bill.billNumber} • Tax Year: {bill.taxYear}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Bill
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusColor(bill.status) as any} className="flex items-center gap-1">
                      {getStatusIcon(bill.status)}
                      {bill.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600">Owner</p>
                      <p className="font-medium">{bill.owner}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Assessed Value</p>
                      <p className="font-medium">{bill.assessedValue}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Tax Amount</p>
                      <p className="font-medium text-red-600">{bill.taxAmount}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Paid Amount</p>
                      <p className="font-medium text-green-600">{bill.paidAmount}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Due Date:</span>
                      <span className="font-medium">{bill.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bills Table */}
          <Card>
            <CardHeader>
              <CardTitle>Bills Table</CardTitle>
              <CardDescription>Detailed table view of all tax bills</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Tax Year</TableHead>
                    <TableHead>Assessed Value</TableHead>
                    <TableHead>Tax Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.propertyAddress}</TableCell>
                      <TableCell>{bill.owner}</TableCell>
                      <TableCell>{bill.billNumber}</TableCell>
                      <TableCell>{bill.taxYear}</TableCell>
                      <TableCell>{bill.assessedValue}</TableCell>
                      <TableCell className="font-medium text-red-600">{bill.taxAmount}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(bill.status) as any}>
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{bill.dueDate}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Client Invoices</CardTitle>
              <CardDescription>Manage client billing and invoicing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.propertyAddress}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>{invoice.serviceType}</TableCell>
                      <TableCell className="font-medium text-green-600">{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(invoice.status) as any}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>{invoice.createdDate}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Billing Analytics</CardTitle>
              <CardDescription>Revenue and billing performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Billing analytics dashboard would be rendered here</p>
                  <p className="text-sm">Charts and metrics for revenue tracking and bill analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}