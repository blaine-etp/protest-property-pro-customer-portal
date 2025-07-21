import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, FileText, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Protest {
  id: string;
  situs_address: string | null;
  owner_name: string | null;
  appeal_status: string | null;
  hearing_date: string | null;
  assessed_value: number | null;
  recommendation: string | null;
  documents_generated: boolean;
  evidence_packet_url: string | null;
  created_at: string;
}

const statusColors = {
  waiting_for_offer: "bg-yellow-100 text-yellow-800",
  offer_received: "bg-blue-100 text-blue-800", 
  needs_review: "bg-orange-100 text-orange-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  email_reply_required: "bg-purple-100 text-purple-800"
};

const statusLabels = {
  waiting_for_offer: "Waiting for Offer",
  offer_received: "Offer Received",
  needs_review: "Needs Review", 
  accepted: "Accepted",
  rejected: "Rejected",
  email_reply_required: "Email Reply Required"
};

export default function AdminEvidence() {
  const [protests, setProtests] = useState<Protest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProtests();
  }, []);

  const fetchProtests = async () => {
    try {
      const { data, error } = await supabase
        .from('protests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProtests(data || []);
    } catch (error) {
      console.error('Error fetching protests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReject = async (protestId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('protests')
        .update({ appeal_status: action })
        .eq('id', protestId);

      if (error) throw error;
      fetchProtests(); // Refresh the data
    } catch (error) {
      console.error('Error updating protest:', error);
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
                  <TableRow key={protest.id}>
                    <TableCell className="font-medium">
                      {protest.situs_address || '-'}
                    </TableCell>
                    <TableCell>{protest.owner_name || '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        className={statusColors[protest.appeal_status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
                      >
                        {statusLabels[protest.appeal_status as keyof typeof statusLabels] || protest.appeal_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(protest.hearing_date)}</TableCell>
                    <TableCell>{formatCurrency(protest.assessed_value)}</TableCell>
                    <TableCell>{protest.recommendation || '-'}</TableCell>
                    <TableCell>
                      {(protest.appeal_status === 'offer_received' || protest.appeal_status === 'needs_review') && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcceptReject(protest.id, 'accepted')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcceptReject(protest.id, 'rejected')}
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
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
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