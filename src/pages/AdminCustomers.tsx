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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-slate-600" />
                    {property.address}
                  </CardTitle>
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
                      Generate Documents
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Associated Profile/Contact */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Associated Contact</span>
                </div>
                <div>
                  <p className="font-medium text-blue-900">{property.profile.name}</p>
                  <p className="text-sm text-blue-700">{property.profile.email}</p>
                  <p className="text-sm text-blue-700">{property.profile.phone}</p>
                </div>
              </div>

              {/* Owner Information */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-800">Property Owner</span>
                  {getOwnerTypeBadge(property.owner)}
                </div>
                <p className="font-medium text-slate-900">{property.owner.name}</p>
                {property.owner.entityName && property.owner.entityName !== property.owner.name && (
                  <p className="text-sm text-slate-600">Entity: {property.owner.entityName}</p>
                )}
              </div>

              {/* Protest Status */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gavel className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">Protest Status</span>
                </div>
                {getProtestStatusBadge(property.protest)}
              </div>

              {/* Associated IDs */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Associated IDs</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Parcel:</span>
                    <span className="font-mono text-green-900">{property.associatedIds.parcelNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">County PID:</span>
                    <span className="font-mono text-green-900">{property.associatedIds.countyPid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">ETP PID:</span>
                    <span className="font-mono text-green-900">{property.associatedIds.etpPid}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Gavel className="h-4 w-4 mr-1" />
                  Manage Protest
                </Button>
              </div>
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