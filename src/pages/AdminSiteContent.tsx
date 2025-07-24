import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HybridHtmlEditor } from "@/components/ui/hybrid-html-editor";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save, RotateCcw, Plus, X } from "lucide-react";

// Mock data structure matching actual homepage content
const initialContent = {
  hero: {
    mainHeadline: "Lower Your Property Taxes",
    highlightText: "Guaranteed", 
    subtitle: "Professional property tax protest services that save homeowners thousands. Enter your address below to see if you qualify for significant tax savings.",
    buttonText: "Check Savings",
    multiPropertyText: "I have 3 or more properties",
    stats: {
      averageSavings: 2500,
      successRate: 95,
      propertiesProtested: 10000
    }
  },
  benefits: {
    title: "Why Choose Our Property Tax Appeal Service?",
    description: "We handle the entire appeals process for you, from research to filing, with expert knowledge and proven results.",
    items: [
      {
        title: "No Upfront Costs",
        description: "You only pay when we successfully reduce your property taxes. No risk, all reward."
      },
      {
        title: "Expert Knowledge", 
        description: "Our team of certified appraisers and tax professionals know exactly how to navigate the appeals process."
      },
      {
        title: "Proven Results",
        description: "We've helped thousands of property owners save millions in property taxes across Texas."
      }
    ]
  },
  process: {
    title: "How It Works",
    steps: [
      {
        title: "Property Analysis",
        description: "We analyze your property and compare it to similar properties in your area to identify potential savings."
      },
      {
        title: "Evidence Gathering",
        description: "Our experts collect comprehensive evidence including photos, comparable sales, and market data."
      },
      {
        title: "Appeal Filing", 
        description: "We prepare and file your appeal with the appropriate authorities, handling all paperwork and deadlines."
      },
      {
        title: "Get Results",
        description: "We represent you throughout the process and fight for the maximum reduction possible."
      }
    ]
  },
  testimonials: {
    items: [
      {
        name: "Sarah Johnson",
        location: "Austin, TX",
        savings: 2400,
        text: "They saved me $2,400 per year on my property taxes. The process was completely handled by their team.",
        rating: 5
      },
      {
        name: "Mike Chen", 
        location: "Dallas, TX",
        savings: 3200,
        text: "Professional service and great results. I recommend them to all my neighbors.",
        rating: 5
      },
      {
        name: "Lisa Rodriguez",
        location: "Houston, TX", 
        savings: 1800,
        text: "Easy process and significant savings. Worth every penny of their fee.",
        rating: 5
      }
    ]
  },
  cta: {
    headline: "Ready to Reduce Your Property Taxes?",
    description: "Don't overpay on your property taxes. Get started today with our risk-free service and see how much you can save.",
    buttonText: "Check Savings",
    multiPropertyText: "I have multiple properties",
    contactPhone: "(555) 012-3456",
    guaranteeText: "No upfront fees • 100% risk-free • Results guaranteed"
  },
  footer: {
    company: {
      logoUrl: "/lovable-uploads/9f31b537-92b7-4e7d-9b60-b224c326a0cc.png",
      logoAlt: "Tax Logo",
      description: "Professional property tax protest services helping homeowners save thousands on their annual tax bills. No upfront fees, guaranteed results."
    },
    services: [
      { name: "Property Tax Protest", url: "#" },
      { name: "Tax Assessment Review", url: "#" },
      { name: "Commercial Properties", url: "#" },
      { name: "Residential Properties", url: "#" },
      { name: "Consultation Services", url: "#" }
    ],
    contact: {
      phone: "(555) 012-3456",
      email: "info@easytaxprotest.com",
      address: {
        street: "123 Business Plaza",
        city: "Austin",
        state: "TX",
        zip: "78701"
      }
    },
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#"
    },
    legal: {
      copyright: "© 2024 EasyTaxProtest.com. All rights reserved.",
      privacyPolicy: "#",
      termsOfService: "#",
      licenseInfo: "#"
    }
  }
};

