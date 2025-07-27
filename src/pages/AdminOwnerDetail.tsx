import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Users,
  Building,
  FileText,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Shield,
  UserCheck,
  Folder,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminOwnerDetail() {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [ownerDetails, setOwnerDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ownerId) {
      loadOwnerDetails(ownerId);
    }
  }, [ownerId]);

  const loadOwnerDetails = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('owners')
        .select(`
          *,
          properties (
            id,
            situs_address,
            county,
            parcel_number,
            contacts!fk_properties_contact_id (
              id,
              first_name,
              last_name,
              email,
              phone
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setOwnerDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load owner details');
      console.error('Failed to load owner details:', err);
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to CRM
        </Button>
          <div>
            <h2 className="text-2xl font-bold">Loading Owner Details...</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

  if (error || !ownerDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Owner Not Found</h2>
            <p className="text-red-600">{error || 'Owner details could not be loaded'}</p>
          </div>
        </div>
      </div>
    );
  }

  const uniqueContacts = Array.from(
    new Map(
      ownerDetails.properties
        ?.flatMap((p: any) => p.contacts || [])
        .map((c: any) => [c.id, c])
    ).values()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to CRM
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{ownerDetails.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getOwnerTypeColor(ownerDetails.owner_type) as any} className="flex items-center gap-1">
              {getOwnerTypeIcon(ownerDetails.owner_type)}
              {formatOwnerType(ownerDetails.owner_type)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Owner Details */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Owner Details</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{ownerDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{formatOwnerType(ownerDetails.owner_type)}</p>
                </div>
                {ownerDetails.form_entity_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Entity Name</p>
                    <p className="font-medium">{ownerDetails.form_entity_name}</p>
                  </div>
                )}
                {ownerDetails.form_entity_type && (
                  <div>
                    <p className="text-sm text-muted-foreground">Entity Type</p>
                    <p className="font-medium">{ownerDetails.form_entity_type}</p>
                  </div>
                )}
                {ownerDetails.entity_relationship && (
                  <div>
                    <p className="text-sm text-muted-foreground">Relationship</p>
                    <p className="font-medium">{ownerDetails.entity_relationship}</p>
                  </div>
                )}
                {ownerDetails.mailing_address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Mailing Address</p>
                    <p className="font-medium text-sm">
                      {ownerDetails.mailing_address}
                      {ownerDetails.mailing_address_2 && <><br/>{ownerDetails.mailing_address_2}</>}
                      <br/>
                      {ownerDetails.mailing_city}, {ownerDetails.mailing_state} {ownerDetails.mailing_zip}
                    </p>
                  </div>
                )}
                {ownerDetails.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium text-sm">{ownerDetails.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attached Properties */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Properties ({ownerDetails.properties?.length || 0})</h3>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {ownerDetails.properties?.map((property: any) => (
                  <div key={property.id} className="p-3 bg-slate-50 rounded border">
                    <p className="font-medium text-sm">{property.situs_address}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">{property.county}</p>
                      {property.parcel_number && (
                        <p className="text-xs text-muted-foreground font-mono">{property.parcel_number}</p>
                      )}
                    </div>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No properties attached</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attached Contacts */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Contacts ({uniqueContacts.length})</h3>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uniqueContacts.map((contact: any) => (
                  <div key={contact.id} className="p-3 bg-slate-50 rounded border">
                    <button
                      onClick={() => navigate(`/admin/customers/${contact.id}`)}
                      className="text-left w-full hover:bg-slate-100 transition-colors"
                    >
                      <p className="font-medium text-sm text-blue-600 hover:text-blue-800">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <div className="flex flex-col gap-1 mt-1">
                        {contact.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No contacts attached</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attached Documents */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Documents (0)</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No documents attached</p>
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}