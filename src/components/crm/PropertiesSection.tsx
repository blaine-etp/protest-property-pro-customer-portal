import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  MapPin,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Gavel,
  Database,
  User,
  X,
} from "lucide-react";
import { dataService } from "@/services";
import type { Property } from "@/services/types";
import { FilterPanel } from "./filters/FilterPanel";
import { MultiSelectFilter } from "./filters/MultiSelectFilter";
import { DateRangeFilter } from "./filters/DateRangeFilter";
import { NumericRangeFilter } from "./filters/NumericRangeFilter";

interface PropertyFilters {
  search: string;
  counties: string[];
  statuses: string[];
  protestStatuses: string[];
  protestDeadlineStart?: Date;
  protestDeadlineEnd?: Date;
  lastUpdatedStart?: Date;
  lastUpdatedEnd?: Date;
  assessedValueMin?: number;
  assessedValueMax?: number;
  marketValueMin?: number;
  marketValueMax?: number;
  taxAmountMin?: number;
  taxAmountMax?: number;
  potentialSavingsMin?: number;
  potentialSavingsMax?: number;
}

const defaultFilters: PropertyFilters = {
  search: "",
  counties: [],
  statuses: [],
  protestStatuses: [],
};

export function PropertiesSection() {
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);
  const [viewMode, setViewMode] = useState("grid");
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dataService.getProperties();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
      console.error('Failed to load properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    // Search filter
    if (filters.search && !property.address.toLowerCase().includes(filters.search.toLowerCase()) &&
        !property.owner.toLowerCase().includes(filters.search.toLowerCase()) &&
        !property.parcelNumber.includes(filters.search)) {
      return false;
    }

    // County filter
    if (filters.counties.length > 0 && !filters.counties.includes("Travis")) { // Mock county
      return false;
    }

    // Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(property.status)) {
      return false;
    }

    // Protest Status filter
    if (filters.protestStatuses.length > 0 && property.protestStatus && !filters.protestStatuses.includes(property.protestStatus)) {
      return false;
    }

    // Assessed value filter
    if (filters.assessedValueMin !== undefined) {
      const assessedValue = parseFloat(property.assessedValue.replace(/[$,]/g, ''));
      if (assessedValue < filters.assessedValueMin) return false;
    }
    if (filters.assessedValueMax !== undefined) {
      const assessedValue = parseFloat(property.assessedValue.replace(/[$,]/g, ''));
      if (assessedValue > filters.assessedValueMax) return false;
    }

    // Market value filter
    if (filters.marketValueMin !== undefined) {
      const marketValue = parseFloat(property.marketValue.replace(/[$,]/g, ''));
      if (marketValue < filters.marketValueMin) return false;
    }
    if (filters.marketValueMax !== undefined) {
      const marketValue = parseFloat(property.marketValue.replace(/[$,]/g, ''));
      if (marketValue > filters.marketValueMax) return false;
    }

    // Tax amount filter
    if (filters.taxAmountMin !== undefined) {
      const taxAmount = parseFloat(property.taxAmount.replace(/[$,]/g, ''));
      if (taxAmount < filters.taxAmountMin) return false;
    }
    if (filters.taxAmountMax !== undefined) {
      const taxAmount = parseFloat(property.taxAmount.replace(/[$,]/g, ''));
      if (taxAmount > filters.taxAmountMax) return false;
    }

    // Potential savings filter
    if (filters.potentialSavingsMin !== undefined) {
      const potentialSavings = parseFloat(property.potentialSavings.replace(/[$,]/g, ''));
      if (potentialSavings < filters.potentialSavingsMin) return false;
    }
    if (filters.potentialSavingsMax !== undefined) {
      const potentialSavings = parseFloat(property.potentialSavings.replace(/[$,]/g, ''));
      if (potentialSavings > filters.potentialSavingsMax) return false;
    }

    return true;
  });

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.counties.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.protestStatuses.length > 0) count++;
    if (filters.protestDeadlineStart || filters.protestDeadlineEnd) count++;
    if (filters.lastUpdatedStart || filters.lastUpdatedEnd) count++;
    if (filters.assessedValueMin !== undefined || filters.assessedValueMax !== undefined) count++;
    if (filters.marketValueMin !== undefined || filters.marketValueMax !== undefined) count++;
    if (filters.taxAmountMin !== undefined || filters.taxAmountMax !== undefined) count++;
    if (filters.potentialSavingsMin !== undefined || filters.potentialSavingsMax !== undefined) count++;
    return count;
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active Protest": return "orange";
      case "Review Needed": return "red";
      case "Completed": return "green";
      case "Monitoring": return "blue";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active Protest": return <Gavel className="h-4 w-4" />;
      case "Review Needed": return <AlertCircle className="h-4 w-4" />;
      case "Completed": return <CheckCircle className="h-4 w-4" />;
      case "Monitoring": return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const countyOptions = [
    { value: "Travis", label: "Travis County" },
    { value: "Harris", label: "Harris County" },
    { value: "Dallas", label: "Dallas County" },
    { value: "Collin", label: "Collin County" },
    { value: "Williamson", label: "Williamson County" },
  ];

  const statusOptions = [
    { value: "Active Protest", label: "Active Protest", color: "orange" },
    { value: "Review Needed", label: "Review Needed", color: "red" },
    { value: "Completed", label: "Completed", color: "green" },
    { value: "Monitoring", label: "Monitoring", color: "blue" },
  ];

  const protestStatusOptions = [
    { value: "filed", label: "Filed", color: "blue" },
    { value: "settled", label: "Settled", color: "green" },
    { value: "none", label: "None", color: "gray" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Properties Management</h2>
            <p className="text-slate-600">Loading properties...</p>
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
            <h2 className="text-2xl font-bold">Properties Management</h2>
            <p className="text-red-600">Error: {error}</p>
          </div>
          <Button onClick={loadProperties}>
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
          <h2 className="text-2xl font-bold">Properties Management</h2>
          <div className="flex items-center gap-2">
            <p className="text-slate-600">Track property assessments and protest opportunities</p>
            <Badge variant="outline" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Mock Data
            </Badge>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Properties</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Protests</p>
                <p className="text-2xl font-bold">{properties.filter(p => p.status === "Active Protest").length}</p>
              </div>
              <Gavel className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${filteredProperties.reduce((sum, p) => sum + parseFloat(p.potentialSavings.replace(/[$,]/g, '')), 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Assessment</p>
                <p className="text-2xl font-bold">
                  ${Math.round(filteredProperties.reduce((sum, p) => sum + parseFloat(p.assessedValue.replace(/[$,]/g, '')), 0) / filteredProperties.length / 1000)}K
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search properties by address, owner, or parcel number..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <FilterPanel
        title="Advanced Filters"
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
        activeFiltersCount={getActiveFiltersCount()}
        onClearAll={clearAllFilters}
      >
        <MultiSelectFilter
          label="County"
          options={countyOptions}
          selectedValues={filters.counties}
          onSelectionChange={(values) => updateFilter("counties", values)}
        />
        
        <MultiSelectFilter
          label="Status"
          options={statusOptions}
          selectedValues={filters.statuses}
          onSelectionChange={(values) => updateFilter("statuses", values)}
        />
        
        <MultiSelectFilter
          label="Protest Status"
          options={protestStatusOptions}
          selectedValues={filters.protestStatuses}
          onSelectionChange={(values) => updateFilter("protestStatuses", values)}
        />

        <DateRangeFilter
          label="Protest Deadline"
          startDate={filters.protestDeadlineStart}
          endDate={filters.protestDeadlineEnd}
          onDateChange={(start, end) => {
            updateFilter("protestDeadlineStart", start);
            updateFilter("protestDeadlineEnd", end);
          }}
        />

        <DateRangeFilter
          label="Last Updated"
          startDate={filters.lastUpdatedStart}
          endDate={filters.lastUpdatedEnd}
          onDateChange={(start, end) => {
            updateFilter("lastUpdatedStart", start);
            updateFilter("lastUpdatedEnd", end);
          }}
        />

        <NumericRangeFilter
          label="Assessed Value"
          min={filters.assessedValueMin}
          max={filters.assessedValueMax}
          onRangeChange={(min, max) => {
            updateFilter("assessedValueMin", min);
            updateFilter("assessedValueMax", max);
          }}
          formatValue={(value) => `$${value.toLocaleString()}`}
        />

        <NumericRangeFilter
          label="Market Value"
          min={filters.marketValueMin}
          max={filters.marketValueMax}
          onRangeChange={(min, max) => {
            updateFilter("marketValueMin", min);
            updateFilter("marketValueMax", max);
          }}
          formatValue={(value) => `$${value.toLocaleString()}`}
        />

        <NumericRangeFilter
          label="Tax Amount"
          min={filters.taxAmountMin}
          max={filters.taxAmountMax}
          onRangeChange={(min, max) => {
            updateFilter("taxAmountMin", min);
            updateFilter("taxAmountMax", max);
          }}
          formatValue={(value) => `$${value.toLocaleString()}`}
        />

        <NumericRangeFilter
          label="Potential Savings"
          min={filters.potentialSavingsMin}
          max={filters.potentialSavingsMax}
          onRangeChange={(min, max) => {
            updateFilter("potentialSavingsMin", min);
            updateFilter("potentialSavingsMax", max);
          }}
          formatValue={(value) => `$${value.toLocaleString()}`}
        />
      </FilterPanel>

      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{property.address}</CardTitle>
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
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-medium text-slate-600">Situs Address:</span>
                       <span className="text-sm">{property.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">County:</span>
                      <span className="text-sm">Travis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">Protest:</span>
                      <span 
                        className="text-sm cursor-pointer hover:underline text-blue-600"
                        onClick={() => console.log('Navigate to protest:', property.protestId)}
                      >
                        {property.protestStatus === 'filed' ? 'active, filed' : 
                         property.protestStatus === 'settled' ? 'settled' : 
                         'none'}
                      </span>
                    </div>
                    {property.contactId && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">Contact:</span>
                        <span 
                          className="text-sm cursor-pointer hover:underline text-blue-600"
                          onClick={() => console.log('Navigate to contact:', property.contactId)}
                        >
                          John Smith
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">Owner:</span>
                      <span 
                        className="text-sm cursor-pointer hover:underline text-blue-600"
                        onClick={() => console.log('Navigate to owner:', property.ownerId)}
                      >
                        {property.owner}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">IDs:</span>
                      <span className="text-sm font-mono">
                        {property.propertyId}, {property.etpPid || 'N/A'}, {property.countyPid || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">Documents:</span>
                      <span 
                        className="text-sm cursor-pointer hover:underline text-blue-600"
                        onClick={() => console.log('Navigate to document:', property.documentId)}
                      >
                        {property.documentId === "1" ? "Form 50-162 - Property Tax Protest" :
                         property.documentId === "2" ? "Evidence Package - Market Analysis" :
                         property.documentId === "3" ? "Hearing Notice - County Appeal" :
                         property.documentId === "4" ? "Settlement Agreement" : 
                         "No documents"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">
                      Last updated: {property.lastUpdated}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Gavel className="h-4 w-4 mr-1" />
                        Protest
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Properties Table</CardTitle>
              <CardDescription>Detailed table view of all properties</CardDescription>
            </CardHeader>
            <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Protest</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>IDs</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.address}</TableCell>
                  <TableCell>Travis</TableCell>
                  <TableCell>
                    <span 
                      className="text-blue-600 cursor-pointer hover:underline"
                      onClick={() => console.log('Navigate to protest:', property.protestId)}
                    >
                      {property.protestStatus === 'filed' ? 'active, filed' : 
                       property.protestStatus === 'settled' ? 'settled' : 
                       'none'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {property.contactId && (
                      <span 
                        className="text-blue-600 cursor-pointer hover:underline"
                        onClick={() => console.log('Navigate to contact:', property.contactId)}
                      >
                        John Smith
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span 
                      className="text-blue-600 cursor-pointer hover:underline"
                      onClick={() => console.log('Navigate to owner:', property.ownerId)}
                    >
                      {property.owner}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">
                      {property.propertyId}, {property.etpPid || 'N/A'}, {property.countyPid || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span 
                      className="text-blue-600 cursor-pointer hover:underline"
                      onClick={() => console.log('Navigate to document:', property.documentId)}
                    >
                      {property.documentId === "1" ? "Form 50-162 - Property Tax Protest" :
                       property.documentId === "2" ? "Evidence Package - Market Analysis" :
                       property.documentId === "3" ? "Hearing Notice - County Appeal" :
                       property.documentId === "4" ? "Settlement Agreement" : 
                       "No documents"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{property.lastUpdated}</TableCell>
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
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
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

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Properties Map View</CardTitle>
              <CardDescription>Geographic visualization of properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-6 min-h-[500px] flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Interactive map would be rendered here</p>
                  <p className="text-sm">Showing property locations with protest status indicators</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}