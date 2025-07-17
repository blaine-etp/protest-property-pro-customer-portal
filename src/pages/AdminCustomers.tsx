import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Building, 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  FileText, 
  Gavel, 
  Eye, 
  Edit, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Clock,
  Hash,
  UserCheck,
  Building2
} from "lucide-react";

// Mock property data with the requested information
const mockProperties = [
  {
    id: "1",
    address: "123 Main Street, Austin, TX 78701",
    profile: {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(512) 555-0123"
    },
    owner: {
      name: "John & Mary Smith",
      type: "individual",
      entityName: null
    },
    protest: {
      hasOpenProtest: true,
      status: "filed",
      taxYear: 2024,
      filedDate: "2024-03-15"
    },
    associatedIds: {
      parcelNumber: "12345-67890",
      countyPid: "TX-TRAV-12345",
      etpPid: "ETP-2024-001"
    }
  },
  {
    id: "2", 
    address: "456 Oak Avenue, Austin, TX 78704",
    profile: {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com", 
      phone: "(512) 555-0456"
    },
    owner: {
      name: "Johnson Family Trust",
      type: "trust",
      entityName: "Johnson Family Trust"
    },
    protest: {
      hasOpenProtest: true,
      status: "settled",
      taxYear: 2024,
      settledDate: "2024-04-22",
      savingsAmount: 2850
    },
    associatedIds: {
      parcelNumber: "23456-78901",
      countyPid: "TX-TRAV-23456", 
      etpPid: "ETP-2024-002"
    }
  },
  {
    id: "3",
    address: "789 Cedar Lane, Austin, TX 78731",
    profile: {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Mike Wilson",
      email: "mike.wilson@example.com",
      phone: "(512) 555-0789"
    },
    owner: {
      name: "Wilson Properties LLC",
      type: "entity",
      entityName: "Wilson Properties LLC"
    },
    protest: {
      hasOpenProtest: false,
      status: "none",
      taxYear: 2024
    },
    associatedIds: {
      parcelNumber: "34567-89012",
      countyPid: "TX-TRAV-34567",
      etpPid: "ETP-2024-003"
    }
  },
  {
    id: "4",
    address: "321 Pine Street, Austin, TX 78745",
    profile: {
      id: "550e8400-e29b-41d4-a716-446655440004", 
      name: "Emily Davis",
      email: "emily.davis@example.com",
      phone: "(512) 555-0321"
    },
    owner: {
      name: "Emily Davis",
      type: "individual",
      entityName: null
    },
    protest: {
      hasOpenProtest: true,
      status: "filed",
      taxYear: 2024,
      filedDate: "2024-04-01"
    },
    associatedIds: {
      parcelNumber: "45678-90123",
      countyPid: "TX-TRAV-45678",
      etpPid: "ETP-2024-004"
    }
  }
];

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState(mockProperties);

  const filteredProperties = properties.filter(property =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.associatedIds.parcelNumber.includes(searchTerm)
  );

  const getProtestStatusBadge = (protest: any) => {
    if (!protest.hasOpenProtest) {
      return (
        <Badge variant="outline" className="text-slate-600">
          <Clock className="h-3 w-3 mr-1" />
          No Active Protest
        </Badge>
      );
    }

    switch (protest.status) {
      case "filed":
        return (
          <Badge variant="destructive">
            <Gavel className="h-3 w-3 mr-1" />
            Filed - {protest.filedDate}
          </Badge>
        );
      case "settled":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Settled - ${protest.savingsAmount?.toLocaleString()} saved
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            {protest.status}
          </Badge>
        );
    }
  };

  const getOwnerTypeBadge = (owner: any) => {
    switch (owner.type) {
      case "individual":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            <UserCheck className="h-3 w-3 mr-1" />
            Individual
          </Badge>
        );
      case "trust":
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            <Building className="h-3 w-3 mr-1" />
            Trust
          </Badge>
        );
      case "entity":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            <Building2 className="h-3 w-3 mr-1" />
            Entity
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Property Management</h1>
          <p className="text-slate-600 mt-2">
            Manage customer properties, owners, and protest status.
          </p>
        </div>
        <Button>
          <Building className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by address, contact name, owner, or parcel number..."
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

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-slate-900 mb-1">
                    {property.address}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">{property.associatedIds.parcelNumber}</span>
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Primary Contact & Protest Status - Most Important Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-slate-900">{property.profile.name}</span>
                  </div>
                  {getProtestStatusBadge(property.protest)}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building className="h-4 w-4" />
                  <span>{property.owner.name}</span>
                  {getOwnerTypeBadge(property.owner)}
                </div>
              </div>

              {/* Key Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="default" size="sm" className="flex-1">
                  <FileText className="h-4 w-4 mr-1" />
                  View 50-162
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Gavel className="h-4 w-4 mr-1" />
                  Protest
                </Button>
              </div>

              {/* Additional Details - Collapsible */}
              <details className="group">
                <summary className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                  <span>More Details</span>
                  <svg className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <span className="text-slate-600">Contact:</span>
                    <div className="ml-2">
                      <p>{property.profile.email}</p>
                      <p>{property.profile.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-slate-600">Property IDs:</span>
                    <div className="ml-2 space-y-1">
                      <p><span className="font-mono">{property.associatedIds.countyPid}</span></p>
                      <p><span className="font-mono">{property.associatedIds.etpPid}</span></p>
                    </div>
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No properties found</h3>
              <p className="text-slate-600">Try adjusting your search criteria or add a new property.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}