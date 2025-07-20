import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  Upload,
  BarChart3,
  Settings,
  Shield,
  TrendingUp,
  DollarSign,
  FileCheck,
  UserCheck,
} from "lucide-react";

const adminTools = [
  {
    title: "Customer CRM",
    description: "Manage customer profiles, applications, and communication",
    icon: Users,
    route: "/admin/customers",
    category: "Customer Management",
  },
  {
    title: "Blog Management", 
    description: "Create and edit blog posts and content",
    icon: FileText,
    route: "/admin/blog",
    category: "Content Management",
  },
  {
    title: "Property Tax Tools",
    description: "Generate evidence and manage property tax appeals",
    icon: Shield,
    route: "/admin/evidence", 
    category: "Business Tools",
  },
  {
    title: "Concierge Onboarding",
    description: "Onboard new customers via phone and generate documents for signature",
    icon: Upload,
    route: "/admin/bulk-upload",
    category: "Business Tools",
  },
  {
    title: "Analytics",
    description: "View business metrics, reports, and performance data",
    icon: BarChart3,
    route: "/admin/analytics",
    category: "Analytics & Reports",
  },
  {
    title: "Settings",
    description: "Configure system settings and preferences",
    icon: Settings,
    route: "/admin/settings",
    category: "System Administration",
  },
];

const quickStats = [
  {
    title: "Total Customers",
    value: "1,234",
    change: "+12%",
    icon: UserCheck,
  },
  {
    title: "Active Applications",
    value: "89",
    change: "+5%", 
    icon: FileCheck,
  },
  {
    title: "Monthly Revenue",
    value: "$45,678",
    change: "+23%",
    icon: DollarSign,
  },
  {
    title: "Success Rate",
    value: "94.2%",
    change: "+2.1%",
    icon: TrendingUp,
  },
];

export default function Admin() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Welcome to the administrative portal. Manage your business operations from here.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Tools */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminTools.map((tool) => (
            <Card key={tool.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <tool.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                    <div className="text-xs text-slate-500 font-medium">
                      {tool.category}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {tool.description}
                </CardDescription>
                <Button 
                  onClick={() => navigate(tool.route)}
                  className="w-full"
                  variant="outline"
                >
                  Open Tool
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New customer application submitted</p>
                <p className="text-xs text-slate-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Property tax evidence generated</p>
                <p className="text-xs text-slate-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Bulk upload processing completed</p>
                <p className="text-xs text-slate-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}