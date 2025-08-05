import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserDeleteButton } from "@/components/UserDeleteButton";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { RefreshCw } from "lucide-react";

export default function AdminCustomers() {
  const { stats, loading, refetch } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer CRM</h1>
          <p className="text-slate-600 mt-2">
            Manage customer profiles, applications, and communication.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refetch} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
          <UserDeleteButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading..." : stats?.usersChange || "0%"} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading..." : stats?.propertiesChange || "0%"} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placeholder 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.placeholder1 || 0}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading..." : stats?.placeholder1Change || "0%"} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placeholder 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.placeholder2 || 0}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading..." : stats?.placeholder2Change || "0%"} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>
            This tool will be developed to provide comprehensive customer relationship management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-slate-500">Tool coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}