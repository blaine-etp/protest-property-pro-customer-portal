import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Gavel,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Plus,
  TrendingUp,
  Building,
  User,
  Database,
} from "lucide-react";
import { dataService } from "@/services";
import type { Protest } from "@/services/types";

export function ProtestSection() {
  const [activeView, setActiveView] = useState("pipeline");
  const [protests, setProtests] = useState<Protest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProtests();
  }, []);

  const loadProtests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dataService.getProtests();
      setProtests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load protests');
      console.error('Failed to load protests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const protestsByStatus = {
    "Pending": protests.filter(p => p.status === "Pending"),
    "Filed": protests.filter(p => p.status === "Filed"),
    "Under Review": protests.filter(p => p.status === "Under Review"),
    "Approved": protests.filter(p => p.status === "Approved"),
    "Rejected": protests.filter(p => p.status === "Rejected"),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "yellow";
      case "Filed": return "blue";
      case "Under Review": return "orange";
      case "Approved": return "green";
      case "Rejected": return "red";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <Clock className="h-4 w-4" />;
      case "Filed": return <FileText className="h-4 w-4" />;
      case "Under Review": return <AlertCircle className="h-4 w-4" />;
      case "Approved": return <CheckCircle className="h-4 w-4" />;
      case "Rejected": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Protest Management</h2>
            <p className="text-slate-600">Loading protests...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Protest Management</h2>
            <p className="text-red-600">Error: {error}</p>
          </div>
          <Button onClick={loadProtests}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Protest Management</h2>
          <div className="flex items-center gap-2">
            <p className="text-slate-600">Track and manage property tax protests</p>
            <Badge variant="outline" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Mock Data
            </Badge>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          File New Protest
        </Button>
      </div>

      {/* Protest Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Protests</p>
                <p className="text-2xl font-bold">{protests.length}</p>
              </div>
              <Gavel className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-orange-600">
                  {protests.filter(p => ["Filed", "Under Review"].includes(p.status)).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {protests.filter(p => p.status === "Approved").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Success Rate</p>
                <p className="text-2xl font-bold">75%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">$6,950</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          {/* Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {Object.entries(protestsByStatus).map(([status, statusProtests]) => (
              <Card key={status}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {getStatusIcon(status)}
                    {status} ({statusProtests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {statusProtests.map((protest) => (
                    <Card key={protest.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm leading-tight">{protest.propertyAddress}</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Protest
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Documents
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {protest.owner}
                        </p>
                        
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Current:</span>
                            <span>{protest.assessedValue}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Target:</span>
                            <span>{protest.targetValue}</span>
                          </div>
                        </div>

                        <div className="bg-green-50 p-2 rounded text-center">
                          <p className="text-xs text-green-600 font-medium">
                            Potential: {protest.potentialSavings}
                          </p>
                        </div>

                        {protest.hearingDate && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            Hearing: {protest.hearingDate}
                          </div>
                        )}

                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all" 
                            style={{ width: `${protest.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Protests Table</CardTitle>
              <CardDescription>Detailed table view of all protests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Filed Date</TableHead>
                    <TableHead>Hearing Date</TableHead>
                    <TableHead>Assessed Value</TableHead>
                    <TableHead>Target Value</TableHead>
                    <TableHead>Potential Savings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {protests.map((protest) => (
                    <TableRow key={protest.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{protest.propertyAddress}</p>
                        </div>
                      </TableCell>
                      <TableCell>{protest.owner}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(protest.status) as any} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(protest.status)}
                          {protest.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{protest.filedDate}</TableCell>
                      <TableCell>{protest.hearingDate}</TableCell>
                      <TableCell>{protest.assessedValue}</TableCell>
                      <TableCell>{protest.targetValue}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {protest.potentialSavings}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Protest
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download Documents
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Protest Timeline</CardTitle>
              <CardDescription>Chronological view of protest activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {protests.map((protest, index) => (
                  <div key={protest.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        protest.status === "Approved" ? "bg-green-500" :
                        protest.status === "Rejected" ? "bg-red-500" :
                        "bg-blue-500"
                      }`}></div>
                      {index < protests.length - 1 && (
                        <div className="w-px h-16 bg-slate-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{protest.propertyAddress}</h4>
                          <Badge variant={getStatusColor(protest.status) as any}>
                            {protest.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">Owner: {protest.owner}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Filed:</span>
                            <p className="font-medium">{protest.filedDate}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Hearing:</span>
                            <p className="font-medium">{protest.hearingDate}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Assessed:</span>
                            <p className="font-medium">{protest.assessedValue}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Potential Savings:</span>
                            <p className="font-medium text-green-600">{protest.potentialSavings}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}