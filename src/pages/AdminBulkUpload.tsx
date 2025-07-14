import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminBulkUpload() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bulk Uploader</h1>
        <p className="text-slate-600 mt-2">
          Process multiple properties and applications at once.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch Processing</CardTitle>
          <CardDescription>
            This tool will be developed to provide bulk property and application processing.
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