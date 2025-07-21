import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  MapPin,
  Phone,
  Mail,
  FileText,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Bot,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ProtestStatusSelect } from "@/components/protest/ProtestStatusSelect";
import { ProtestComments } from "@/components/protest/ProtestComments";
import { ProtestAIChat } from "@/components/protest/ProtestAIChat";
import { ProtestDocuments } from "@/components/protest/ProtestDocuments";

interface ProtestDetail {
  id: string;
  situs_address: string | null;
  owner_name: string | null;
  county: string | null;
  appeal_status: string | null;
  hearing_date: string | null;
  assessed_value: number | null;
  market_value: number | null;
  protest_amount: number | null;
  savings_amount: number | null;
  tax_year: number | null;
  protest_date: string | null;
  recommendation: string | null;
  documents_generated: boolean;
  evidence_packet_url: string | null;
  offer_received_date: string | null;
  offer_amount?: number | null;
  resolution_date?: string | null;
  created_at: string;
}

const statusColors = {
  waiting_for_offer: "bg-yellow-100 text-yellow-800",
  offer_received: "bg-blue-100 text-blue-800", 
  needs_review: "bg-orange-100 text-orange-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  email_reply_required: "bg-purple-100 text-purple-800",
  hearing_scheduled: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800"
};

const statusLabels = {
  waiting_for_offer: "Waiting for Offer",
  offer_received: "Offer Received",
  needs_review: "Needs Review", 
  accepted: "Accepted",
  rejected: "Rejected",
  email_reply_required: "Email Reply Required",
  hearing_scheduled: "Hearing Scheduled",
  completed: "Completed"
};

