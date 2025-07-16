import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Phone, Mail, MapPin, FileText, Building, Users, Calculator, Receipt, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Property = Tables<"properties">;
type Communication = Tables<"communications">;
type Document = Tables<"customer_documents">;
type ReferralRelationship = Tables<"referral_relationships">;
type Bill = Tables<"bills">;
type Protest = Tables<"protests">;

interface ContactDetailData {
  profile: Profile;
  properties: (Property & { protests: Protest[] })[];
  communications: Communication[];
  documents: Document[];
  referrals: ReferralRelationship[];
  bills: Bill[];
}

export default function AdminContactDetail() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [contactData, setContactData] = useState<ContactDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contactId) return;

    const fetchContactData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", contactId)
          .single();

        if (profileError) throw profileError;

        // Fetch properties with protests
        const { data: properties, error: propertiesError } = await supabase
          .from("properties")
          .select(`
            *,
            protests (*)
          `)
          .eq("user_id", profile.user_id);

        if (propertiesError) throw propertiesError;

        // Fetch communications
        const { data: communications, error: communicationsError } = await supabase
          .from("communications")
          .select("*")
          .eq("contact_id", contactId)
          .order("created_at", { ascending: false });

        if (communicationsError) throw communicationsError;

        // Fetch documents
        const { data: documents, error: documentsError } = await supabase
          .from("customer_documents")
          .select("*")
          .eq("user_id", profile.user_id)
          .order("created_at", { ascending: false });

        if (documentsError) throw documentsError;

        // Fetch referrals (both as referrer and referee)
        const { data: referrals, error: referralsError } = await supabase
          .from("referral_relationships")
          .select("*")
          .or(`referrer_id.eq.${profile.user_id},referee_id.eq.${profile.user_id}`)
          .order("created_at", { ascending: false });

        if (referralsError) throw referralsError;

        // Fetch bills through property owners
        const propertyIds = properties?.map(p => p.id) || [];
        let bills: Bill[] = [];
        
        if (propertyIds.length > 0) {
          const { data: billsData, error: billsError } = await supabase
            .from("bills")
            .select(`
              *,
              owners!inner (
                properties!inner (id)
              )
            `)
            .in("owners.properties.id", propertyIds);

          if (!billsError && billsData) {
            bills = billsData;
          }
        }

        setContactData({
          profile,
          properties: properties || [],
          communications: communications || [],
          documents: documents || [],
          referrals: referrals || [],
          bills: bills || []
        });

      } catch (err) {
        console.error("Error fetching contact data:", err);
        setError("Failed to load contact information");
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, [contactId]);

  const getProtestStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">Loading contact information...</div>
      </div>
    );
  }

  if (error || !contactData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8 text-red-600">
          {error || "Contact not found"}
        </div>
      </div>
    );
  }

  const { profile, properties, communications, documents, referrals, bills } = contactData;

  const totalProtests = properties.reduce((sum, prop) => sum + prop.protests.length, 0);
  const openProtests = properties.reduce((sum, prop) => 
    sum + prop.protests.filter(p => p.appeal_status === "pending").length, 0
  );
  const referralsGiven = referrals.filter(r => r.referrer_id === profile.user_id).length;
  const paidBills = bills.filter(b => b.status === "paid");
  const openBills = bills.filter(b => b.status !== "paid");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>
      </div>

      {/* Contact Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{properties.length}</div>
            <div className="text-sm text-muted-foreground">Properties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalProtests}</div>
            <div className="text-sm text-muted-foreground">Total Protests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{referralsGiven}</div>
            <div className="text-sm text-muted-foreground">Referrals Given</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(profile.lifetime_savings)}</div>
            <div className="text-sm text-muted-foreground">Lifetime Savings</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.mailing_address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div>{profile.mailing_address}</div>
                  {profile.mailing_address_2 && <div>{profile.mailing_address_2}</div>}
                  <div>
                    {profile.mailing_city}, {profile.mailing_state} {profile.mailing_zip}
                  </div>
                </div>
              </div>
            )}
            <Separator />
            <div className="text-sm text-muted-foreground">
              Member since: {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Properties ({properties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {properties.length === 0 ? (
                <p className="text-muted-foreground">No properties found</p>
              ) : (
                properties.map((property) => (
                  <div key={property.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="font-medium">{property.address}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {property.protests.length} protests
                      </Badge>
                      {property.protests.some(p => p.appeal_status === "pending") && (
                        <Badge className="text-xs bg-yellow-100 text-yellow-800">
                          Open Protest
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Communications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Communications ({communications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {communications.length === 0 ? (
                <p className="text-muted-foreground">No communications found</p>
              ) : (
                communications.slice(0, 5).map((comm) => (
                  <div key={comm.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{comm.subject}</div>
                      <Badge className={getProtestStatusColor(comm.status)}>
                        {comm.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {comm.inquiry_type} • {new Date(comm.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-muted-foreground">No documents found</p>
              ) : (
                documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="font-medium">{doc.document_type}</div>
                    <div className="text-sm text-muted-foreground">
                      Generated: {new Date(doc.generated_at).toLocaleDateString()}
                    </div>
                    <Badge className="text-xs mt-1" variant="outline">
                      {doc.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing & Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Paid Invoices ({paidBills.length})</h4>
                <div className="space-y-2">
                  {paidBills.slice(0, 3).map((bill) => (
                    <div key={bill.id} className="p-2 border rounded text-sm">
                      <div className="flex justify-between">
                        <span>{bill.bill_number}</span>
                        <span className="text-green-600">{formatCurrency(bill.total_fee_amount)}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Paid: {bill.paid_date ? new Date(bill.paid_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Open Invoices ({openBills.length})</h4>
                <div className="space-y-2">
                  {openBills.slice(0, 3).map((bill) => (
                    <div key={bill.id} className="p-2 border rounded text-sm">
                      <div className="flex justify-between">
                        <span>{bill.bill_number}</span>
                        <span className="text-red-600">{formatCurrency(bill.total_fee_amount)}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Due: {bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}