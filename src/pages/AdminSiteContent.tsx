import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HybridHtmlEditor } from '@/components/ui/hybrid-html-editor';
import { Badge } from '@/components/ui/badge';
import { Upload, Save, Eye, Settings, FileText, Image, Globe, Search } from 'lucide-react';
import { toast } from 'sonner';

// Mock data structure matching current site content
const initialSiteContent = {
  hero: {
    headline: "Lower Your Property Taxes <span class='text-primary'>Guaranteed</span>",
    subheadline: "Professional property tax protest services that save homeowners thousands. Enter your address below to see if you qualify for significant tax savings.",
    backgroundImage: "/assets/austin-skyline.jpg",
    primaryButtonText: "Check Savings",
    secondaryButtonText: "I have 3 or more properties",
    statistics: {
      averageSavings: 2500,
      successRate: 95,
      propertiesProtested: 10000
    }
  },
  header: {
    logo: "/placeholder-logo.png",
    phone: "(512) 555-0123",
    ctaButtonText: "Get Started"
  },
  benefits: {
    sectionTitle: "Why Choose Our Property Tax Protest Services",
    benefits: [
      {
        icon: "Shield",
        title: "100% Success Guarantee",
        description: "We guarantee results or you don't pay. Our expert team has a proven track record of success."
      },
      {
        icon: "DollarSign",
        title: "Save Thousands Annually",
        description: "Average savings of $2,500 per year. Many clients save much more depending on their property value."
      },
      {
        icon: "Clock",
        title: "No Time Investment",
        description: "We handle everything from start to finish. You just provide basic information and we do the rest."
      },
      {
        icon: "Users",
        title: "Expert Legal Team",
        description: "Licensed attorneys and certified tax consultants with decades of combined experience."
      },
      {
        icon: "FileText",
        title: "Comprehensive Analysis",
        description: "Detailed property analysis using comparable sales, market trends, and assessment errors."
      },
      {
        icon: "TrendingUp",
        title: "Proven Results",
        description: "Over 95% success rate with thousands of satisfied homeowners across Texas."
      }
    ]
  },
  testimonials: {
    sectionTitle: "What Our Clients Say",
    testimonials: [
      {
        name: "Sarah Johnson",
        location: "Austin, TX",
        savings: "$3,200",
        text: "I couldn't believe how much money I was overpaying in property taxes. The team made the process so easy and saved me thousands!",
        rating: 5,
        image: "/placeholder-testimonial-1.jpg"
      },
      {
        name: "Mike Rodriguez",
        location: "Houston, TX",
        savings: "$1,800",
        text: "Professional service from start to finish. They handled everything and got me a significant reduction in my property taxes.",
        rating: 5,
        image: "/placeholder-testimonial-2.jpg"
      },
      {
        name: "Lisa Chen",
        location: "Dallas, TX",
        savings: "$2,950",
        text: "The savings were even better than promised. I recommend this service to all my friends and family.",
        rating: 5,
        image: "/placeholder-testimonial-3.jpg"
      }
    ]
  },
  process: {
    sectionTitle: "Our Simple 4-Step Process",
    steps: [
      {
        stepNumber: 1,
        title: "Property Analysis",
        description: "We analyze your property and compare it to similar homes in your area to identify potential savings."
      },
      {
        stepNumber: 2,
        title: "Documentation",
        description: "Our team gathers all necessary documentation and evidence to support your protest."
      },
      {
        stepNumber: 3,
        title: "File Protest",
        description: "We file your protest with the appropriate authorities and represent you throughout the process."
      },
      {
        stepNumber: 4,
        title: "Save Money",
        description: "Once approved, you'll see reduced property taxes on your next bill. It's that simple!"
      }
    ]
  },
  cta: {
    headline: "Ready to Lower Your Property Taxes?",
    description: "Join thousands of homeowners who have already saved money with our professional protest services.",
    buttonText: "Get Started Today"
  },
  footer: {
    logo: "/placeholder-footer-logo.png",
    companyDescription: "Professional property tax protest services helping Texas homeowners save thousands on their annual property taxes.",
    services: [
      "Property Tax Protests",
      "Property Analysis",
      "Legal Representation",
      "Tax Consultation"
    ],
    contactInfo: {
      address: "123 Main St, Austin, TX 78701",
      phone: "(512) 555-0123",
      email: "info@propertytaxhelp.com"
    },
    socialLinks: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#"
    },
    footerLinks: [
      { name: "Privacy Policy", url: "/privacy" },
      { name: "Terms of Service", url: "/terms" },
      { name: "Contact Us", url: "/contact" }
    ],
    copyright: "© 2024 Property Tax Help. All rights reserved."
  }
};

