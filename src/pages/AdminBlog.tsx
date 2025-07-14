import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminBlog() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Blog Management</h1>
        <p className="text-slate-600 mt-2">
          Create and edit blog posts and content.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <CardDescription>
            This tool will be developed to provide blog creation and editing capabilities.
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