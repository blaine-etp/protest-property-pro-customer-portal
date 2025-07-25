import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Phone, Mail, MapPin, FileText, Building, Users, Calculator, Receipt, MessageSquare } from "lucide-react";

// Real data types
interface ContactProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mailing_address?: string;
  mailing_address_2?: string;
  mailing_city?: string;
  mailing_state?: string;
  mailing_zip?: string;
  created_at: string;
  status: string;
}

interface ContactProperty {
  id: string;
  situs_address: string;
  protests: ContactProtest[];
}

interface ContactProtest {
  id: string;
  appeal_status: string;
}

interface ContactCommunication {
  id: string;
  subject: string;
  status: string;
  inquiry_type: string;
  created_at: string;
}

interface ContactDocument {
  id: string;
  document_type: string;
  status: string;
  generated_at: string;
}

interface ContactBill {
  id: string;
  bill_number: string;
  status: string;
  total_fee_amount: number;
  paid_date?: string;
  due_date?: string;
}

interface ContactDetailData {
  profile: ContactProfile;
  properties: ContactProperty[];
  communications: ContactCommunication[];
  documents: ContactDocument[];
  referrals: any[];
  bills: ContactBill[];
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

        // Fetch contact data from Supabase
        const { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', contactId)
          .single();

        if (contactError) throw contactError;
        if (!contactData) throw new Error("Contact not found");

        // Fetch properties with protests
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id,
            situs_address,
            protests:protests(id, appeal_status)
          `)
          .eq('contact_id', contactId);

        if (propertiesError) throw propertiesError;

        // Fetch communications
        const { data: communicationsData, error: communicationsError } = await supabase
          .from('communications')
          .select('*')
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (communicationsError) throw communicationsError;

        // Fetch documents (customer_documents table references properties)
        const propertyIds = propertiesData?.map(p => p.id) || [];
        const { data: documentsData, error: documentsError } = await supabase
          .from('customer_documents')
          .select('*')
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false })
          .limit(10);

        if (documentsError) throw documentsError;

        // Fetch bills
        const { data: billsData, error: billsError } = await supabase
          .from('bills')
          .select('*')
          .eq('owner_id', contactId) // Assuming bills are linked to contacts as owners
          .order('created_at', { ascending: false })
          .limit(10);

        if (billsError) throw billsError;

        setContactData({
          profile: {
            id: contactData.id,
            first_name: contactData.first_name,
            last_name: contactData.last_name,
            email: contactData.email,
            phone: contactData.phone,
            mailing_address: contactData.mailing_address,
            mailing_address_2: contactData.mailing_address_2,
            mailing_city: contactData.mailing_city,
            mailing_state: contactData.mailing_state,
            mailing_zip: contactData.mailing_zip,
            created_at: contactData.created_at,
            status: contactData.status || 'active'
          },
          properties: (propertiesData || []).map(prop => ({
            id: prop.id,
            situs_address: prop.situs_address,
            protests: (prop.protests || []).map((protest: any) => ({
              id: protest.id,
              appeal_status: protest.appeal_status
            }))
          })),
          communications: (communicationsData || []).map(comm => ({
            id: comm.id,
            subject: comm.subject,
            status: comm.status,
            inquiry_type: comm.inquiry_type,
            created_at: comm.created_at
          })),
          documents: (documentsData || []).map(doc => ({
            id: doc.id,
            document_type: doc.document_type,
            status: doc.status,
            generated_at: doc.created_at
          })),
          referrals: [], // TODO: Implement referrals
          bills: (billsData || []).map(bill => ({
            id: bill.id,
            bill_number: bill.bill_number,
            status: bill.status,
            total_fee_amount: bill.total_fee_amount || 0,
            paid_date: bill.paid_date,
            due_date: bill.due_date
          }))
        });

      } catch (err: any) {
        console.error("Error fetching contact data:", err);
        setError(err.message || "Failed to load contact information");
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
  const referralsGiven = 0; // TODO: Implement referrals
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
            <div className="text-2xl font-bold">$0</div>
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
                    <div className="font-medium">{property.situs_address}</div>
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