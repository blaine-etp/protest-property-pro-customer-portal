import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminEvidence() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Property Tax Tools</h1>
        <p className="text-slate-600 mt-2">
          Generate evidence and manage property tax appeals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evidence Generation</CardTitle>
          <CardDescription>
            This tool will be developed to provide property tax evidence generation capabilities.
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