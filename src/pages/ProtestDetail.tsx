import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Building,
  User,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Download,
} from "lucide-react";
import { dataService } from "@/services";
import type { Protest } from "@/services/types";

export default function ProtestDetail() {
  const { protestId } = useParams<{ protestId: string }>();
  const navigate = useNavigate();
  const [protest, setProtest] = useState<Protest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (protestId) {
      loadProtestDetail(protestId);
    }
  }, [protestId]);

  const loadProtestDetail = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const protests = await dataService.getProtests();
      const protestDetail = protests.find(p => p.id === id);
      if (protestDetail) {
        setProtest(protestDetail);
      } else {
        setError("Protest not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load protest details");
      console.error("Failed to load protest details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Filed": return "blue";
      case "Under Review": return "orange";
      case "Approved": return "green";
      case "Rejected": return "red";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Filed": return <FileText className="h-4 w-4" />;
      case "Under Review": return <AlertCircle className="h-4 w-4" />;
      case "Approved": return <CheckCircle className="h-4 w-4" />;
      case "Rejected": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !protest) {
    return (
      <div className="space-y-6 p-6">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-slate-600 mt-2">{error}</p>
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
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Protest Details</h1>
            <p className="text-slate-600">{protest.propertyAddress}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Protest
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Documents
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Status
            <Badge variant={getStatusColor(protest.status) as any} className="flex items-center gap-1">
              {getStatusIcon(protest.status)}
              {protest.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{protest.protestYear}</div>
              <div className="text-sm text-slate-500">Protest Year</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{protest.potentialSavings}</div>
              <div className="text-sm text-slate-500">Potential Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{protest.progress}%</div>
              <div className="text-sm text-slate-500">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{protest.county}</div>
              <div className="text-sm text-slate-500">County</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="property">Property Details</TabsTrigger>
          <TabsTrigger value="timeline">Status Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Address</label>
                  <p className="text-slate-900">{protest.propertyAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Current Assessed Value</label>
                  <p className="text-slate-900 font-semibold">{protest.assessedValue}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Target Value</label>
                  <p className="text-slate-900 font-semibold">{protest.targetValue}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Property Owner</label>
                  <p className="text-slate-900 font-semibold">{protest.owner}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Assigned Agent</label>
                  <p className="text-slate-900">{protest.agent}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Contact ID</label>
                  <p className="text-blue-600 cursor-pointer hover:text-blue-800">{protest.contactId}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Filed Date</label>
                  <p className="text-slate-900">{protest.filedDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Hearing Date</label>
                  <p className="text-slate-900">{protest.hearingDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="property">
          <Card>
            <CardHeader>
              <CardTitle>Property Assessment Details</CardTitle>
              <CardDescription>Detailed property valuation information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment Type</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Recommended Value</TableHead>
                    <TableHead>Potential Reduction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Market Value</TableCell>
                    <TableCell>{protest.assessedValue}</TableCell>
                    <TableCell>{protest.targetValue}</TableCell>
                    <TableCell className="text-green-600 font-semibold">{protest.potentialSavings}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
              <CardDescription>Progress tracking and status updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="w-px h-16 bg-slate-200"></div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium">Protest Filed</h4>
                      <p className="text-sm text-slate-600">Filed on {protest.filedDate}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium">Hearing Scheduled</h4>
                      <p className="text-sm text-slate-600">Scheduled for {protest.hearingDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
              <CardDescription>All documents associated with this protest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">No documents available for this protest</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}