export default function AdminSiteContent() {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState("hero");
  const { toast } = useToast();

  const handleSave = (section: string) => {
    // In a real implementation, this would save to a database
    toast({
      title: "Content Saved",
      description: `${section.charAt(0).toUpperCase() + section.slice(1)} section has been updated successfully.`,
    });
  };

  const handleReset = (section: string) => {
    const resetContent = { ...content };
    (resetContent as any)[section] = (initialContent as any)[section];
    setContent(resetContent);
    toast({
      title: "Content Reset",
      description: `${section.charAt(0).toUpperCase() + section.slice(1)} section has been reset to default.`,
      variant: "destructive",
    });
  };

  const updateContent = (section: string, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: value
      }
    }));
  };

  const updateArrayItem = (section: string, index: number, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        items: ((prev as any)[section] as any).items.map((item: any, i: number) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const updateNestedContent = (section: string, nestedField: string, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [nestedField]: {
          ...((prev as any)[section] as any)[nestedField],
          [field]: value
        }
      }
    }));
  };

  const addServiceItem = () => {
    setContent(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        services: [...prev.footer.services, { name: "", url: "#" }]
      }
    }));
  };

  const removeServiceItem = (index: number) => {
    setContent(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        services: prev.footer.services.filter((_, i) => i !== index)
      }
    }));
  };

  const updateServiceItem = (index: number, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        services: prev.footer.services.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-main-headline">Main Headline</Label>
                  <Input
                    id="hero-main-headline"
                    value={content.hero.mainHeadline}
                    onChange={(e) => updateContent('hero', 'mainHeadline', e.target.value)}
                    placeholder="Main headline text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-highlight">Highlight Text</Label>
                  <Input
                    id="hero-highlight"
                    value={content.hero.highlightText}
                    onChange={(e) => updateContent('hero', 'highlightText', e.target.value)}
                    placeholder="Highlighted text (colored)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <HybridHtmlEditor
                  content={content.hero.subtitle}
                  onChange={(value) => updateContent('hero', 'subtitle', value)}
                  placeholder="Enter hero subtitle"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-button">Primary Button Text</Label>
                  <Input
                    id="hero-button"
                    value={content.hero.buttonText}
                    onChange={(e) => updateContent('hero', 'buttonText', e.target.value)}
                    placeholder="Main CTA button text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-multi-property">Multi-Property Text</Label>
                  <Input
                    id="hero-multi-property"
                    value={content.hero.multiPropertyText}
                    onChange={(e) => updateContent('hero', 'multiPropertyText', e.target.value)}
                    placeholder="Multi-property link text"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label>Statistics</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="average-savings">Average Savings ($)</Label>
                    <Input
                      id="average-savings"
                      type="number"
                      value={content.hero.stats.averageSavings}
                      onChange={(e) => updateNestedContent('hero', 'stats', 'averageSavings', parseInt(e.target.value))}
                      placeholder="2500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="success-rate">Success Rate (%)</Label>
                    <Input
                      id="success-rate"
                      type="number"
                      min="0"
                      max="100"
                      value={content.hero.stats.successRate}
                      onChange={(e) => updateNestedContent('hero', 'stats', 'successRate', parseInt(e.target.value))}
                      placeholder="95"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="properties-protested">Properties Protested</Label>
                    <Input
                      id="properties-protested"
                      type="number"
                      value={content.hero.stats.propertiesProtested}
                      onChange={(e) => updateNestedContent('hero', 'stats', 'propertiesProtested', parseInt(e.target.value))}
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave('hero')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('hero')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="benefits-title">Title</Label>
                <Input
                  id="benefits-title"
                  value={content.benefits.title}
                  onChange={(e) => updateContent('benefits', 'title', e.target.value)}
                  placeholder="Enter benefits title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefits-description">Description</Label>
                <HybridHtmlEditor
                  content={content.benefits.description}
                  onChange={(value) => updateContent('benefits', 'description', value)}
                  placeholder="Enter benefits description"
                />
              </div>
              <div className="space-y-4">
                <Label>Benefit Items</Label>
                {content.benefits.items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <Input
                        value={item.title}
                        onChange={(e) => updateArrayItem('benefits', index, 'title', e.target.value)}
                        placeholder="Benefit title"
                      />
                      <HybridHtmlEditor
                        content={item.description}
                        onChange={(value) => updateArrayItem('benefits', index, 'description', value)}
                        placeholder="Benefit description"
                      />
                    </div>
                  </Card>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave('benefits')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('benefits')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Process Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="process-title">Title</Label>
                <Input
                  id="process-title"
                  value={content.process.title}
                  onChange={(e) => updateContent('process', 'title', e.target.value)}
                  placeholder="Enter process title"
                />
              </div>
              <div className="space-y-4">
                <Label>Process Steps</Label>
                {content.process.steps.map((step, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <Input
                        value={step.title}
                        onChange={(e) => updateArrayItem('process', index, 'title', e.target.value)}
                        placeholder="Step title"
                      />
                      <HybridHtmlEditor
                        content={step.description}
                        onChange={(value) => updateArrayItem('process', index, 'description', value)}
                        placeholder="Step description"
                      />
                    </div>
                  </Card>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave('process')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('process')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testimonials Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Testimonials</Label>
                {content.testimonials.items.map((testimonial, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          value={testimonial.name}
                          onChange={(e) => updateArrayItem('testimonials', index, 'name', e.target.value)}
                          placeholder="Customer name"
                        />
                        <Input
                          value={testimonial.location}
                          onChange={(e) => updateArrayItem('testimonials', index, 'location', e.target.value)}
                          placeholder="Location (e.g., Austin, TX)"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="number"
                          value={testimonial.savings}
                          onChange={(e) => updateArrayItem('testimonials', index, 'savings', parseInt(e.target.value))}
                          placeholder="Annual savings amount"
                        />
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={testimonial.rating}
                          onChange={(e) => updateArrayItem('testimonials', index, 'rating', parseInt(e.target.value))}
                          placeholder="Rating (1-5)"
                        />
                      </div>
                      <HybridHtmlEditor
                        content={testimonial.text}
                        onChange={(value) => updateArrayItem('testimonials', index, 'text', value)}
                        placeholder="Testimonial text"
                      />
                    </div>
                  </Card>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave('testimonials')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('testimonials')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call to Action Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cta-headline">Headline</Label>
                <Input
                  id="cta-headline"
                  value={content.cta.headline}
                  onChange={(e) => updateContent('cta', 'headline', e.target.value)}
                  placeholder="CTA section headline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta-description">Description</Label>
                <HybridHtmlEditor
                  content={content.cta.description}
                  onChange={(value) => updateContent('cta', 'description', value)}
                  placeholder="CTA section description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta-button">Button Text</Label>
                  <Input
                    id="cta-button"
                    value={content.cta.buttonText}
                    onChange={(e) => updateContent('cta', 'buttonText', e.target.value)}
                    placeholder="CTA button text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-multi-property">Multi-Property Text</Label>
                  <Input
                    id="cta-multi-property"
                    value={content.cta.multiPropertyText}
                    onChange={(e) => updateContent('cta', 'multiPropertyText', e.target.value)}
                    placeholder="Multi-property link text"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta-phone">Contact Phone</Label>
                  <Input
                    id="cta-phone"
                    value={content.cta.contactPhone}
                    onChange={(e) => updateContent('cta', 'contactPhone', e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-guarantee">Guarantee Text</Label>
                  <Input
                    id="cta-guarantee"
                    value={content.cta.guaranteeText}
                    onChange={(e) => updateContent('cta', 'guaranteeText', e.target.value)}
                    placeholder="Guarantee/trust indicators"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave('cta')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('cta')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-logo-url">Logo URL</Label>
                    <Input
                      id="footer-logo-url"
                      value={content.footer.company.logoUrl}
                      onChange={(e) => updateNestedContent('footer', 'company', 'logoUrl', e.target.value)}
                      placeholder="Logo image URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-logo-alt">Logo Alt Text</Label>
                    <Input
                      id="footer-logo-alt"
                      value={content.footer.company.logoAlt}
                      onChange={(e) => updateNestedContent('footer', 'company', 'logoAlt', e.target.value)}
                      placeholder="Logo alt text"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-description">Company Description</Label>
                  <Textarea
                    id="footer-description"
                    value={content.footer.company.description}
                    onChange={(e) => updateNestedContent('footer', 'company', 'description', e.target.value)}
                    placeholder="Company description"
                    rows={3}
                  />
                </div>
              </div>

              {/* Services */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Services</h3>
                  <Button onClick={addServiceItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
                {content.footer.services.map((service, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-end gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>Service Name</Label>
                        <Input
                          value={service.name}
                          onChange={(e) => updateServiceItem(index, 'name', e.target.value)}
                          placeholder="Service name"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Service URL</Label>
                        <Input
                          value={service.url}
                          onChange={(e) => updateServiceItem(index, 'url', e.target.value)}
                          placeholder="Service URL"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeServiceItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-phone">Phone Number</Label>
                    <Input
                      id="footer-phone"
                      value={content.footer.contact.phone}
                      onChange={(e) => updateNestedContent('footer', 'contact', 'phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-email">Email Address</Label>
                    <Input
                      id="footer-email"
                      value={content.footer.contact.email}
                      onChange={(e) => updateNestedContent('footer', 'contact', 'email', e.target.value)}
                      placeholder="Email address"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-street">Street Address</Label>
                  <Input
                    id="footer-street"
                    value={content.footer.contact.address.street}
                    onChange={(e) => updateNestedContent('footer', 'contact', 'address', { ...content.footer.contact.address, street: e.target.value })}
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-city">City</Label>
                    <Input
                      id="footer-city"
                      value={content.footer.contact.address.city}
                      onChange={(e) => updateNestedContent('footer', 'contact', 'address', { ...content.footer.contact.address, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-state">State</Label>
                    <Input
                      id="footer-state"
                      value={content.footer.contact.address.state}
                      onChange={(e) => updateNestedContent('footer', 'contact', 'address', { ...content.footer.contact.address, state: e.target.value })}
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-zip">ZIP Code</Label>
                    <Input
                      id="footer-zip"
                      value={content.footer.contact.address.zip}
                      onChange={(e) => updateNestedContent('footer', 'contact', 'address', { ...content.footer.contact.address, zip: e.target.value })}
                      placeholder="ZIP code"
                    />
                  </div>
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
                      value={content.footer.social.facebook}
                      onChange={(e) => updateNestedContent('footer', 'social', 'facebook', e.target.value)}
                      placeholder="Facebook URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-twitter">Twitter URL</Label>
                    <Input
                      id="footer-twitter"
                      value={content.footer.social.twitter}
                      onChange={(e) => updateNestedContent('footer', 'social', 'twitter', e.target.value)}
                      placeholder="Twitter URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-linkedin">LinkedIn URL</Label>
                    <Input
                      id="footer-linkedin"
                      value={content.footer.social.linkedin}
                      onChange={(e) => updateNestedContent('footer', 'social', 'linkedin', e.target.value)}
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
                    value={content.footer.legal.copyright}
                    onChange={(e) => updateNestedContent('footer', 'legal', 'copyright', e.target.value)}
                    placeholder="Copyright text"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-privacy">Privacy Policy URL</Label>
                    <Input
                      id="footer-privacy"
                      value={content.footer.legal.privacyPolicy}
                      onChange={(e) => updateNestedContent('footer', 'legal', 'privacyPolicy', e.target.value)}
                      placeholder="Privacy Policy URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-terms">Terms of Service URL</Label>
                    <Input
                      id="footer-terms"
                      value={content.footer.legal.termsOfService}
                      onChange={(e) => updateNestedContent('footer', 'legal', 'termsOfService', e.target.value)}
                      placeholder="Terms of Service URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-license">License Info URL</Label>
                    <Input
                      id="footer-license"
                      value={content.footer.legal.licenseInfo}
                      onChange={(e) => updateNestedContent('footer', 'legal', 'licenseInfo', e.target.value)}
                      placeholder="License Info URL"
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
