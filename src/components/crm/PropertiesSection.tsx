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
} from "lucide-react";
import { dataService } from "@/services";
import type { Property } from "@/services/types";

export function PropertiesSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const filteredProperties = properties.filter(property =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.parcelNumber.includes(searchTerm)
  );

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
                <p className="text-2xl font-bold text-green-600">$7,400</p>
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
                <p className="text-2xl font-bold">$432K</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
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
                placeholder="Search properties by address, owner, or parcel number..."
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
                      <p className="text-sm text-slate-500 mt-1">
                        Parcel: {property.parcelNumber}
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
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusColor(property.status) as any} className="flex items-center gap-1">
                      {getStatusIcon(property.status)}
                      {property.status}
                    </Badge>
                    {property.protestDeadline !== "N/A" && (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {property.protestDeadline}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Owner</p>
                      <p className="font-medium">{property.owner}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Assessed Value</p>
                      <p className="font-medium">{property.assessedValue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Market Value</p>
                      <p className="font-medium">{property.marketValue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Annual Tax</p>
                      <p className="font-medium">{property.taxAmount}</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Potential Savings</span>
                      <span className="text-lg font-bold text-green-600">{property.potentialSavings}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      View Location
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Gavel className="h-4 w-4 mr-1" />
                      File Protest
                    </Button>
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
                    <TableHead>Owner</TableHead>
                    <TableHead>Assessed Value</TableHead>
                    <TableHead>Market Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Potential Savings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{property.address}</p>
                          <p className="text-sm text-slate-500">Parcel: {property.parcelNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>{property.owner}</TableCell>
                      <TableCell>{property.assessedValue}</TableCell>
                      <TableCell>{property.marketValue}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(property.status) as any}>
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {property.potentialSavings}
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