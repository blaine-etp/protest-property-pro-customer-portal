import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Save, RotateCcw, Plus, Trash2 } from "lucide-react";
import { HybridHtmlEditor } from "@/components/ui/hybrid-html-editor";
import { useToast } from "@/hooks/use-toast";
import { useFooterContent } from "@/hooks/useFooterContent";

// Mock data structure for other sections
const initialContent = {
  hero: {
    mainHeadline: "Save Thousands on Your",
    highlightText: "Property Taxes",
    subtitle: "Professional property tax protest services. <strong>No upfront fees</strong> – we only get paid when you save money.",
    buttonText: "Start Your Tax Protest",
    multiPropertyText: "Multiple Properties? Click Here",
    stats: {
      avgSavings: "$2,847",
      successRate: "94%",
      happyClients: "10,000+"
    }
  },
  benefits: {
    title: "Why Choose EasyTaxProtest?",
    subtitle: "We make property tax protests simple and successful",
    items: [
      {
        icon: "Shield",
        title: "No Risk, No Fees",
        description: "We only get paid when you save money. No upfront costs, no hidden fees."
      },
      {
        icon: "Users",
        title: "Expert Team",
        description: "Licensed professionals with years of experience in property tax law."
      },
      {
        icon: "Clock",
        title: "Fast Results",
        description: "Most protests resolved within 60-90 days with immediate savings."
      },
      {
        icon: "DollarSign",
        title: "Maximum Savings",
        description: "We fight for every dollar you deserve back from overpaid taxes."
      }
    ]
  },
  process: {
    title: "How It Works",
    subtitle: "Our simple 4-step process to reduce your property taxes",
    steps: [
      {
        number: "1",
        title: "Submit Your Information",
        description: "Provide your property details and we'll analyze your tax assessment for free."
      },
      {
        number: "2", 
        title: "Professional Review",
        description: "Our experts review your case and determine the best strategy for maximum savings."
      },
      {
        number: "3",
        title: "File Your Protest",
        description: "We handle all paperwork and represent you before the appraisal review board."
      },
      {
        number: "4",
        title: "Get Your Savings",
        description: "Receive your tax reduction and only pay our fee from the money you saved."
      }
    ]
  },
  testimonials: {
    title: "What Our Clients Say",
    subtitle: "Join thousands of satisfied homeowners who have saved money with our services",
    items: [
      {
        name: "Sarah Johnson",
        location: "Austin, TX",
        savings: "$3,200",
        text: "I couldn't believe how easy the process was. They handled everything and saved me over $3,000!"
      },
      {
        name: "Mike Rodriguez", 
        location: "Houston, TX",
        savings: "$2,800",
        text: "Professional service and great results. Highly recommend to anyone dealing with high property taxes."
      },
      {
        name: "Jennifer Chen",
        location: "Dallas, TX", 
        savings: "$4,100",
        text: "The team was knowledgeable and kept me informed throughout the entire process."
      }
    ]
  },
  cta: {
    title: "Ready to Save Money on Your Property Taxes?",
    subtitle: "Join thousands of homeowners who have already reduced their tax bills",
    buttonText: "Start Your Free Assessment",
    supportText: "Questions? Call us at (555) 012-3456"
  }
};

