import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin,
  Download,
  Eye,
  Clock,
  CheckCircle2
} from "lucide-react";

const CustomerPortal = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  // Mock data - in a real app this would come from your backend
  const applicationData = {
    applicationId: "PTX-2024-001234",
    status: "Under Review",
    submittedDate: "March 15, 2024",
    estimatedCompletion: "April 15, 2024",
    property: {
      address: "123 Main St, Austin, TX 78701",
      currentValue: 485000,
      estimatedSavings: 2500
    },
    contact: {
      name: "John Doe",
      email: email || "john.doe@example.com",
      phone: "(555) 123-4567"
    }
  };

  const statusColor = {
    "Under Review": "bg-yellow-100 text-yellow-800",
    "Approved": "bg-green-100 text-green-800",
    "Completed": "bg-blue-100 text-blue-800",
    "Requires Action": "bg-red-100 text-red-800"
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Customer Portal</h1>
          <p className="text-muted-foreground">Track your property tax protest application</p>
        </div>

        <div className="grid gap-6">
          {/* Application Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Status
                </CardTitle>
                <Badge className={statusColor[applicationData.status as keyof typeof statusColor]}>
                  {applicationData.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Application ID</p>
                  <p className="font-semibold">{applicationData.applicationId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-semibold">{applicationData.submittedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Completion</p>
                  <p className="font-semibold">{applicationData.estimatedCompletion}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">Progress Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Application Submitted</span>
                    <span className="text-xs text-muted-foreground ml-auto">{applicationData.submittedDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm">Under Review</span>
                    <span className="text-xs text-muted-foreground ml-auto">In Progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">County Response</span>
                    <span className="text-xs text-muted-foreground ml-auto">Pending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Final Results</span>
                    <span className="text-xs text-muted-foreground ml-auto">Pending</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Property Address</p>
                <p className="font-semibold">{applicationData.property.address}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Assessed Value</p>
                  <p className="font-semibold text-2xl">${applicationData.property.currentValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Annual Savings</p>
                  <p className="font-semibold text-2xl text-green-600">${applicationData.property.estimatedSavings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{applicationData.contact.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{applicationData.contact.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Documents & Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents & Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View Application
                </Button>
                <Button variant="outline" className="justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Documents
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Need help?</p>
                <Button variant="default">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;