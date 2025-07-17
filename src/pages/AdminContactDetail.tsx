import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Phone, Mail, MapPin, FileText, Building, Users, Calculator, Receipt, MessageSquare } from "lucide-react";

// Mock data types
interface MockProfile {
  id: string;
  user_id: string;
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
  lifetime_savings: number;
}

interface MockProperty {
  id: string;
  address: string;
  protests: MockProtest[];
}

interface MockProtest {
  id: string;
  appeal_status: string;
}

interface MockCommunication {
  id: string;
  subject: string;
  status: string;
  inquiry_type: string;
  created_at: string;
}

interface MockDocument {
  id: string;
  document_type: string;
  status: string;
  generated_at: string;
}

interface MockBill {
  id: string;
  bill_number: string;
  status: string;
  total_fee_amount: number;
  paid_date?: string;
  due_date?: string;
}

interface ContactDetailData {
  profile: MockProfile;
  properties: MockProperty[];
  communications: MockCommunication[];
  documents: MockDocument[];
  referrals: any[];
  bills: MockBill[];
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

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock contact data based on contact ID
        const mockContacts = {
          "1": {
            profile: {
              id: "1",
              user_id: "550e8400-e29b-41d4-a716-446655440001",
              first_name: "John",
              last_name: "Smith",
              email: "john.smith@email.com",
              phone: "(555) 123-4567",
              mailing_address: "123 Main St",
              mailing_city: "Austin",
              mailing_state: "TX",
              mailing_zip: "78701",
              created_at: "2023-06-15T10:00:00Z",
              lifetime_savings: 4250
            },
            properties: [
              {
                id: "prop-1",
                address: "123 Main St, Austin, TX 78701",
                protests: [
                  { id: "protest-1", appeal_status: "approved" }
                ]
              },
              {
                id: "prop-2", 
                address: "456 Oak Ave, Austin, TX 78702",
                protests: [
                  { id: "protest-2", appeal_status: "pending" }
                ]
              }
            ],
            communications: [
              {
                id: "comm-1",
                subject: "Property tax appeal submitted",
                status: "open",
                inquiry_type: "appeal",
                created_at: "2024-01-15T14:30:00Z"
              }
            ],
            documents: [
              {
                id: "doc-1",
                document_type: "form-50-162",
                status: "generated",
                generated_at: "2024-01-10T09:00:00Z"
              },
              {
                id: "doc-2",
                document_type: "services-agreement",
                status: "signed",
                generated_at: "2023-12-15T11:00:00Z"
              }
            ],
            bills: [
              {
                id: "bill-1",
                bill_number: "BILL-001",
                status: "paid",
                total_fee_amount: 1200,
                paid_date: "2024-01-05T10:00:00Z"
              }
            ]
          },
          "2": {
            profile: {
              id: "2",
              user_id: "550e8400-e29b-41d4-a716-446655440002",
              first_name: "Sarah",
              last_name: "Johnson",
              email: "sarah.johnson@email.com",
              phone: "(555) 234-5678",
              created_at: "2023-08-20T14:00:00Z",
              lifetime_savings: 0
            },
            properties: [
              {
                id: "prop-3",
                address: "789 Pine St, Austin, TX 78703",
                protests: []
              }
            ],
            communications: [],
            documents: [],
            bills: []
          },
          "3": {
            profile: {
              id: "3",
              user_id: "550e8400-e29b-41d4-a716-446655440003",
              first_name: "Michael",
              last_name: "Brown",
              email: "michael.brown@email.com",
              phone: "(555) 345-6789",
              created_at: "2023-05-10T16:00:00Z",
              lifetime_savings: 7890
            },
            properties: [
              {
                id: "prop-4",
                address: "321 Cedar Ln, Austin, TX 78704",
                protests: [
                  { id: "protest-3", appeal_status: "approved" },
                  { id: "protest-4", appeal_status: "pending" }
                ]
              }
            ],
            communications: [
              {
                id: "comm-2",
                subject: "Follow-up on tax savings",
                status: "closed",
                inquiry_type: "general",
                created_at: "2024-01-13T12:00:00Z"
              }
            ],
            documents: [
              {
                id: "doc-3",
                document_type: "form-50-162",
                status: "generated",
                generated_at: "2024-01-08T08:30:00Z"
              }
            ],
            bills: [
              {
                id: "bill-2",
                bill_number: "BILL-002",
                status: "draft",
                total_fee_amount: 2400,
                due_date: "2024-02-15T10:00:00Z"
              }
            ]
          },
          "4": {
            profile: {
              id: "4",
              user_id: "550e8400-e29b-41d4-a716-446655440004",
              first_name: "Emily",
              last_name: "Davis",
              email: "emily.davis@email.com",
              phone: "(555) 456-7890",
              created_at: "2023-03-25T12:00:00Z",
              lifetime_savings: 2100
            },
            properties: [
              {
                id: "prop-5",
                address: "555 Elm St, Austin, TX 78705",
                protests: [
                  { id: "protest-5", appeal_status: "approved" }
                ]
              }
            ],
            communications: [],
            documents: [
              {
                id: "doc-4",
                document_type: "services-agreement",
                status: "signed",
                generated_at: "2023-12-20T15:30:00Z"
              }
            ],
            bills: [
              {
                id: "bill-3",
                bill_number: "BILL-003",
                status: "paid",
                total_fee_amount: 850,
                paid_date: "2023-12-25T09:00:00Z"
              }
            ]
          }
        };

        const mockData = mockContacts[contactId as keyof typeof mockContacts];
        
        if (!mockData) {
          throw new Error("Contact not found");
        }

        setContactData({
          profile: mockData.profile,
          properties: mockData.properties,
          communications: mockData.communications,
          documents: mockData.documents,
          referrals: [], // Empty for demo
          bills: mockData.bills
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