import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FilterPanel } from "@/components/crm/filters/FilterPanel";
import { MultiSelectFilter } from "@/components/crm/filters/MultiSelectFilter";
import { DateRangeFilter } from "@/components/crm/filters/DateRangeFilter";
import { NumericRangeFilter } from "@/components/crm/filters/NumericRangeFilter";
import {
  Gavel,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Plus,
  TrendingUp,
  Building,
  User,
  Database,
  Search,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ProtestSection() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("pipeline");
  const [protests, setProtests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [filingDateStart, setFilingDateStart] = useState<Date | undefined>();
  const [filingDateEnd, setFilingDateEnd] = useState<Date | undefined>();
  const [minAssessedValue, setMinAssessedValue] = useState<number | undefined>();
  const [maxAssessedValue, setMaxAssessedValue] = useState<number | undefined>();

  useEffect(() => {
    loadProtests();
  }, []);

  const loadProtests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('protests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProtests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load protests');
      console.error('Failed to load protests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter protests
  const filteredProtests = protests.filter(protest => {
    // Text search
    const matchesSearch = (protest.situs_address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (protest.owner_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (protest.county || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(protest.appeal_status || 'pending');
    
    // County filter
    const matchesCounty = selectedCounties.length === 0 || selectedCounties.includes(protest.county || '');
    
    // Assessed value filter
    const assessedValue = protest.assessed_value || 0;
    const matchesAssessedValue = (minAssessedValue === undefined || assessedValue >= minAssessedValue) &&
      (maxAssessedValue === undefined || assessedValue <= maxAssessedValue);
    
    // Date filter (basic check for now)
    const matchesDate = true; // Would need proper date parsing for real implementation
    
    return matchesSearch && matchesStatus && matchesCounty && matchesAssessedValue && matchesDate;
  });

  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(protests.map(p => p.appeal_status || 'pending')));
  const uniqueCounties = Array.from(new Set(protests.map(p => p.county || '')));

  // Count active filters
  const activeFiltersCount = 
    selectedStatuses.length +
    selectedCounties.length +
    (filingDateStart || filingDateEnd ? 1 : 0) +
    (minAssessedValue !== undefined || maxAssessedValue !== undefined ? 1 : 0) +
    (searchTerm ? 1 : 0);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedStatuses([]);
    setSelectedCounties([]);
    setFilingDateStart(undefined);
    setFilingDateEnd(undefined);
    setMinAssessedValue(undefined);
    setMaxAssessedValue(undefined);
  };

  const protestsByStatus = {
    "pending": filteredProtests.filter(p => p.appeal_status === "pending"),
    "filed": filteredProtests.filter(p => p.appeal_status === "filed"),
    "accepted": filteredProtests.filter(p => p.appeal_status === "accepted"),
    "rejected": filteredProtests.filter(p => p.appeal_status === "rejected"),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "yellow";
      case "filed": return "blue";
      case "accepted": return "green";
      case "rejected": return "red";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "filed": return <FileText className="h-4 w-4" />;
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Protest Management</h2>
            <p className="text-slate-600">Loading protests...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
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
            <h2 className="text-2xl font-bold">Protest Management</h2>
            <p className="text-red-600">Error: {error}</p>
          </div>
          <Button onClick={loadProtests}>
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
          <h2 className="text-2xl font-bold">Protest Management</h2>
          <div className="flex items-center gap-2">
            <p className="text-slate-600">Track and manage property tax protests</p>
            <Badge variant="outline" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Supabase Data
            </Badge>
          </div>
        </div>
      </div>

      {/* Protest Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Protests</p>
                <p className="text-2xl font-bold">{protests.length}</p>
              </div>
              <Gavel className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-orange-600">
                  {protests.filter(p => ["pending", "filed"].includes(p.appeal_status || 'pending')).length}
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
                <p className="text-sm font-medium text-slate-600">Settled</p>
                <p className="text-2xl font-bold text-green-600">
                  {protests.filter(p => p.appeal_status === "accepted").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Success Rate</p>
                <p className="text-2xl font-bold">75%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Reduced</p>
                <p className="text-2xl font-bold text-green-600">
                  ${protests.reduce((sum, p) => sum + (p.savings_amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search protests by property, owner, or county..."
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
            
            <MultiSelectFilter
              label="County"
              options={uniqueCounties}
              selectedValues={selectedCounties}
              onSelectionChange={setSelectedCounties}
              placeholder="All counties"
            />
            
            <DateRangeFilter
              label="Filing Date"
              startDate={filingDateStart}
              endDate={filingDateEnd}
              onDateChange={setFilingDateStart}
              placeholder="Any date"
            />
            
            <NumericRangeFilter
              label="Assessed Value"
              min={minAssessedValue}
              max={maxAssessedValue}
              onRangeChange={(min, max) => {
                setMinAssessedValue(min);
                setMaxAssessedValue(max);
              }}
              placeholder="Any amount"
              formatValue={(value) => `$${value.toLocaleString()}`}
            />
          </FilterPanel>

          {/* Direct Protest Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProtests.map((protest) => (
              <Card 
                key={protest.id} 
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => {
                  navigate(`/admin/protests/${protest.id}`);
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={getStatusColor(protest.appeal_status || 'pending') as any} className="flex items-center gap-1">
                      {getStatusIcon(protest.appeal_status || 'pending')}
                      <span className="ml-1">{protest.appeal_status || 'pending'}</span>
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Protest
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Documents
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{protest.situs_address || 'Address not available'}</h4>
                    <p className="text-sm text-muted-foreground">Tax Year: {protest.tax_year || new Date().getFullYear()}</p>
                  </div>
                  
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">County:</span>
                        <span className="font-medium">{protest.county || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Owner:</span>
                        <span className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                          {protest.owner_name || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Assessed Value:</span>
                        <span className="font-medium">
                          ${(protest.assessed_value || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created: {protest.created_at ? new Date(protest.created_at).toLocaleDateString() : 'N/A'}</span>
                    {protest.hearing_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(protest.hearing_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Protests Table</CardTitle>
              <CardDescription>Detailed table view of all protests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Filed Date</TableHead>
                    <TableHead>Hearing Date</TableHead>
                    <TableHead>Assessed Value</TableHead>
                    <TableHead>Target Value</TableHead>
                    <TableHead>Potential Savings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProtests.map((protest) => (
                    <TableRow key={protest.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{protest.situs_address || 'Address not available'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{protest.owner_name || 'Not specified'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(protest.appeal_status || 'pending') as any} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(protest.appeal_status || 'pending')}
                          {protest.appeal_status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{protest.filedDate}</TableCell>
                      <TableCell>{protest.hearingDate}</TableCell>
                      <TableCell>{protest.assessedValue}</TableCell>
                      <TableCell>{protest.targetValue}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {protest.potentialSavings}
                      </TableCell>
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
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Protest
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download Documents
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

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Protest Timeline</CardTitle>
              <CardDescription>Chronological view of protest activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredProtests.map((protest, index) => (
                  <div key={protest.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                       <div className={`w-3 h-3 rounded-full ${
                         protest.status === "Settled" ? "bg-green-500" :
                         protest.status === "Filed" ? "bg-blue-500" :
                         "bg-orange-500"
                       }`}></div>
                      {index < filteredProtests.length - 1 && (
                        <div className="w-px h-16 bg-slate-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{protest.propertyAddress}</h4>
                          <Badge variant={getStatusColor(protest.status) as any}>
                            {protest.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">Owner: {protest.owner}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Filed:</span>
                            <p className="font-medium">{protest.filedDate}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Hearing:</span>
                            <p className="font-medium">{protest.hearingDate}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Assessed:</span>
                            <p className="font-medium">{protest.assessedValue}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Potential Savings:</span>
                            <p className="font-medium text-green-600">{protest.potentialSavings}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}