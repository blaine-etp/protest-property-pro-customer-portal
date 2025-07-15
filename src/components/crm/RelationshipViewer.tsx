import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight, Users, Building, FileText, CreditCard, Gavel } from "lucide-react";

interface RelationshipViewerProps {
  entityId: string;
  onClose: () => void;
}

export function RelationshipViewer({ entityId, onClose }: RelationshipViewerProps) {
  const entityData = {
    contacts: {
      name: "John Smith",
      type: "Contact",
      icon: Users,
      color: "blue",
      data: {
        email: "john.smith@email.com",
        phone: "(555) 123-4567",
        status: "Active",
      },
      relationships: [
        { type: "owns", target: "123 Main Street", targetType: "Property", count: 2 },
        { type: "has filed", target: "Protest #001", targetType: "Protest", count: 1 },
        { type: "received", target: "Form 50-162", targetType: "Document", count: 3 },
      ]
    },
    properties: {
      name: "123 Main Street",
      type: "Property",
      icon: Building,
      color: "purple",
      data: {
        address: "123 Main Street, Austin, TX 78701",
        assessedValue: "$450,000",
        taxYear: "2024",
      },
      relationships: [
        { type: "owned by", target: "John Smith", targetType: "Contact", count: 1 },
        { type: "has bill", target: "TAX-2024-001", targetType: "Bill", count: 1 },
        { type: "has protest", target: "Protest #001", targetType: "Protest", count: 1 },
      ]
    },
    // Add more entity types as needed
  };

  const entity = entityData[entityId as keyof typeof entityData];
  
  if (!entity) {
    return null;
  }

  const EntityIcon = entity.icon;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Relationship Viewer</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Entity Details */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${entity.color}-100 rounded-lg`}>
                <EntityIcon className={`h-5 w-5 text-${entity.color}-600`} />
              </div>
              <div>
                <CardTitle className="text-lg">{entity.name}</CardTitle>
                <Badge variant="outline">{entity.type}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(entity.data).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Relationships */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Entities</CardTitle>
            <CardDescription>
              Related records and their connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entity.relationships.map((relationship, index) => {
                const getTargetIcon = (targetType: string) => {
                  switch (targetType) {
                    case "Contact": return Users;
                    case "Property": return Building;
                    case "Protest": return Gavel;
                    case "Document": return FileText;
                    case "Bill": return CreditCard;
                    default: return FileText;
                  }
                };

                const getTargetColor = (targetType: string) => {
                  switch (targetType) {
                    case "Contact": return "blue";
                    case "Property": return "purple";
                    case "Protest": return "orange";
                    case "Document": return "gray";
                    case "Bill": return "green";
                    default: return "gray";
                  }
                };

                const TargetIcon = getTargetIcon(relationship.targetType);
                const targetColor = getTargetColor(relationship.targetType);

                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className={`p-1 bg-${entity.color}-100 rounded`}>
                      <EntityIcon className={`h-3 w-3 text-${entity.color}-600`} />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>{relationship.type}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                    
                    <div className={`p-1 bg-${targetColor}-100 rounded`}>
                      <TargetIcon className={`h-3 w-3 text-${targetColor}-600`} />
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-sm">{relationship.target}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {relationship.targetType}
                        </Badge>
                        {relationship.count > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            {relationship.count} items
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Connection Map */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Visual Connection Map</CardTitle>
            <CardDescription>
              Interactive diagram of entity relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
              <div className="text-center text-slate-500">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <EntityIcon className="h-6 w-6" />
                </div>
                <p className="text-sm">Interactive relationship diagram</p>
                <p className="text-xs">Showing connections to {entity.relationships.length} entities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                View All Connections
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Building className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}