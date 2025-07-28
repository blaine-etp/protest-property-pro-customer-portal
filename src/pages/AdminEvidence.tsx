import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, FileText, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  PROTEST_STATUSES, 
  PROTEST_STATUS_LABELS, 
  PROTEST_STATUS_COLORS,
  ProtestStatus,
  LEGACY_STATUS_MAPPING 
} from "@/constants/protestStatus";

interface Protest {
  id: string;
  situs_address: string | null;
  owner_name: string | null;
  county: string | null;
  appeal_status: string | null;
  hearing_date: string | null;
  assessed_value: number | null;
  recommendation: string | null;
  documents_generated: boolean;
  evidence_packet_url: string | null;
  created_at: string;
  properties?: {
    id: string;
    situs_address: string | null;
    county: string | null;
    contacts?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    } | null;
    owners?: {
      id: string;
      name: string;
      owner_type: string;
    } | null;
  } | null;
}

// Helper function to get normalized status
const getNormalizedStatus = (status: string | null): ProtestStatus => {
  if (!status) return PROTEST_STATUSES.PENDING;
  return LEGACY_STATUS_MAPPING[status] || status as ProtestStatus;
};

// Helper function to get status label
const getStatusLabel = (status: string | null): string => {
  const normalizedStatus = getNormalizedStatus(status);
  return PROTEST_STATUS_LABELS[normalizedStatus] || status || 'Pending';
};

// Helper function to get status color
const getStatusColor = (status: string | null): string => {
  const normalizedStatus = getNormalizedStatus(status);
  return PROTEST_STATUS_COLORS[normalizedStatus] || "bg-gray-100 text-gray-800";
};

export default function AdminEvidence() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [protests, setProtests] = useState<Protest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProtests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('protests')
        .select(`
          *,
          properties:property_id (
            id,
            situs_address,
            county,
            contacts:contact_id (
              id,
              first_name,
              last_name,
              email
            ),
            owners:owner_id (
              id,
              name,
              owner_type
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProtests((data || []) as unknown as Protest[]);
    } catch (error) {
      console.error('Error fetching protests:', error);
      toast({
        title: "Error",
        description: "Failed to load protests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProtests();

    // Set up real-time subscription for protests table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'protests'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          // Refresh data when any change occurs
          fetchProtests();
        }
      )
      .subscribe();

    // Refresh data when page becomes visible (user returns from detail page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProtests();
      }
    };

    const handleFocus = () => {
      fetchProtests();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchProtests]);

  const handleAcceptReject = async (protestId: string, action: 'accepted' | 'rejected') => {
    const newStatus = action === 'accepted' ? PROTEST_STATUSES.ACCEPTED : PROTEST_STATUSES.REJECTED;
    
    try {
      // Optimistic update
      setProtests(prev => prev.map(protest => 
        protest.id === protestId 
          ? { ...protest, appeal_status: newStatus }
          : protest
      ));

      const { error } = await supabase
        .from('protests')
        .update({ appeal_status: newStatus })
        .eq('id', protestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Protest ${action} successfully.`,
      });
    } catch (error) {
      console.error('Error updating protest:', error);
      
      // Rollback optimistic update on error
      fetchProtests();
      
      toast({
        title: "Error",
        description: `Failed to ${action} protest. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Property Tax Tools</h1>
        <p className="text-slate-600 mt-2">
          Manage property tax protests and generate evidence.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Protest Management</CardTitle>
          <CardDescription>
            Track and manage property tax protests through the workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">Loading protests...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Situs Address</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>County</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hearing Date</TableHead>
                  <TableHead>Assessed Value</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Accept/Reject</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {protests.map((protest) => (
                  <TableRow 
                    key={protest.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/protest/${protest.id}`)}
                  >
                    <TableCell className="font-medium">
                      {protest.properties?.situs_address || protest.situs_address || '-'}
                    </TableCell>
                    <TableCell>
                      {protest.properties?.owners?.name || protest.owner_name || '-'}
                    </TableCell>
                    <TableCell>{protest.properties?.county || protest.county || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(protest.appeal_status)}>
                        {getStatusLabel(protest.appeal_status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(protest.hearing_date)}</TableCell>
                    <TableCell>{formatCurrency(protest.assessed_value)}</TableCell>
                    <TableCell>{protest.recommendation || '-'}</TableCell>
                    <TableCell>
                      {getNormalizedStatus(protest.appeal_status) === PROTEST_STATUSES.OFFER_RECEIVED && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptReject(protest.id, 'accepted');
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptReject(protest.id, 'rejected');
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/protest/${protest.id}`)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Documents
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Evidence
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {protests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No protests found. Create some test data to see the interface in action.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}