const initialSeoSettings = {
  robotsTxt: `User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /auth/`,
  metaTags: {
    title: "Property Tax Protest Services - Lower Your Taxes Guaranteed",
    description: "Professional property tax protest services in Texas. Save thousands on your property taxes with our 95% success rate. Get started today!",
    keywords: "property tax protest, property tax appeal, Texas property tax, lower property taxes",
    ogTitle: "Lower Your Property Taxes - Guaranteed Results",
    ogDescription: "Professional property tax protest services that save homeowners thousands. 95% success rate.",
    ogImage: "/og-image.jpg"
  },
  sitemapConfig: {
    changeFreq: "monthly",
    priority: "0.8",
    additionalUrls: []
  }
};

export function AdminSiteContent() {
  const [content, setContent] = useState(initialSiteContent);
  const [seoSettings, setSeoSettings] = useState(initialSeoSettings);
  const [activeTab, setActiveTab] = useState('hero');
  const [hasChanges, setHasChanges] = useState(false);

  const handleContentChange = (section: string, key: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleNestedContentChange = (section: string, index: number, key: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [prev[section].testimonials ? 'testimonials' : prev[section].benefits ? 'benefits' : 'steps']: prev[section][prev[section].testimonials ? 'testimonials' : prev[section].benefits ? 'benefits' : 'steps'].map((item: any, i: number) => 
          i === index ? { ...item, [key]: value } : item
        )
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In the real implementation, this would save to the database
    toast.success('Content saved successfully!');
    setHasChanges(false);
  };

  const handlePreview = () => {
    // In the real implementation, this would show a preview
    toast.info('Preview functionality will be added in the backend implementation');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Content Management</h1>
          <p className="text-muted-foreground">
            Manage all your website content, SEO settings, and media files
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-yellow-800">
              <p className="font-medium">Unsaved Changes</p>
              <p className="text-sm">You have unsaved changes. Don't forget to save before leaving.</p>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Main landing page hero content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="headline">Hero Headline</Label>
                <HybridHtmlEditor
                  content={content.hero.headline}
                  onChange={(value) => handleContentChange('hero', 'headline', value)}
                  placeholder="Enter your hero headline. Use HTML for styling: <span class='text-primary'>Guaranteed</span> for colored text, <strong>bold</strong> for emphasis, etc."
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Tip: Use HTML classes like <code>text-primary</code>, <code>text-blue-600</code>, or formatting tags like <code>&lt;strong&gt;</code> for styling.
                </p>
              </div>
              <div>
                <Label htmlFor="subheadline">Subheadline</Label>
                <Textarea
                  id="subheadline"
                  value={content.hero.subheadline}
                  onChange={(e) => handleContentChange('hero', 'subheadline', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="backgroundImage">Background Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundImage"
                    value={content.hero.backgroundImage}
                    onChange={(e) => handleContentChange('hero', 'backgroundImage', e.target.value)}
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryButton">Primary Button Text</Label>
                  <Input
                    id="primaryButton"
                    value={content.hero.primaryButtonText}
                    onChange={(e) => handleContentChange('hero', 'primaryButtonText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryButton">Secondary Button Text</Label>
                  <Input
                    id="secondaryButton"
                    value={content.hero.secondaryButtonText}
                    onChange={(e) => handleContentChange('hero', 'secondaryButtonText', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Statistics</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="avgSavings">Average Savings</Label>
                    <Input
                      id="avgSavings"
                      type="number"
                      value={content.hero.statistics.averageSavings}
                      onChange={(e) => handleContentChange('hero', 'statistics', {
                        ...content.hero.statistics,
                        averageSavings: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="successRate">Success Rate (%)</Label>
                    <Input
                      id="successRate"
                      type="number"
                      value={content.hero.statistics.successRate}
                      onChange={(e) => handleContentChange('hero', 'statistics', {
                        ...content.hero.statistics,
                        successRate: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="propertiesProtested">Properties Protested</Label>
                    <Input
                      id="propertiesProtested"
                      type="number"
                      value={content.hero.statistics.propertiesProtested}
                      onChange={(e) => handleContentChange('hero', 'statistics', {
                        ...content.hero.statistics,
                        propertiesProtested: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Section</CardTitle>
              <CardDescription>Manage the benefits/features displayed on your homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="benefitsSectionTitle">Section Title</Label>
                <Input
                  id="benefitsSectionTitle"
                  value={content.benefits.sectionTitle}
                  onChange={(e) => handleContentChange('benefits', 'sectionTitle', e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <Label>Benefits</Label>
                {content.benefits.benefits.map((benefit: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`benefit-icon-${index}`}>Icon</Label>
                        <Input
                          id={`benefit-icon-${index}`}
                          value={benefit.icon}
                          onChange={(e) => handleNestedContentChange('benefits', index, 'icon', e.target.value)}
                          placeholder="Icon name (e.g., Shield, DollarSign)"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`benefit-title-${index}`}>Title</Label>
                        <Input
                          id={`benefit-title-${index}`}
                          value={benefit.title}
                          onChange={(e) => handleNestedContentChange('benefits', index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`benefit-description-${index}`}>Description</Label>
                        <Textarea
                          id={`benefit-description-${index}`}
                          value={benefit.description}
                          onChange={(e) => handleNestedContentChange('benefits', index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Testimonials Section</CardTitle>
              <CardDescription>Manage customer testimonials and reviews</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testimonialsSectionTitle">Section Title</Label>
                <Input
                  id="testimonialsSectionTitle"
                  value={content.testimonials.sectionTitle}
                  onChange={(e) => handleContentChange('testimonials', 'sectionTitle', e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <Label>Testimonials</Label>
                {content.testimonials.testimonials.map((testimonial: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`testimonial-name-${index}`}>Customer Name</Label>
                        <Input
                          id={`testimonial-name-${index}`}
                          value={testimonial.name}
                          onChange={(e) => handleNestedContentChange('testimonials', index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`testimonial-location-${index}`}>Location</Label>
                        <Input
                          id={`testimonial-location-${index}`}
                          value={testimonial.location}
                          onChange={(e) => handleNestedContentChange('testimonials', index, 'location', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`testimonial-savings-${index}`}>Savings Amount</Label>
                        <Input
                          id={`testimonial-savings-${index}`}
                          value={testimonial.savings}
                          onChange={(e) => handleNestedContentChange('testimonials', index, 'savings', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`testimonial-rating-${index}`}>Rating (1-5)</Label>
                        <Input
                          id={`testimonial-rating-${index}`}
                          type="number"
                          min="1"
                          max="5"
                          value={testimonial.rating}
                          onChange={(e) => handleNestedContentChange('testimonials', index, 'rating', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`testimonial-text-${index}`}>Testimonial Text</Label>
                      <Textarea
                        id={`testimonial-text-${index}`}
                        value={testimonial.text}
                        onChange={(e) => handleNestedContentChange('testimonials', index, 'text', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`testimonial-image-${index}`}>Customer Image</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`testimonial-image-${index}`}
                          value={testimonial.image}
                          onChange={(e) => handleNestedContentChange('testimonials', index, 'image', e.target.value)}
                        />
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Process Section</CardTitle>
              <CardDescription>Manage the step-by-step process display</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="processSectionTitle">Section Title</Label>
                <Input
                  id="processSectionTitle"
                  value={content.process.sectionTitle}
                  onChange={(e) => handleContentChange('process', 'sectionTitle', e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <Label>Process Steps</Label>
                {content.process.steps.map((step: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`step-number-${index}`}>Step Number</Label>
                        <Input
                          id={`step-number-${index}`}
                          type="number"
                          value={step.stepNumber}
                          onChange={(e) => handleNestedContentChange('process', index, 'stepNumber', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`step-title-${index}`}>Step Title</Label>
                        <Input
                          id={`step-title-${index}`}
                          value={step.title}
                          onChange={(e) => handleNestedContentChange('process', index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`step-description-${index}`}>Description</Label>
                        <Textarea
                          id={`step-description-${index}`}
                          value={step.description}
                          onChange={(e) => handleNestedContentChange('process', index, 'description', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Header Settings</CardTitle>
                <CardDescription>Logo, navigation, and header content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="headerLogo">Header Logo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="headerLogo"
                      value={content.header.logo}
                      onChange={(e) => handleContentChange('header', 'logo', e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="headerPhone">Phone Number</Label>
                  <Input
                    id="headerPhone"
                    value={content.header.phone}
                    onChange={(e) => handleContentChange('header', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="headerCTA">Header CTA Button</Label>
                  <Input
                    id="headerCTA"
                    value={content.header.ctaButtonText}
                    onChange={(e) => handleContentChange('header', 'ctaButtonText', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CTA Section</CardTitle>
                <CardDescription>Call-to-action section content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ctaHeadline">CTA Headline</Label>
                  <Input
                    id="ctaHeadline"
                    value={content.cta.headline}
                    onChange={(e) => handleContentChange('cta', 'headline', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ctaDescription">CTA Description</Label>
                  <Textarea
                    id="ctaDescription"
                    value={content.cta.description}
                    onChange={(e) => handleContentChange('cta', 'description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="ctaButtonText">CTA Button Text</Label>
                  <Input
                    id="ctaButtonText"
                    value={content.cta.buttonText}
                    onChange={(e) => handleContentChange('cta', 'buttonText', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
              <CardDescription>Footer content, links, and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="footerLogo">Footer Logo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="footerLogo"
                      value={content.footer.logo}
                      onChange={(e) => handleContentChange('footer', 'logo', e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="footerCopyright">Copyright Text</Label>
                  <Input
                    id="footerCopyright"
                    value={content.footer.copyright}
                    onChange={(e) => handleContentChange('footer', 'copyright', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="companyDescription">Company Description</Label>
                <Textarea
                  id="companyDescription"
                  value={content.footer.companyDescription}
                  onChange={(e) => handleContentChange('footer', 'companyDescription', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="footerAddress">Address</Label>
                  <Input
                    id="footerAddress"
                    value={content.footer.contactInfo.address}
                    onChange={(e) => handleContentChange('footer', 'contactInfo', {
                      ...content.footer.contactInfo,
                      address: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="footerPhone">Phone</Label>
                  <Input
                    id="footerPhone"
                    value={content.footer.contactInfo.phone}
                    onChange={(e) => handleContentChange('footer', 'contactInfo', {
                      ...content.footer.contactInfo,
                      phone: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="footerEmail">Email</Label>
                  <Input
                    id="footerEmail"
                    value={content.footer.contactInfo.email}
                    onChange={(e) => handleContentChange('footer', 'contactInfo', {
                      ...content.footer.contactInfo,
                      email: e.target.value
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Robots.txt Editor</CardTitle>
                <CardDescription>Configure search engine crawling rules</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={seoSettings.robotsTxt}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, robotsTxt: e.target.value }))}
                  rows={10}
                  className="font-mono"
                  placeholder="Enter robots.txt content..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sitemap Configuration</CardTitle>
                <CardDescription>Configure sitemap generation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="changeFreq">Change Frequency</Label>
                  <Input
                    id="changeFreq"
                    value={seoSettings.sitemapConfig.changeFreq}
                    onChange={(e) => setSeoSettings(prev => ({
                      ...prev,
                      sitemapConfig: { ...prev.sitemapConfig, changeFreq: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    value={seoSettings.sitemapConfig.priority}
                    onChange={(e) => setSeoSettings(prev => ({
                      ...prev,
                      sitemapConfig: { ...prev.sitemapConfig, priority: e.target.value }
                    }))}
                  />
                </div>
                <Button variant="outline" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Generate Sitemap
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Meta Tags & SEO</CardTitle>
              <CardDescription>Configure meta tags and Open Graph settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={seoSettings.metaTags.title}
                    onChange={(e) => setSeoSettings(prev => ({
                      ...prev,
                      metaTags: { ...prev.metaTags, title: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    value={seoSettings.metaTags.keywords}
                    onChange={(e) => setSeoSettings(prev => ({
                      ...prev,
                      metaTags: { ...prev.metaTags, keywords: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={seoSettings.metaTags.description}
                  onChange={(e) => setSeoSettings(prev => ({
                    ...prev,
                    metaTags: { ...prev.metaTags, description: e.target.value }
                  }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ogTitle">Open Graph Title</Label>
                  <Input
                    id="ogTitle"
                    value={seoSettings.metaTags.ogTitle}
                    onChange={(e) => setSeoSettings(prev => ({
                      ...prev,
                      metaTags: { ...prev.metaTags, ogTitle: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="ogImage">Open Graph Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="ogImage"
                      value={seoSettings.metaTags.ogImage}
                      onChange={(e) => setSeoSettings(prev => ({
                        ...prev,
                        metaTags: { ...prev.metaTags, ogImage: e.target.value }
                      }))}
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="ogDescription">Open Graph Description</Label>
                <Textarea
                  id="ogDescription"
                  value={seoSettings.metaTags.ogDescription}
                  onChange={(e) => setSeoSettings(prev => ({
                    ...prev,
                    metaTags: { ...prev.metaTags, ogDescription: e.target.value }
                  }))}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>Manage uploaded images and files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Upload Media Files</p>
                <p className="text-gray-600 mb-4">Drag and drop files here or click to browse</p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Recently Uploaded</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border rounded-lg p-4 text-center">
                      <div className="bg-gray-100 rounded-lg h-24 mb-2 flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 truncate">placeholder-image-{i}.jpg</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
