import { useState, useEffect } from 'react';
import { siteContentService, SiteContentData } from '@/services/siteContentService';
import { useToast } from '@/hooks/use-toast';

interface FooterContent {
  company: {
    name: string;
    description: string;
    logoUrl: string;
  };
  services: {
    name: string;
    url: string;
  }[];
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
    privacyUrl: string;
    terms: string;
    termsUrl: string;
    license: string;
    licenseUrl: string;
  };
}

const defaultFooterContent: FooterContent = {
  company: {
    name: 'EasyTaxProtest.com',
    description: 'Professional property tax protest services helping homeowners save thousands on their annual tax bills. No upfront fees, guaranteed results.',
    logoUrl: '/lovable-uploads/9f31b537-92b7-4e7d-9b60-b224c326a0cc.png'
  },
  services: [
    { name: 'Property Tax Protest', url: '/services/property-tax-protest' },
    { name: 'Tax Assessment Review', url: '/services/tax-assessment-review' },
    { name: 'Commercial Properties', url: '/services/commercial-properties' }, 
    { name: 'Residential Properties', url: '/services/residential-properties' },
    { name: 'Consultation Services', url: '/services/consultation' }
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
    privacyUrl: '/privacy-policy',
    terms: 'Terms of Service',
    termsUrl: '/terms-of-service',
    license: 'License Information',
    licenseUrl: '/license'
  }
};

export const useFooterContent = () => {
  const [content, setContent] = useState<FooterContent>(defaultFooterContent);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFooterContent();
  }, []);

  const migrateFooterData = (data: any): FooterContent => {
    const migrated = { ...data };
    
    // Migrate services from string array to object array
    if (migrated.services && Array.isArray(migrated.services)) {
      migrated.services = migrated.services.map((service: any) => {
        if (typeof service === 'string') {
          return { name: service, url: '#' };
        }
        return service;
      });
    }
    
    // Add missing URL fields to legal object
    if (migrated.legal && typeof migrated.legal === 'object') {
      if (!migrated.legal.privacyUrl) migrated.legal.privacyUrl = '/privacy-policy';
      if (!migrated.legal.termsUrl) migrated.legal.termsUrl = '/terms-of-service';
      if (!migrated.legal.licenseUrl) migrated.legal.licenseUrl = '/license';
    }
    
    return migrated as FooterContent;
  };

  const loadFooterContent = async () => {
    try {
      const data = await siteContentService.getSiteContent('footer');
      if (data) {
        const migratedData = migrateFooterData(data);
        setContent(migratedData);
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