import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User,
  Plus,
  CreditCard,
  FileText,
  UserPlus,
  ChevronDown,
  ExternalLink,
  DollarSign,
  HelpCircle,
  Home,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

const CustomerPortal = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  // DYNAMIC: This will be fetched from database based on user email/account
  const userData = {
    email: email || "user@example.com",
    lifetimeSavings: 1052, // DYNAMIC: Calculate from all property savings
    name: "John Smith", // DYNAMIC: From user account data
  };

  // DYNAMIC: This will be fetched from database - all properties for this user
  // Initial property data may come from form submission, then enhanced from database
  const propertiesData = [
    {
      id: "prop-001",
      address: "3112 Garwood St", // DYNAMIC: From form data initially
      city: "Austin", // DYNAMIC: From form data initially
      state: "TX", // DYNAMIC: From form data initially
      zipCode: "78702", // DYNAMIC: From form data initially
      image: "/placeholder.svg", // DYNAMIC: Property aerial photo from database
      appeal: {
        status: "Canceled",
        statusColor: "destructive",
        autoAppeal: false, // DYNAMIC: User preference setting
        contingencyFee: 25, // DYNAMIC: From contract/database
        canActivate: true, // DYNAMIC: Based on business rules
      },
      exemptions: {
        status: "Inactive", // DYNAMIC: Current exemption status
        statusColor: "secondary",
      }
    },
    {
      id: "prop-002", 
      address: "5605 Sunshine Dr Unit 3", // DYNAMIC: From form/database
      city: "Austin", // DYNAMIC: From form/database
      state: "TX", // DYNAMIC: From form/database
      zipCode: "78756", // DYNAMIC: From form/database
      image: "/placeholder.svg", // DYNAMIC: Property aerial photo
      appeal: {
        status: "Active",
        statusColor: "default",
        autoAppeal: true, // DYNAMIC: User preference
        contingencyFee: 25, // DYNAMIC: From contract
        canActivate: false,
      },
      exemptions: {
        status: "Active", // DYNAMIC: Current exemption status
        statusColor: "default",
      }
    }
  ];

  const handleAccountAction = (action: string) => {
    // DYNAMIC: Handle navigation/actions based on user selection
    console.log(`Account action: ${action}`);
  };

  const toggleAutoAppeal = (propertyId: string) => {
    // DYNAMIC: Update auto-appeal setting in database
    console.log(`Toggle auto-appeal for property: ${propertyId}`);
  };

  const activateAutoAppeal = (propertyId: string) => {
    // DYNAMIC: Activate auto-appeal for property in database
    console.log(`Activate auto-appeal for property: ${propertyId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Lifetime Savings */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Lifetime Savings:</span>
              <span className="font-semibold text-green-600">
                ${userData.lifetimeSavings.toLocaleString()} {/* DYNAMIC: Total savings across all properties */}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Help Center */}
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Help Center
              </Button>

              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Account
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleAccountAction('account')}>
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccountAction('add-property')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccountAction('billing')}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccountAction('documents')}>
                    <FileText className="h-4 w-4 mr-2" />
                    All Documents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccountAction('refer')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Refer-a-Friend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Properties Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">All Properties</h1>
              <p className="text-muted-foreground">
                Properties ({propertiesData.length}) {/* DYNAMIC: Count from database */}
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Another Property
            </Button>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {propertiesData.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Property Image */}
                  <div className="aspect-video bg-muted relative">
                    <img 
                      src={property.image} 
                      alt={`Property at ${property.address}`}
                      className="w-full h-full object-cover"
                    />
                    {/* DYNAMIC: Real property aerial photo will replace placeholder */}
                  </div>

                  {/* Property Info */}
                  <div className="p-6 space-y-4">
                    {/* Address and View Link */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {property.address} {/* DYNAMIC: From form/database */}
                        </h3>
                        <p className="text-muted-foreground">
                          {property.city}, {property.state} {property.zipCode} {/* DYNAMIC: From form/database */}
                        </p>
                      </div>
                      <Button variant="link" size="sm" className="flex items-center gap-1 text-blue-600">
                        View Property
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Expandable Sections */}
                    <Accordion type="multiple" className="w-full">
                      {/* Appeal Section */}
                      <AccordionItem value="appeal">
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <span>Appeal</span>
                            <Badge variant={property.appeal.statusColor as any}>
                              {property.appeal.status} {/* DYNAMIC: Current appeal status */}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          {/* Auto-Appeal Status */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Auto-Appeal</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {property.appeal.autoAppeal ? 'Active' : 'Inactive'} {/* DYNAMIC: User setting */}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAutoAppeal(property.id)}
                                className="h-6 w-6 p-0"
                              >
                                {property.appeal.autoAppeal ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Contingency Fee */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Contingency Fee</span>
                            <span className="text-sm font-medium">
                              {property.appeal.contingencyFee}% {/* DYNAMIC: From contract */}
                            </span>
                          </div>

                          {/* Action Button */}
                          {property.appeal.canActivate && (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => activateAutoAppeal(property.id)}
                            >
                              Activate Auto-Appeal
                            </Button>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Exemptions Section */}
                      <AccordionItem value="exemptions">
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <span>Exemptions</span>
                            <Badge variant={property.exemptions.statusColor as any}>
                              {property.exemptions.status} {/* DYNAMIC: Current exemption status */}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">
                            Current exemption status and details will be displayed here.
                            {/* DYNAMIC: Detailed exemption information from database */}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerPortal;