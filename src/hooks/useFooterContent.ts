import { useState, useEffect } from 'react';
import { siteContentService, SiteContentData } from '@/services/siteContentService';
import { useToast } from '@/hooks/use-toast';

interface FooterContent {
  company: {
    name: string;
    description: string;
    logoUrl: string;
  };
  services: string[];
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  legal: {
    copyright: string;
    privacy: string;
    terms: string;
    license: string;
  };
}

const defaultFooterContent: FooterContent = {
  company: {
    name: 'EasyTaxProtest.com',
    description: 'Professional property tax protest services helping homeowners save thousands on their annual tax bills. No upfront fees, guaranteed results.',
    logoUrl: '/lovable-uploads/9f31b537-92b7-4e7d-9b60-b224c326a0cc.png'
  },
  services: [
    'Property Tax Protest',
    'Tax Assessment Review',
    'Commercial Properties', 
    'Residential Properties',
    'Consultation Services'
  ],
  contact: {
    phone: '(555) 012-3456',
    email: 'info@easytaxprotest.com',
    address: '123 Business Plaza\nAustin, TX 78701'
  },
  social: {
    facebook: '#',
    twitter: '#',
    linkedin: '#'
  },
  legal: {
    copyright: '© 2024 EasyTaxProtest.com. All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    license: 'License Information'
  }
};

export const useFooterContent = () => {
  const [content, setContent] = useState<FooterContent>(defaultFooterContent);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFooterContent();
  }, []);

  const loadFooterContent = async () => {
    try {
      const data = await siteContentService.getSiteContent('footer');
      if (data) {
        setContent(data as FooterContent);
      }
    } catch (error) {
      console.error('Error loading footer content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFooterContent = async (newContent: FooterContent) => {
    try {
      const success = await siteContentService.updateSiteContent('footer', 'footer', newContent);
      if (success) {
        setContent(newContent);
        toast({
          title: "Success",
          description: "Footer content updated successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to update footer content",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error saving footer content:', error);
      toast({
        title: "Error",
        description: "Failed to update footer content",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    content,
    setContent,
    loading,
    saveFooterContent,
    refreshContent: loadFooterContent
  };
};