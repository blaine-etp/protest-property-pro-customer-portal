import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight, Users, Building, FileText, CreditCard, Gavel, Mail } from "lucide-react";

interface RelationshipViewerProps {
  entityId: string;
  onClose: () => void;
}

export function RelationshipViewer({ entityId, onClose }: RelationshipViewerProps) {
  const entityData = {
    profiles: {
      name: "User Profile",
      type: "Profile",
      icon: Users,
      color: "blue",
      data: {
        columns: "user_id (PK), first_name, last_name, email, phone, role, permissions",
        rls_policy: "Users can only access their own profile, admins can access all",
        relationships: "1:M with properties, applications, referral_relationships",
      },
      relationships: [
        { type: "owns", target: "Properties", targetType: "properties", count: "1:M" },
        { type: "submits", target: "Applications", targetType: "applications", count: "1:M" },
        { type: "creates", target: "Owners", targetType: "owners", count: "1:M" },
        { type: "participates in", target: "Referral Relationships", targetType: "referral_relationships", count: "1:M" },
      ]
    },
    contacts: {
      name: "Contact Records",
      type: "Contact",
      icon: Users,
      color: "green",
      data: {
        columns: "id (PK), first_name, last_name, email, phone, company, status",
        rls_policy: "Public access to all data (no restrictions)",
        relationships: "1:M with communications, customer_documents",
      },
      relationships: [
        { type: "receives", target: "Communications", targetType: "communications", count: "1:M" },
        { type: "has", target: "Customer Documents", targetType: "customer_documents", count: "1:M" },
        { type: "uploads", target: "Evidence", targetType: "evidence_uploads", count: "1:M" },
      ]
    },
    properties: {
      name: "Property Records",
      type: "Property", 
      icon: Building,
      color: "orange",
      data: {
        columns: "id (PK), user_id (FK), situs_address, parcel_number, county, assessed_value",
        rls_policy: "Users can only access their own properties, admins can access all",
        relationships: "M:1 with profiles, 1:M with protests, evidence_uploads",
      },
      relationships: [
        { type: "owned by", target: "User Profile", targetType: "profiles", count: "M:1" },
        { type: "has", target: "Protests", targetType: "protests", count: "1:M" },
        { type: "has", target: "Evidence Uploads", targetType: "evidence_uploads", count: "1:M" },
        { type: "referenced in", target: "Applications", targetType: "applications", count: "1:M" },
      ]
    },
    protests: {
      name: "Tax Protests",
      type: "Protest",
      icon: Gavel,
      color: "red",
      data: {
        columns: "id (PK), property_id (FK), tax_year, assessed_value, protest_amount, appeal_status",
        rls_policy: "Access via property ownership - users can only see protests for their properties",
        relationships: "M:1 with properties, 1:M with evidence_uploads",
      },
      relationships: [
        { type: "filed for", target: "Property", targetType: "properties", count: "M:1" },
        { type: "has", target: "Evidence Uploads", targetType: "evidence_uploads", count: "1:M" },
        { type: "generates", target: "Bills", targetType: "bills", count: "1:1" },
      ]
    },
    customer_documents: {
      name: "Customer Documents", 
      type: "Document",
      icon: FileText,
      color: "gray",
      data: {
        columns: "id (PK), user_id (FK), document_type, file_path, status, contact_id, property_id",
        rls_policy: "Users can only access their own documents, admins can access all",
        relationships: "M:1 with profiles, contacts, properties",
      },
      relationships: [
        { type: "belongs to", target: "User Profile", targetType: "profiles", count: "M:1" },
        { type: "relates to", target: "Contact", targetType: "contacts", count: "M:1" },
        { type: "relates to", target: "Property", targetType: "properties", count: "M:1" },
      ]
    },
    communications: {
      name: "Communications",
      type: "Communication",
      icon: Mail,
      color: "pink", 
      data: {
        columns: "id (PK), contact_id (FK), subject, message, status, priority, inquiry_type",
        rls_policy: "Public access to all data (no restrictions)",
        relationships: "M:1 with contacts, M:M with properties via junction table",
      },
      relationships: [
        { type: "sent to", target: "Contact", targetType: "contacts", count: "M:1" },
        { type: "relates to", target: "Properties", targetType: "communication_properties", count: "M:M" },
      ]
    },
    bills: {
      name: "Billing Records",
      type: "Bill",
      icon: CreditCard,
      color: "emerald",
      data: {
        columns: "id (PK), user_id (FK), protest_id (FK), tax_year, total_assessed_value, status",
        rls_policy: "Users can only access their own bills, admins can access all",
        relationships: "M:1 with profiles and protests",
      },
      relationships: [
        { type: "billed to", target: "User Profile", targetType: "profiles", count: "M:1" },
        { type: "generated from", target: "Protest", targetType: "protests", count: "1:1" },
      ]
    },
    referral_relationships: {
      name: "Referral System",
      type: "Referral",
      icon: Users,
      color: "violet",
      data: {
        columns: "id (PK), referrer_id (FK), referee_id (FK), status, referral_code, credit_awarded_amount",
        rls_policy: "Public access to all data (no restrictions)", 
        relationships: "M:1 with profiles (referrer & referee), 1:M with credit_transactions",
      },
      relationships: [
        { type: "referrer", target: "User Profile", targetType: "profiles", count: "M:1" },
        { type: "referee", target: "User Profile", targetType: "profiles", count: "M:1" },
        { type: "generates", target: "Credit Transactions", targetType: "credit_transactions", count: "1:M" },
      ]
    },
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
                        <Badge variant="secondary" className="text-xs">
                          {relationship.count}
                        </Badge>
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