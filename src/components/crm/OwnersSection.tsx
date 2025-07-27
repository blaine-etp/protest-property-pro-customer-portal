import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Users,
  Building,
  Search,
  Plus,
  X,
  Building2,
  Briefcase,
  Shield,
  UserCheck,
  Folder,
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
      
      const { data, error } = await supabase
        .from('owners')
        .select(`
          *,
          properties!fk_properties_owner_id (
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
    const matchesSearch = !filters.search || 
      (owner.name && owner.name.toLowerCase().includes(filters.search.toLowerCase()));
    
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
  const corporateOwners = owners.filter(o => ['llc', 'corporation', 'partnership'].includes(o.owner_type)).length;
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
      case "llc": return <Briefcase className="h-4 w-4" />;
      case "corporation": return <Building2 className="h-4 w-4" />;
      case "trust": return <Shield className="h-4 w-4" />;
      case "partnership": return <UserCheck className="h-4 w-4" />;
      case "estate": return <Folder className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getOwnerTypeColor = (type: string) => {
    switch (type) {
      case "individual": return "blue";
      case "llc": return "green";
      case "corporation": return "purple";
      case "trust": return "orange";
      case "partnership": return "cyan";
      case "estate": return "pink";
      default: return "gray";
    }
  };

  const formatOwnerType = (type: string) => {
    switch (type) {
      case "llc": return "LLC";
      case "corporation": return "Corporation";
      case "trust": return "Trust";
      case "partnership": return "Partnership";
      case "estate": return "Estate";
      case "individual": return "Individual";
      default: return type;
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
                <p className="text-sm font-medium text-slate-600">Corporate</p>
                <p className="text-2xl font-bold">{corporateOwners}</p>
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
                placeholder="Search owners by name..."
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
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOwners.map((owner) => (
              <Card 
                key={owner.id} 
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/admin/owners/${owner.id}`)}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{owner.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getOwnerTypeColor(owner.owner_type) as any} className="flex items-center gap-1">
                          {getOwnerTypeIcon(owner.owner_type)}
                          {formatOwnerType(owner.owner_type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Properties</p>
                      <p className="text-sm font-medium">{owner.properties?.length || 0}</p>
                    </div>
                    {owner.mailing_address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="text-sm font-medium">
                          {owner.mailing_city && owner.mailing_state ? 
                            `${owner.mailing_city}, ${owner.mailing_state}` : 
                            'Address on file'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}