export default function AdminProtestDetail() {
  const { protestId } = useParams<{ protestId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [protest, setProtest] = useState<ProtestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (protestId) {
      fetchProtestDetail();
    }
  }, [protestId]);

  const fetchProtestDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('protests')
        .select('*')
        .eq('id', protestId)
        .single();

      if (error) throw error;
      setProtest(data as ProtestDetail);
    } catch (error) {
      console.error('Error fetching protest:', error);
      toast({
        title: "Error",
        description: "Failed to load protest details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!protest) return;

    setStatusUpdating(true);
    try {
      const { error } = await supabase
        .from('protests')
        .update({ appeal_status: newStatus })
        .eq('id', protest.id);

      if (error) throw error;

      // Add status change comment
      console.log(`Status changed from ${protest.appeal_status} to ${newStatus}`);
      
      setProtest({ ...protest, appeal_status: newStatus });
      toast({
        title: "Status Updated",
        description: `Status changed to ${statusLabels[newStatus as keyof typeof statusLabels] || newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  // Helper function to get numeric offer amount
  const getOfferAmount = () => {
    // First try offer_amount if it exists
    if (protest?.offer_amount && typeof protest.offer_amount === 'number') {
      return protest.offer_amount;
    }
    
    // Try to parse numeric value from recommendation
    if (protest?.recommendation) {
      const numericMatch = protest.recommendation.match(/\$?[\d,]+\.?\d*/);
      if (numericMatch) {
        const cleanNumber = numericMatch[0].replace(/[$,]/g, '');
        const parsed = parseFloat(cleanNumber);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }
    
    return null;
  };

  const formatOfferAmount = () => {
    const amount = getOfferAmount();
    if (amount !== null) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }
    return 'N/A';
  };

  const hasValidOffer = () => {
    return getOfferAmount() !== null;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!protest) {
    return (
      <div className="space-y-6 p-6">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Protest Not Found</h2>
          <p className="text-muted-foreground mt-2">The requested protest could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Protest Management</h1>
            <p className="text-muted-foreground">{protest.situs_address}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Protest
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download All Documents
          </Button>
        </div>
      </div>

      {/* Status & Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <div className="space-y-2">
              <Badge className={statusColors[protest.appeal_status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
                {statusLabels[protest.appeal_status as keyof typeof statusLabels] || protest.appeal_status}
              </Badge>
              <ProtestStatusSelect
                value={protest.appeal_status || ''}
                onValueChange={updateStatus}
                disabled={statusUpdating}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Assessed Value</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(protest.assessed_value)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Potential Savings</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(protest.savings_amount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Hearing Date</span>
            </div>
            <p className="text-lg font-semibold">{formatDate(protest.hearing_date)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Situs Address</label>
                  <p className="font-medium">{protest.situs_address || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">County</label>
                  <p className="font-medium">{protest.county || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tax Year</label>
                  <p className="font-medium">{protest.tax_year || 'Not provided'}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assessed Value</label>
                    <p className="font-bold">{formatCurrency(protest.assessed_value)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Market Value</label>
                    <p className="font-bold">{formatCurrency(protest.market_value)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Protest Amount</label>
                    <p className="font-bold">{formatCurrency(protest.protest_amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Potential Savings</label>
                    <p className="font-bold text-green-600">{formatCurrency(protest.savings_amount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offer Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Offer Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {protest.offer_received_date ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Offer Received Date</label>
                        <p className="font-medium">{formatDate(protest.offer_received_date)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">County Offer Amount</label>
                        <p className="font-medium text-lg">{formatOfferAmount()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Assessed Value</label>
                        <p className="font-medium">{formatCurrency(protest.assessed_value || 0)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Recommendation Reduction</label>
                        <p className="font-medium">{(() => {
                          const assessedValue = protest.assessed_value || 0;
                          const offerAmount = getOfferAmount();
                          if (offerAmount !== null) {
                            return formatCurrency(assessedValue - offerAmount);
                          }
                          return 'N/A';
                        })()}</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-muted-foreground">County Evidence</label>
                          <div className="font-medium">
                            {protest.evidence_packet_url ? (
                              <a 
                                href={protest.evidence_packet_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                View Evidence
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ) : (
                              <span className="text-muted-foreground">Not available</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-medium text-muted-foreground">AI Recco</label>
                          <p className="font-medium">{hasValidOffer() ? 'Accept' : 'No Recommendation'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">AI Recco Reasoning</label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {hasValidOffer() 
                            ? 'The county offer represents a significant reduction in assessed value that would benefit the property owner.'
                            : 'No county offer available to evaluate at this time.'
                          }
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => updateStatus('accepted')}
                        disabled={statusUpdating || !hasValidOffer()}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Offer
                      </Button>
                      <Button 
                        onClick={() => updateStatus('rejected')}
                        disabled={statusUpdating || !hasValidOffer()}
                        variant="destructive"
                        className="flex-1"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Reject Offer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No offer received yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Important Dates */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Protest Filed</label>
                    <p className="font-medium">{formatDate(protest.protest_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hearing Date</label>
                    <p className="font-medium">{formatDate(protest.hearing_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Offer Received</label>
                    <p className="font-medium">{formatDate(protest.offer_received_date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner & Contact Info - Moved to bottom */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Owner & Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Property Owner</label>
                    <p className="text-sm font-medium">{protest.owner_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Recommendation</label>
                    <p className="text-xs">{protest.recommendation || 'No recommendation yet'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <ProtestDocuments protestId={protest.id} />
        </TabsContent>

        <TabsContent value="comments">
          <ProtestComments protestId={protest.id} />
        </TabsContent>

        <TabsContent value="chat">
          <ProtestAIChat protestId={protest.id} protestData={protest} />
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
              <CardDescription>Track the progress of this protest through each stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="w-px h-16 bg-muted"></div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium">Protest Created</h4>
                      <p className="text-sm text-muted-foreground">Created on {formatDate(protest.created_at)}</p>
                    </div>
                  </div>
                </div>
                
                {protest.protest_date && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div className="w-px h-16 bg-muted"></div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium">Protest Filed</h4>
                        <p className="text-sm text-muted-foreground">Filed on {formatDate(protest.protest_date)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {protest.offer_received_date && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <div className="w-px h-16 bg-muted"></div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium">Offer Received</h4>
                        <p className="text-sm text-muted-foreground">Received on {formatDate(protest.offer_received_date)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {protest.hearing_date && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium">Hearing Scheduled</h4>
                        <p className="text-sm text-muted-foreground">Scheduled for {formatDate(protest.hearing_date)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
