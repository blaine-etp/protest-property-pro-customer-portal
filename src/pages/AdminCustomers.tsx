import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCustomers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Customer CRM</h1>
        <p className="text-slate-600 mt-2">
          Manage customer profiles, applications, and communication.
        </p>
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