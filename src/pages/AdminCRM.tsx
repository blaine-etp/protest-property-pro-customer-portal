import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Building,
  FileText,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MoreHorizontal,
  Search,
  Filter,
  Database,
  GitBranch,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Gavel,
  CreditCard,
  UserPlus,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatabaseSchemaViewer } from "@/components/crm/DatabaseSchemaViewer";
import { ContactsSection } from "@/components/crm/ContactsSection";
import { PropertiesSection } from "@/components/crm/PropertiesSection";
import { ProtestSection } from "@/components/crm/ProtestSection";
import { DocumentsSection } from "@/components/crm/DocumentsSection";
import { BillingSection } from "@/components/crm/BillingSection";
import { OwnersSection } from "@/components/crm/OwnersSection";
import { RelationshipViewer } from "@/components/crm/RelationshipViewer";
import { UserDeleteButton } from "@/components/UserDeleteButton";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function AdminCRM() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const { stats: dashboardStats, loading: statsLoading, error: statsError } = useDashboardStats();

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const getStatsArray = () => {
    if (!dashboardStats) return [];
    
    return [
      {
        title: "Total Users",
        value: formatNumber(dashboardStats.totalUsers),
        change: dashboardStats.usersChange,
        icon: Users,
        color: "blue",
      },
      {
        title: "Total Properties", 
        value: formatNumber(dashboardStats.totalProperties),
        change: dashboardStats.propertiesChange,
        icon: Building,
        color: "green",
      },
      {
        title: "Placeholder 1",
        value: formatNumber(dashboardStats.placeholder1),
        change: dashboardStats.placeholder1Change,
        icon: Gavel,
        color: "orange",
      },
      {
        title: "Placeholder 2",
        value: formatNumber(dashboardStats.placeholder2),
        change: dashboardStats.placeholder2Change,
        icon: FileText,
        color: "purple",
      },
    ];
  };

  const recentActivity = [
    {
      type: "contact",
      message: "New contact added: John Smith",
      time: "2 minutes ago",
      status: "success",
    },
    {
      type: "property",
      message: "Property protest submitted: 123 Main St",
      time: "15 minutes ago",
      status: "info",
    },
    {
      type: "document",
      message: "Form 50-162 generated for Sarah Johnson",
      time: "1 hour ago",
      status: "success",
    },
    {
      type: "billing",
      message: "Bill imported: $2,450 tax assessment",
      time: "2 hours ago",
      status: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer CRM</h1>
          <p className="text-slate-600 mt-2">
            Comprehensive customer relationship and property tax protest management
          </p>
        </div>
        <div className="flex gap-2">
          <UserDeleteButton />
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Add New Contact
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="schema">Database Schema</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="owners">Owners</TabsTrigger>
          <TabsTrigger value="protests">Protests</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Error State */}
          {statsError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">Error loading dashboard stats: {statsError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CRM Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))
            ) : (
              // Real stats
              getStatsArray().map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-slate-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <p className={`text-xs mt-1 ${
                      stat.change.startsWith('+') ? 'text-green-600' : 
                      stat.change.startsWith('-') ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common CRM tasks and workflow shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <UserPlus className="h-6 w-6" />
                  <span>Add New Customer Property</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Building2 className="h-6 w-6" />
                  <span>Add Property to Existing Customer</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileSpreadsheet className="h-6 w-6" />
                  <span>Update CRM Records via Spreadsheet Upload</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <GitBranch className="h-6 w-6" />
                  <span>Add Referral Relationship</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest customer interactions and system updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'info' ? 'bg-blue-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workflow Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Journey Workflow</CardTitle>
              <CardDescription>
                Visual representation of the typical customer process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium">Initial Contact</div>
                  <div className="text-xs text-slate-500">Lead capture</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium">Property Added</div>
                  <div className="text-xs text-slate-500">Address & details</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Gavel className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-sm font-medium">Protest Filed</div>
                  <div className="text-xs text-slate-500">Legal submission</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium">Resolution</div>
                  <div className="text-xs text-slate-500">Savings achieved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema">
          <DatabaseSchemaViewer onEntitySelect={setSelectedEntity} />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsSection />
        </TabsContent>

        <TabsContent value="properties">
          <PropertiesSection />
        </TabsContent>

        <TabsContent value="owners">
          <OwnersSection />
        </TabsContent>

        <TabsContent value="protests">
          <ProtestSection />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsSection />
        </TabsContent>

        <TabsContent value="billing">
          <BillingSection />
        </TabsContent>
      </Tabs>

      {/* Relationship Viewer Sidebar */}
      {selectedEntity && (
        <RelationshipViewer 
          entityId={selectedEntity} 
          onClose={() => setSelectedEntity(null)} 
        />
      )}
    </div>
  );
}