import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FilterPanel } from "@/components/crm/filters/FilterPanel";
import { MultiSelectFilter } from "@/components/crm/filters/MultiSelectFilter";
import { DateRangeFilter } from "@/components/crm/filters/DateRangeFilter";
import { NumericRangeFilter } from "@/components/crm/filters/NumericRangeFilter";
import {
  CreditCard,
  Search,
  Download,
  Eye,
  MoreHorizontal,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { dataService } from "@/services";
import type { Bill } from "@/services/types";

export function BillingSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dueDateStart, setDueDateStart] = useState<Date | undefined>();
  const [dueDateEnd, setDueDateEnd] = useState<Date | undefined>();
  const [minTaxAmount, setMinTaxAmount] = useState<number | undefined>();
  const [maxTaxAmount, setMaxTaxAmount] = useState<number | undefined>();

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const billsData = await dataService.getBills();
      setBills(billsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
      console.error('Failed to load billing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    // Text search
    const matchesSearch = bill.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(bill.status);
    
    // Tax amount filter (convert $X,XXX to number)
    const taxValue = parseFloat(bill.taxAmount.replace(/[$,]/g, ''));
    const matchesTaxAmount = (minTaxAmount === undefined || taxValue >= minTaxAmount) &&
      (maxTaxAmount === undefined || taxValue <= maxTaxAmount);
    
    // Date filter (basic check for now)
    const matchesDate = true; // Would need proper date parsing for real implementation
    
    return matchesSearch && matchesStatus && matchesTaxAmount && matchesDate;
  });

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(bills.map(b => b.status)));

  // Count active filters
  const activeFiltersCount = 
    selectedStatuses.length +
    (dueDateStart || dueDateEnd ? 1 : 0) +
    (minTaxAmount !== undefined || maxTaxAmount !== undefined ? 1 : 0) +
    (searchTerm ? 1 : 0);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedStatuses([]);
    setDueDateStart(undefined);
    setDueDateEnd(undefined);
    setMinTaxAmount(undefined);
    setMaxTaxAmount(undefined);
  };

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
            <h2 className="text-2xl font-bold">Bills</h2>
            <p className="text-slate-600">Loading bills...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
            <h2 className="text-2xl font-bold">Bills</h2>
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Bills</h2>
        <p className="text-slate-600">Manage tax bills</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-sm font-medium text-slate-600">Draft Bills</p>
                <p className="text-2xl font-bold text-gray-600">
                  {bills.filter(b => b.status === "Draft").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search bills by property, contact, or bill number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <FilterPanel
        title="Advanced Filters"
        activeFiltersCount={activeFiltersCount}
        onClearAll={clearAllFilters}
      >
        <MultiSelectFilter
          label="Status"
          options={uniqueStatuses}
          selectedValues={selectedStatuses}
          onSelectionChange={setSelectedStatuses}
          placeholder="All statuses"
        />
        
        <DateRangeFilter
          label="Due Date"
          startDate={dueDateStart}
          endDate={dueDateEnd}
          onDateChange={setDueDateStart}
          placeholder="Any date"
        />
        
        <NumericRangeFilter
          label="Tax Amount"
          min={minTaxAmount}
          max={maxTaxAmount}
          onRangeChange={(min, max) => {
            setMinTaxAmount(min);
            setMaxTaxAmount(max);
          }}
          placeholder="Any amount"
          formatValue={(value) => `$${value.toLocaleString()}`}
        />
      </FilterPanel>

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
                  <p className="text-slate-600">Contact</p>
                  <p className="font-medium">{bill.contact}</p>
                </div>
                <div>
                  <p className="text-slate-600">Tax Savings</p>
                  <p className="font-medium text-green-600">{bill.taxSavings}</p>
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
          <CardDescription>Detailed table view of all bills</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Bill Number</TableHead>
                <TableHead>Tax Year</TableHead>
                <TableHead>Tax Savings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>{bill.propertyAddress}</TableCell>
                  <TableCell>{bill.contact}</TableCell>
                  <TableCell>{bill.billNumber}</TableCell>
                  <TableCell>{bill.taxYear}</TableCell>
                  <TableCell className="font-medium text-green-600">{bill.taxSavings}</TableCell>
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
    </div>
  );
}