export default function AdminSiteContent() {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState("hero");
  const { toast } = useToast();
  const { content: footerContent, setContent: setFooterContent, saveFooterContent, loading: footerLoading } = useFooterContent();

  const handleSave = async (section: string) => {
    if (section === 'footer') {
      await saveFooterContent(footerContent);
    } else {
      // Simulate API call for other sections
      toast({
        title: "Success",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} section updated successfully`,
      });
    }
  };

  const handleReset = (section: string) => {
    if (section === 'footer') {
      // Reset will reload from database
      window.location.reload();
    } else {
      setContent(prev => ({
        ...prev,
        [section]: initialContent[section as keyof typeof initialContent]
      }));
      toast({
        title: "Reset Complete",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} section has been reset`,
      });
    }
  };

  const updateContent = (section: string, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const updateArrayItem = (section: string, index: number, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        items: (prev[section as keyof typeof prev] as any).items.map((item: any, i: number) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const updateNestedContent = (section: string, nestedField: string, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [nestedField]: {
          ...(prev[section as keyof typeof prev] as any)[nestedField],
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Site Content Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="cta">Call to Action</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Hero section editing is coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Section</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Benefits section editing is coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Process Section</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Process section editing is coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testimonials Section</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Testimonials section editing is coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call to Action Section</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">CTA section editing is coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {footerLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              ) : (
                <>
                  {/* Company Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="footer-company-name">Company Name</Label>
                        <Input
                          id="footer-company-name"
                          value={footerContent.company.name}
                          onChange={(e) => setFooterContent(prev => ({
                            ...prev,
                            company: { ...prev.company, name: e.target.value }
                          }))}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-logo">Logo URL</Label>
                        <Input
                          id="footer-logo"
                          value={footerContent.company.logoUrl}
                          onChange={(e) => setFooterContent(prev => ({
                            ...prev,
                            company: { ...prev.company, logoUrl: e.target.value }
                          }))}
                          placeholder="Logo URL"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footer-description">Company Description</Label>
                      <Textarea
                        id="footer-description"
                        value={footerContent.company.description}
                        onChange={(e) => setFooterContent(prev => ({
                          ...prev,
                          company: { ...prev.company, description: e.target.value }
                        }))}
                        placeholder="Company description"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Services */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Services</h3>
                      <Button onClick={() => setFooterContent(prev => ({
                        ...prev,
                        services: [...prev.services, "New Service"]
                      }))} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {footerContent.services.map((service, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={service}
                            onChange={(e) => setFooterContent(prev => ({
                              ...prev,
                              services: prev.services.map((s, i) => i === index ? e.target.value : s)
                            }))}
                            placeholder="Service name"
                          />
                          <Button 
                            onClick={() => setFooterContent(prev => ({
                              ...prev,
                              services: prev.services.filter((_, i) => i !== index)
                            }))} 
                            variant="destructive" 
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="footer-phone">Phone</Label>
                        <Input
                          id="footer-phone"
                          value={footerContent.contact.phone}
                          onChange={(e) => setFooterContent(prev => ({
                            ...prev,
                            contact: { ...prev.contact, phone: e.target.value }
                          }))}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-email">Email</Label>
                        <Input
                          id="footer-email"
                          value={footerContent.contact.email}
                          onChange={(e) => setFooterContent(prev => ({
                            ...prev,
                            contact: { ...prev.contact, email: e.target.value }
                          }))}
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footer-address">Address</Label>
                      <Textarea
                        id="footer-address"
                        value={footerContent.contact.address}
                        onChange={(e) => setFooterContent(prev => ({
                          ...prev,
                          contact: { ...prev.contact, address: e.target.value }
                        }))}
                        placeholder="Street address (use line breaks for multiple lines)"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Social Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="footer-facebook">Facebook URL</Label>
                        <Input
                          id="footer-facebook"
                          value={footerContent.social.facebook}
                          onChange={(e) => setFooterContent(prev => ({
                            ...prev,
                            social: { ...prev.social, facebook: e.target.value }
                          }))}
                          placeholder="Facebook URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-twitter">Twitter URL</Label>
                        <Input
                          id="footer-twitter"
                          value={footerContent.social.twitter}
                          onChange={(e) => setFooterContent(prev => ({
                            ...prev,
                            social: { ...prev.social, twitter: e.target.value }
                          }))}
                          placeholder="Twitter URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-linkedin">LinkedIn URL</Label>
                        <Input
                          id="footer-linkedin"
                          value={footerContent.social.linkedin}
                          onChange={(e) => setFooterContent(prev => ({
                            ...prev,
                            social: { ...prev.social, linkedin: e.target.value }
                          }))}
                          placeholder="LinkedIn URL"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Legal */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Legal & Footer</h3>
                    <div className="space-y-2">
                      <Label htmlFor="footer-copyright">Copyright Text</Label>
                      <Input
                        id="footer-copyright"
                        value={footerContent.legal.copyright}
                        onChange={(e) => setFooterContent(prev => ({
                          ...prev,
                          legal: { ...prev.legal, copyright: e.target.value }
                        }))}
                        placeholder="Copyright text"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="footer-privacy">Privacy Policy Text</Label>
                        <Input
                          id="footer-privacy"
                          value={footerContent.legal.privacy}
                          onChange={(e) => setFooterContent(prev => ({
                            ...prev,
                            legal: { ...prev.legal, privacy: e.target.value }
                          }))}
                          placeholder="Privacy Policy text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-terms">Terms of Service Text</Label>
                        <Input
                          id="footer-terms"
                          value={footerContent.legal.terms}
                          onChange={(e) => setFooterContent(prev => ({
                            ...prev,
                            legal: { ...prev.legal, terms: e.target.value }
                          }))}
                          placeholder="Terms of Service text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-license">License Info Text</Label>
                        <Input
                          id="footer-license"
                          value={footerContent.legal.license}
                          onChange={(e) => setFooterContent(prev => ({
                            ...prev,
                            legal: { ...prev.legal, license: e.target.value }
                          }))}
                          placeholder="License Info text"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleSave('footer')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => handleReset('footer')}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
