import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  User,
  Users,
  FileText,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Hash,
  Calendar,
  DollarSign,
  Gavel,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminPropertyDetail() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [propertyDetails, setPropertyDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propertyId) {
      loadPropertyDetails(propertyId);
    }
  }, [propertyId]);

  const loadPropertyDetails = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          contacts (
            id,
            first_name,
            last_name,
            email,
            phone,
            mailing_address,
            mailing_city,
            mailing_state,
            mailing_zip
          ),
          owner:owners (
            id,
            name,
            owner_type
          ),
          protests (
            id,
            appeal_status,
            exemption_status,
            savings_amount,
            assessed_value,
            protest_amount,
            market_value,
            hearing_date,
            tax_year,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPropertyDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property details');
      console.error('Failed to load property details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getProtestStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": 
      case "accepted": return "green";
      case "pending": 
      case "in_progress": return "orange";
      case "rejected": return "red";
      case "needs_review": return "yellow";
      default: return "gray";
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
            <h2 className="text-2xl font-bold">Loading Property Details...</h2>
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

  if (error || !propertyDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Property Not Found</h2>
            <p className="text-red-600">{error || 'Property details could not be loaded'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to CRM
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{propertyDetails.situs_address}</h2>
          <p className="text-slate-600">{propertyDetails.county}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Property Details */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Property Details</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{propertyDetails.situs_address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">County</p>
                  <p className="font-medium">{propertyDetails.county}</p>
                </div>
                {propertyDetails.parcel_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Parcel Number</p>
                    <p className="font-medium font-mono text-sm">{propertyDetails.parcel_number}</p>
                  </div>
                )}
                {propertyDetails.assessed_value && (
                  <div>
                    <p className="text-sm text-muted-foreground">Assessed Value</p>
                    <p className="font-medium">${propertyDetails.assessed_value.toLocaleString()}</p>
                  </div>
                )}
                {propertyDetails.estimated_savings && (
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Savings</p>
                    <p className="font-medium text-green-600">${propertyDetails.estimated_savings.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Contact</h3>
              </div>
              <div className="space-y-2">
                {propertyDetails.contacts ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <button
                        onClick={() => navigate(`/admin/customers/${propertyDetails.contacts.id}`)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {propertyDetails.contacts.first_name} {propertyDetails.contacts.last_name}
                      </button>
                    </div>
                    {propertyDetails.contacts.email && (
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-500" />
                          <p className="font-medium text-sm">{propertyDetails.contacts.email}</p>
                        </div>
                      </div>
                    )}
                    {propertyDetails.contacts.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <p className="font-medium text-sm">{propertyDetails.contacts.phone}</p>
                        </div>
                      </div>
                    )}
                    {propertyDetails.contacts.mailing_address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Mailing Address</p>
                        <p className="font-medium text-sm">
                          {propertyDetails.contacts.mailing_address}<br/>
                          {propertyDetails.contacts.mailing_city}, {propertyDetails.contacts.mailing_state} {propertyDetails.contacts.mailing_zip}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No contact assigned</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Owner</h3>
              </div>
              <div className="space-y-2">
                {propertyDetails.owner ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <button
                        onClick={() => navigate(`/admin/owners/${propertyDetails.owner.id}`)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {propertyDetails.owner.name}
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{propertyDetails.owner.owner_type}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No owner assigned</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protests Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Protests ({propertyDetails.protests?.length || 0})</h3>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {propertyDetails.protests?.length > 0 ? (
                  propertyDetails.protests.map((protest: any) => (
                    <div 
                      key={protest.id} 
                      className="p-3 bg-slate-50 rounded border cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => navigate(`/admin/protest/${protest.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">Tax Year {protest.tax_year}</p>
                        <Badge variant={getProtestStatusColor(protest.appeal_status) as any}>
                          {protest.appeal_status}
                        </Badge>
                      </div>
                      {protest.assessed_value && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          Assessed: ${protest.assessed_value.toLocaleString()}
                        </div>
                      )}
                      {protest.savings_amount && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <DollarSign className="h-3 w-3" />
                          Savings: ${protest.savings_amount.toLocaleString()}
                        </div>
                      )}
                      {protest.hearing_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Hearing: {new Date(protest.hearing_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No protests filed</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}