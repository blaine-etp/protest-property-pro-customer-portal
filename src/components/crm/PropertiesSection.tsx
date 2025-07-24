import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Search,
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
import { supabase } from "@/integrations/supabase/client";
import { FilterPanel } from "./filters/FilterPanel";
import { MultiSelectFilter } from "./filters/MultiSelectFilter";
import { 
  PROTEST_STATUSES, 
  PROTEST_STATUS_LABELS, 
  ProtestStatus,
  LEGACY_STATUS_MAPPING 
} from "@/constants/protestStatus";

interface PropertyFilters {
  search: string;
  counties: string[];
  statuses: string[];
}

const defaultFilters: PropertyFilters = {
  search: "",
  counties: [],
  statuses: [],
};

export function PropertiesSection() {
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);
  const [viewMode, setViewMode] = useState("grid");
  const [properties, setProperties] = useState<any[]>([]);
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
      
      // Fetch properties with their associated protest data
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          protests (
            id,
            appeal_status,
            exemption_status,
            savings_amount,
            assessed_value,
            hearing_date,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
      console.error('Failed to load properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get normalized status
  const getNormalizedStatus = (status: string | null): ProtestStatus => {
    if (!status) return PROTEST_STATUSES.PENDING;
    return LEGACY_STATUS_MAPPING[status] || status as ProtestStatus;
  };

  // Helper function to get property status based on protests
  const getPropertyStatus = (property: any) => {
    if (!property.protests || property.protests.length === 0) {
      return 'No Protest';
    }
    
    const activeProtest = property.protests.find((p: any) => 
      p.appeal_status && !['completed', 'rejected'].includes(p.appeal_status)
    );
    
    if (activeProtest) {
      const normalizedStatus = getNormalizedStatus(activeProtest.appeal_status);
      switch (normalizedStatus) {
        case PROTEST_STATUSES.PENDING: return 'Review Needed';
        case PROTEST_STATUSES.IN_PROGRESS: return 'Active Protest';
        case PROTEST_STATUSES.OFFER_RECEIVED: return 'Review Needed';
        case PROTEST_STATUSES.ACCEPTED: return 'Completed';
        case PROTEST_STATUSES.NEEDS_REVIEW: return 'Review Needed';
        default: return 'Active Protest';
      }
    }
    
    return 'Completed';
  };

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    // Search filter
    const matchesSearch = !filters.search || 
      (property.situs_address && property.situs_address.toLowerCase().includes(filters.search.toLowerCase())) ||
      (property.county && property.county.toLowerCase().includes(filters.search.toLowerCase()));
    
    // Status filter  
    const propertyStatus = getPropertyStatus(property);
    const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(propertyStatus);
    
    // County filter
    const matchesCounty = filters.counties.length === 0 || 
      (property.county && filters.counties.includes(property.county));
    
    return matchesSearch && matchesStatus && matchesCounty;
  });

  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(
    properties.map(p => getPropertyStatus(p))
  ));
  
  const uniqueCounties = Array.from(new Set(
    properties.map(p => p.county).filter(Boolean)
  ));

  // Calculate statistics
  const totalProperties = properties.length;
  const activeProtests = properties.filter(p => getPropertyStatus(p) === 'Active Protest').length;
  const completedProtests = properties.filter(p => getPropertyStatus(p) === 'Completed').length;
  const totalSavings = properties.reduce((sum, p) => {
    if (p.protests && p.protests.length > 0) {
      return sum + (p.protests[0].savings_amount || 0);
    }
    return sum;
  }, 0);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.counties.length > 0) count++;
    if (filters.statuses.length > 0) count++;
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
      case "No Protest": return "gray";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active Protest": return <Gavel className="h-4 w-4" />;
      case "Review Needed": return <AlertCircle className="h-4 w-4" />;
      case "Completed": return <CheckCircle className="h-4 w-4" />;
      case "No Protest": return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

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
              Supabase Data
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
                <p className="text-2xl font-bold">{totalProperties}</p>
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
                <p className="text-2xl font-bold">{activeProtests}</p>
              </div>
              <Gavel className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold">{completedProtests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalSavings.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search properties by address or county..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>
            {getActiveFiltersCount() > 0 && (
              <Button variant="outline" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All ({getActiveFiltersCount()})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <FilterPanel
        title="Advanced Filters"
        activeFiltersCount={getActiveFiltersCount()}
        onClearAll={clearAllFilters}
      >
        <MultiSelectFilter
          label="Status"
          options={uniqueStatuses}
          selectedValues={filters.statuses}
          onSelectionChange={(values) => updateFilter("statuses", values)}
          placeholder="All statuses"
        />
        
        <MultiSelectFilter
          label="County"
          options={uniqueCounties}
          selectedValues={filters.counties}
          onSelectionChange={(values) => updateFilter("counties", values)}
          placeholder="All counties"
        />
      </FilterPanel>

      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProperties.map((property) => {
              const propertyStatus = getPropertyStatus(property);
              const activeProtest = property.protests && property.protests.length > 0 ? property.protests[0] : null;
              
              return (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{property.situs_address}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getStatusColor(propertyStatus) as any} className="flex items-center gap-1">
                            {getStatusIcon(propertyStatus)}
                            {propertyStatus}
                          </Badge>
                        </div>
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
                            <Gavel className="h-4 w-4 mr-2" />
                            View Protest
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">County:</span>
                        <span className="text-sm">{property.county || 'Not specified'}</span>
                      </div>
                      {property.parcel_number && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-600">Parcel:</span>
                          <span className="text-sm font-mono">{property.parcel_number}</span>
                        </div>
                      )}
                      {activeProtest && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Assessed Value:</span>
                            <span className="text-sm">${(activeProtest.assessed_value || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Potential Savings:</span>
                            <span className="text-sm text-green-600">${(activeProtest.savings_amount || 0).toLocaleString()}</span>
                          </div>
                          {activeProtest.hearing_date && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-600">Hearing Date:</span>
                              <span className="text-sm">{new Date(activeProtest.hearing_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-500">
                        Created: {new Date(property.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {activeProtest && (
                          <Button variant="outline" size="sm">
                            <Gavel className="h-4 w-4 mr-1" />
                            Protest
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
                    <TableHead>Status</TableHead>
                    <TableHead>Assessed Value</TableHead>
                    <TableHead>Potential Savings</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => {
                    const propertyStatus = getPropertyStatus(property);
                    const activeProtest = property.protests && property.protests.length > 0 ? property.protests[0] : null;
                    
                    return (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.situs_address}</TableCell>
                        <TableCell>{property.county || 'Not specified'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(propertyStatus) as any} className="flex items-center gap-1 w-fit">
                            {getStatusIcon(propertyStatus)}
                            {propertyStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {activeProtest ? `$${(activeProtest.assessed_value || 0).toLocaleString()}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {activeProtest ? `$${(activeProtest.savings_amount || 0).toLocaleString()}` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(property.created_at).toLocaleDateString()}
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
                                Edit Property
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Gavel className="h-4 w-4 mr-2" />
                                View Protest
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}