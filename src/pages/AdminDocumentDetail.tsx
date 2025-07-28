import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ArrowLeft,
  User,
  Users,
  Building,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDocumentDetail() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [documentData, setDocumentData] = useState<any | null>(null);
  const [associatedProperties, setAssociatedProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documentId) {
      loadDocumentDetails(documentId);
    }
  }, [documentId]);

  const loadDocumentDetails = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch document with owner and contact
      const { data: docData, error: docError } = await supabase
        .from('customer_documents')
        .select(`
          *,
          owners(
            id,
            name,
            owner_type,
            mailing_address,
            mailing_city,
            mailing_state,
            mailing_zip
          ),
          contacts(
            id,
            first_name,
            last_name,
            email,
            phone,
            mailing_address,
            mailing_city,
            mailing_state,
            mailing_zip
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (docError) throw docError;
      setDocumentData(docData);

      // Fetch all properties owned by the same owner as this document
      if (docData?.owner_id) {
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id,
            situs_address,
            county,
            parcel_number,
            assessed_value,
            estimated_savings,
            created_at,
            protests(
              id,
              appeal_status,
              savings_amount,
              hearing_date
            )
          `)
          .eq('owner_id', docData.owner_id)
          .order('created_at', { ascending: false });

        if (propertiesError) throw propertiesError;
        setAssociatedProperties(propertiesData || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document details');
      console.error('Failed to load document details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('customer-documents')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download document:', err);
      setError('Failed to download document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "generated": return "green";
      case "draft": return "yellow";
      case "delivered": return "blue";
      case "signed": return "purple";
      default: return "gray";
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
            <h2 className="text-2xl font-bold">Loading Document Details...</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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

  if (error || !documentData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Document Not Found</h2>
            <p className="text-red-600">{error || 'Document details could not be loaded'}</p>
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
          <h2 className="text-2xl font-bold">
            {documentData.document_type === 'form-50-162' ? 'Form 50-162' : documentData.document_type}
          </h2>
          <p className="text-slate-600">Document ID: {documentData.id}</p>
        </div>
      </div>

      {/* Document Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Document Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generated on {new Date(documentData.generated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(documentData.status) as any}>
                {documentData.status}
              </Badge>
              <Button onClick={() => handleDownloadDocument(documentData.file_path)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Contact</h3>
              </div>
              <div className="space-y-2">
                {documentData.contacts ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <button
                        onClick={() => navigate(`/admin/customers/${documentData.contacts.id}`)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {documentData.contacts.first_name} {documentData.contacts.last_name}
                      </button>
                    </div>
                    {documentData.contacts.email && (
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-500" />
                          <p className="font-medium text-sm">{documentData.contacts.email}</p>
                        </div>
                      </div>
                    )}
                    {documentData.contacts.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <p className="font-medium text-sm">{documentData.contacts.phone}</p>
                        </div>
                      </div>
                    )}
                    {documentData.contacts.mailing_address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Mailing Address</p>
                        <p className="font-medium text-sm">
                          {documentData.contacts.mailing_address}<br/>
                          {documentData.contacts.mailing_city}, {documentData.contacts.mailing_state} {documentData.contacts.mailing_zip}
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
                {documentData.owners ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <button
                        onClick={() => navigate(`/admin/owners/${documentData.owners.id}`)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {documentData.owners.name}
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{documentData.owners.owner_type}</p>
                    </div>
                    {documentData.owners.mailing_address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Mailing Address</p>
                        <p className="font-medium text-sm">
                          {documentData.owners.mailing_address}<br/>
                          {documentData.owners.mailing_city}, {documentData.owners.mailing_state} {documentData.owners.mailing_zip}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No owner assigned</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Associated Properties */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            <CardTitle>Associated Properties ({associatedProperties.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {associatedProperties.length > 0 ? (
            <div className="space-y-4">
              {associatedProperties.map((property) => (
                <div 
                  key={property.id} 
                  className="p-4 bg-slate-50 rounded-lg border cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => navigate(`/admin/property/${property.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{property.situs_address}</h4>
                      <p className="text-sm text-muted-foreground">{property.county} County</p>
                    </div>
                    <div className="text-right">
                      {property.assessed_value && (
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">${property.assessed_value.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    {property.parcel_number && (
                      <div>
                        <p className="text-xs text-muted-foreground">Parcel Number</p>
                        <p className="text-sm font-mono">{property.parcel_number}</p>
                      </div>
                    )}
                    {property.estimated_savings && (
                      <div>
                        <p className="text-xs text-muted-foreground">Estimated Savings</p>
                        <p className="text-sm font-medium text-green-600">
                          ${property.estimated_savings.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Added</p>
                      <p className="text-sm">{new Date(property.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Property Protests */}
                  {property.protests && property.protests.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Active Protests:</p>
                      <div className="flex flex-wrap gap-2">
                        {property.protests.map((protest: any) => (
                          <div key={protest.id} className="flex items-center gap-2">
                            <Badge variant={getProtestStatusColor(protest.appeal_status) as any} className="text-xs">
                              {protest.appeal_status}
                            </Badge>
                            {protest.savings_amount && (
                              <span className="text-xs text-green-600 font-medium">
                                ${protest.savings_amount.toLocaleString()}
                              </span>
                            )}
                            {protest.hearing_date && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(protest.hearing_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No properties associated with this document</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}