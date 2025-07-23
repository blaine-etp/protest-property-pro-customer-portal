
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HybridHtmlEditor } from "@/components/ui/hybrid-html-editor";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save, RotateCcw } from "lucide-react";

// Mock data structure for site content
const initialContent = {
  hero: {
    headline: "Lower Your Property Taxes with Expert Appeals",
    subtitle: "Professional property tax reduction services with no upfront costs. Only pay when we save you money.",
    buttonText: "Get Started Today"
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
        text: "They saved me $2,400 per year on my property taxes. The process was completely handled by their team.",
        rating: 5
      },
      {
        name: "Mike Chen",
        text: "Professional service and great results. I recommend them to all my neighbors.",
        rating: 5
      },
      {
        name: "Lisa Rodriguez",
        text: "Easy process and significant savings. Worth every penny of their fee.",
        rating: 5
      }
    ]
  },
  footer: {
    contactInfo: {
      phone: "(555) 123-4567",
      email: "info@propertytaxappeals.com",
      address: "123 Main Street, Austin, TX 78701"
    },
    quickLinks: [
      { name: "About Us", url: "/about" },
      { name: "Services", url: "/services" },
      { name: "Contact", url: "/contact" }
    ],
    legalLinks: [
      { name: "Privacy Policy", url: "/privacy" },
      { name: "Terms of Service", url: "/terms" },
      { name: "Disclaimer", url: "/disclaimer" }
    ]
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
    resetContent[section as keyof typeof content] = initialContent[section as keyof typeof initialContent];
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Site Content Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-headline">Headline</Label>
                <Input
                  id="hero-headline"
                  value={content.hero.headline}
                  onChange={(e) => updateContent('hero', 'headline', e.target.value)}
                  placeholder="Enter hero headline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <HybridHtmlEditor
                  content={content.hero.subtitle}
                  onChange={(value) => updateContent('hero', 'subtitle', value)}
                  placeholder="Enter hero subtitle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-button">Button Text</Label>
                <Input
                  id="hero-button"
                  value={content.hero.buttonText}
                  onChange={(e) => updateContent('hero', 'buttonText', e.target.value)}
                  placeholder="Enter button text"
                />
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
                      <Input
                        value={testimonial.name}
                        onChange={(e) => updateArrayItem('testimonials', index, 'name', e.target.value)}
                        placeholder="Customer name"
                      />
                      <HybridHtmlEditor
                        content={testimonial.text}
                        onChange={(value) => updateArrayItem('testimonials', index, 'text', value)}
                        placeholder="Testimonial text"
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

        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Contact Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-phone">Phone</Label>
                    <Input
                      id="footer-phone"
                      value={content.footer.contactInfo.phone}
                      onChange={(e) => updateContent('footer', 'contactInfo', { ...content.footer.contactInfo, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-email">Email</Label>
                    <Input
                      id="footer-email"
                      value={content.footer.contactInfo.email}
                      onChange={(e) => updateContent('footer', 'contactInfo', { ...content.footer.contactInfo, email: e.target.value })}
                      placeholder="Email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-address">Address</Label>
                    <Input
                      id="footer-address"
                      value={content.footer.contactInfo.address}
                      onChange={(e) => updateContent('footer', 'contactInfo', { ...content.footer.contactInfo, address: e.target.value })}
                      placeholder="Physical address"
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
