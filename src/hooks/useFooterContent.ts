import { useState, useEffect } from "react";
import { siteContentService } from "@/services/siteContentService";
import { useToast } from "@/hooks/use-toast";

export interface FooterData {
  companyLogo: { url: string; alt: string };
  companyDescription: string;
  socialLinks: Array<{ platform: string; url: string }>;
  services: Array<{ name: string; url: string }>;
  contactInfo: {
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  copyrightText: string;
  legalLinks: Array<{ name: string; url: string }>;
}

export const useFooterContent = () => {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadFooterContent = async () => {
    try {
      setLoading(true);
      const content = await siteContentService.getContentByType('footer');
      
      const footerMap = content.reduce((acc, item) => {
        acc[item.content_key] = item.content_value;
        return acc;
      }, {} as Record<string, any>);

      setFooterData({
        companyLogo: footerMap.company_logo || { url: "", alt: "" },
        companyDescription: footerMap.company_description || "",
        socialLinks: footerMap.social_links || [],
        services: footerMap.services || [],
        contactInfo: footerMap.contact_info || {
          phone: "",
          email: "",
          address: { street: "", city: "", state: "", zip: "" }
        },
        copyrightText: footerMap.copyright_text || "",
        legalLinks: footerMap.legal_links || []
      });
    } catch (error) {
      console.error('Error loading footer content:', error);
      toast({
        title: "Error",
        description: "Failed to load footer content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFooterContent = async (data: FooterData) => {
    try {
      setSaving(true);
      
      await Promise.all([
        siteContentService.upsertContent('footer', 'company_logo', data.companyLogo),
        siteContentService.upsertContent('footer', 'company_description', data.companyDescription),
        siteContentService.upsertContent('footer', 'social_links', data.socialLinks),
        siteContentService.upsertContent('footer', 'services', data.services),
        siteContentService.upsertContent('footer', 'contact_info', data.contactInfo),
        siteContentService.upsertContent('footer', 'copyright_text', data.copyrightText),
        siteContentService.upsertContent('footer', 'legal_links', data.legalLinks)
      ]);

      setFooterData(data);
      toast({
        title: "Success",
        description: "Footer content saved successfully"
      });
    } catch (error) {
      console.error('Error saving footer content:', error);
      toast({
        title: "Error",
        description: "Failed to save footer content",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadFooterContent();
  }, []);

  return {
    footerData,
    loading,
    saving,
    saveFooterContent,
    reloadFooterContent: loadFooterContent
  };
};