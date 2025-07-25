import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Users,
  Building,
  Search,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Building2,
  Hash,
  X,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FilterPanel } from "./filters/FilterPanel";
import { MultiSelectFilter } from "./filters/MultiSelectFilter";

interface OwnerFilters {
  search: string;
  ownerTypes: string[];
}

const defaultFilters: OwnerFilters = {
  search: "",
  ownerTypes: [],
};

export function OwnersSection() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<OwnerFilters>(defaultFilters);
  const [viewMode, setViewMode] = useState("grid");
  const [owners, setOwners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch owners with their associated properties count
      const { data, error } = await supabase
        .from('owners')
        .select(`
          *,
          properties (
            id,
            situs_address
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOwners(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load owners');
      console.error('Failed to load owners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter owners based on search and filters
  const filteredOwners = owners.filter(owner => {
    // Search filter
    const matchesSearch = !filters.search || 
      (owner.name && owner.name.toLowerCase().includes(filters.search.toLowerCase())) ||
      (owner.tax_id && owner.tax_id.toLowerCase().includes(filters.search.toLowerCase()));
    
    // Owner type filter
    const matchesType = filters.ownerTypes.length === 0 || 
      filters.ownerTypes.includes(owner.owner_type);
    
    return matchesSearch && matchesType;
  });

  // Get unique values for filters
  const uniqueOwnerTypes = Array.from(new Set(
    owners.map(o => o.owner_type).filter(Boolean)
  ));

  // Calculate statistics
  const totalOwners = owners.length;
  const individualOwners = owners.filter(o => o.owner_type === 'individual').length;
  const entityOwners = owners.filter(o => o.owner_type === 'entity').length;
  const totalProperties = owners.reduce((sum, o) => sum + (o.properties?.length || 0), 0);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.ownerTypes.length > 0) count++;
    return count;
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  const updateFilter = (key: keyof OwnerFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getOwnerTypeIcon = (type: string) => {
    switch (type) {
      case "individual": return <User className="h-4 w-4" />;
      case "entity": return <Building2 className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getOwnerTypeColor = (type: string) => {
    switch (type) {
      case "individual": return "blue";
      case "entity": return "purple";
      default: return "gray";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Owners Management</h2>
            <p className="text-slate-600">Loading owners...</p>
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
            <h2 className="text-2xl font-bold">Owners Management</h2>
            <p className="text-red-600">Error: {error}</p>
          </div>
          <Button onClick={loadOwners}>
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
          <h2 className="text-2xl font-bold">Owners Management</h2>
          <p className="text-slate-600">Manage property owners and their information</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Owner
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Owners</p>
                <p className="text-2xl font-bold">{totalOwners}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Individuals</p>
                <p className="text-2xl font-bold">{individualOwners}</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Entities</p>
                <p className="text-2xl font-bold">{entityOwners}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Properties</p>
                <p className="text-2xl font-bold">{totalProperties}</p>
              </div>
              <Building className="h-8 w-8 text-orange-500" />
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
                placeholder="Search owners by name or tax ID..."
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
          label="Owner Type"
          options={uniqueOwnerTypes}
          selectedValues={filters.ownerTypes}
          onSelectionChange={(values) => updateFilter("ownerTypes", values)}
          placeholder="All types"
        />
      </FilterPanel>

      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOwners.map((owner) => (
              <Card key={owner.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{owner.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getOwnerTypeColor(owner.owner_type) as any} className="flex items-center gap-1">
                          {getOwnerTypeIcon(owner.owner_type)}
                          {owner.owner_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tax ID</p>
                      <p className="text-sm font-medium">{owner.tax_id || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Properties</p>
                      <p className="text-sm font-medium">{owner.properties?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mailing Address</p>
                      <p className="text-sm font-medium">
                        {owner.mailing_address ? 
                          `${owner.mailing_address}, ${owner.mailing_city || ''} ${owner.mailing_state || ''} ${owner.mailing_zip || ''}`.trim() : 
                          'Not provided'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entity Details</p>
                      <p className="text-sm font-medium">
                        {owner.form_entity_name ? `${owner.form_entity_name} (${owner.form_entity_type || 'Unknown'})` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Owner
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Building className="mr-2 h-4 w-4" />
                          View Properties
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tax ID</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOwners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell>
                    <div className="font-medium">{owner.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getOwnerTypeColor(owner.owner_type) as any} className="flex items-center gap-1 w-fit">
                      {getOwnerTypeIcon(owner.owner_type)}
                      {owner.owner_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{owner.tax_id || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4 text-slate-500" />
                      <span>{owner.properties?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {owner.mailing_city && owner.mailing_state ? 
                        `${owner.mailing_city}, ${owner.mailing_state}` : 
                        'Not provided'
                      }
                    </div>
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
                          Edit Owner
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Building className="h-4 w-4 mr-2" />
                          View Properties
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}