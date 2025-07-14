import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-2">
          View business metrics, reports, and performance data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Analytics</CardTitle>
          <CardDescription>
            This tool will be developed to provide comprehensive business analytics and reporting.
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