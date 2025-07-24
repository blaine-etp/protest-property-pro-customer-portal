
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Globe, Header, Layout, Info, Settings } from "lucide-react";
import { useContentBySection } from "@/hooks/useContentManagement";
import { ContentEditor } from "@/components/cms/ContentEditor";
import { JsonArrayEditor } from "@/components/cms/JsonArrayEditor";

export default function AdminSiteContent() {
  const [activeTab, setActiveTab] = useState("homepage");
  
  const { data: homepageContent, isLoading: homepageLoading } = useContentBySection("homepage");
  const { data: headerContent, isLoading: headerLoading } = useContentBySection("header");
  const { data: footerContent, isLoading: footerLoading } = useContentBySection("footer");
  const { data: aboutContent, isLoading: aboutLoading } = useContentBySection("about");
  const { data: globalContent, isLoading: globalLoading } = useContentBySection("global_settings");

  const getContentByKey = (contentList: any[], key: string) => {
    return contentList?.find(item => item.content_key === key);
  };

  if (homepageLoading || headerLoading || footerLoading || aboutLoading || globalLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Site Content Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="homepage" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Homepage
          </TabsTrigger>
          <TabsTrigger value="header" className="flex items-center gap-2">
            <Header className="h-4 w-4" />
            Header
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            About
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Global Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Manage the main homepage content sections including hero, benefits, process, testimonials, and call-to-action.
              </p>
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Homepage Content Editor</h3>
                <p className="text-muted-foreground">
                  Homepage content management will be integrated with the existing editor.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Header & Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {headerContent && (
                <>
                  <ContentEditor
                    content={getContentByKey(headerContent, "logo_alt")}
                    label="Logo Alt Text"
                  />
                  <ContentEditor
                    content={getContentByKey(headerContent, "cta_button_text")}
                    label="CTA Button Text"
                  />
                  <ContentEditor
                    content={getContentByKey(headerContent, "sign_up_text")}
                    label="Sign Up Text"
                  />
                  <JsonArrayEditor
                    content={getContentByKey(headerContent, "nav_items")}
                    label="Navigation Items"
                    itemSchema={[
                      { key: "label", label: "Label", type: "text" },
                      { key: "href", label: "Link", type: "text" }
                    ]}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {footerContent && (
                <>
                  <ContentEditor
                    content={getContentByKey(footerContent, "logo_alt")}
                    label="Logo Alt Text"
                  />
                  <ContentEditor
                    content={getContentByKey(footerContent, "company_description")}
                    label="Company Description"
                  />
                  <ContentEditor
                    content={getContentByKey(footerContent, "copyright_text")}
                    label="Copyright Text"
                  />
                  <JsonArrayEditor
                    content={getContentByKey(footerContent, "services_links")}
                    label="Services Links"
                    itemSchema={[
                      { key: "label", label: "Label", type: "text" },
                      { key: "href", label: "Link", type: "text" }
                    ]}
                  />
                  <JsonArrayEditor
                    content={getContentByKey(footerContent, "social_links")}
                    label="Social Media Links"
                    itemSchema={[
                      { key: "platform", label: "Platform", type: "text" },
                      { key: "href", label: "Link", type: "text" }
                    ]}
                  />
                  <JsonArrayEditor
                    content={getContentByKey(footerContent, "legal_links")}
                    label="Legal Links"
                    itemSchema={[
                      { key: "label", label: "Label", type: "text" },
                      { key: "href", label: "Link", type: "text" }
                    ]}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About Page Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {aboutContent && (
                <>
                  <ContentEditor
                    content={getContentByKey(aboutContent, "hero_title")}
                    label="Hero Title"
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "hero_subtitle")}
                    label="Hero Subtitle"
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "hero_location")}
                    label="Hero Location"
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "main_title")}
                    label="Main Title"
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "main_description")}
                    label="Main Description"
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "mission_title")}
                    label="Mission Title"
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "mission_description")}
                    label="Mission Description"
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "why_choose_title")}
                    label="Why Choose Title"
                  />
                  <JsonArrayEditor
                    content={getContentByKey(aboutContent, "why_choose_items")}
                    label="Why Choose Items"
                    itemSchema={[
                      { key: "title", label: "Title", type: "text" },
                      { key: "description", label: "Description", type: "text" },
                      { key: "icon", label: "Icon", type: "text" }
                    ]}
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "process_title")}
                    label="Process Title"
                  />
                  <JsonArrayEditor
                    content={getContentByKey(aboutContent, "process_steps")}
                    label="Process Steps"
                    itemSchema={[
                      { key: "step", label: "Step Number", type: "number" },
                      { key: "title", label: "Title", type: "text" },
                      { key: "description", label: "Description", type: "text" }
                    ]}
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "cta_title")}
                    label="CTA Title"
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "cta_description")}
                    label="CTA Description"
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "cta_primary_button")}
                    label="CTA Primary Button"
                  />
                  <ContentEditor
                    content={getContentByKey(aboutContent, "cta_secondary_button")}
                    label="CTA Secondary Button"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Site Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {globalContent && (
                <>
                  <ContentEditor
                    content={getContentByKey(globalContent, "company_name")}
                    label="Company Name"
                  />
                  <ContentEditor
                    content={getContentByKey(globalContent, "company_phone")}
                    label="Company Phone"
                  />
                  <ContentEditor
                    content={getContentByKey(globalContent, "company_email")}
                    label="Company Email"
                  />
                  <ContentEditor
                    content={getContentByKey(globalContent, "company_address")}
                    label="Company Address"
                  />
                  <ContentEditor
                    content={getContentByKey(globalContent, "company_city")}
                    label="Company City"
                  />
                  <ContentEditor
                    content={getContentByKey(globalContent, "company_state")}
                    label="Company State"
                  />
                  <ContentEditor
                    content={getContentByKey(globalContent, "company_zip")}
                    label="Company ZIP Code"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
