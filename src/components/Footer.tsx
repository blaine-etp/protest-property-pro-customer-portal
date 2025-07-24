
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";
import { useSiteContent, useSectionContent } from "@/hooks/useSiteContent";

export const Footer = () => {
  const { content: footerContent } = useSectionContent("footer");
  const { content: globalContent } = useSectionContent("global_settings");
  
  const { value: logoAlt } = useSiteContent("footer", "logo_alt", "Tax Logo");
  const { value: companyDescription } = useSiteContent("footer", "company_description", 
    "Professional property tax protest services helping homeowners save thousands on their annual tax bills. No upfront fees, guaranteed results.");
  const { value: copyrightText } = useSiteContent("footer", "copyright_text", "© 2024 EasyTaxProtest.com. All rights reserved.");
  const { value: servicesLinks } = useSiteContent("footer", "services_links", []);
  const { value: socialLinks } = useSiteContent("footer", "social_links", []);
  const { value: legalLinks } = useSiteContent("footer", "legal_links", []);

  return (
    <footer id="contact" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src={footerContent.logo_url || "/lovable-uploads/9f31b537-92b7-4e7d-9b60-b224c326a0cc.png"}
                alt={logoAlt}
                className="h-12"
              />
            </div>
            <p className="text-background/80 mb-6 max-w-md">
              {companyDescription}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social: any, index: number) => (
                <a key={index} href={social.href} className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors">
                  {social.platform === 'facebook' && <Facebook className="h-5 w-5" />}
                  {social.platform === 'twitter' && <Twitter className="h-5 w-5" />}
                  {social.platform === 'linkedin' && <Linkedin className="h-5 w-5" />}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-background/80">
              {servicesLinks.map((service: any, index: number) => (
                <li key={index}>
                  <a href={service.href} className="hover:text-background transition-colors">
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-background/80">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>{globalContent.company_phone || "(555) 012-3456"}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>{globalContent.company_email || "info@easytaxprotest.com"}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 flex-shrink-0 mt-1" />
                <span>
                  {globalContent.company_address || "123 Business Plaza"}<br />
                  {globalContent.company_city || "Austin"}, {globalContent.company_state || "TX"} {globalContent.company_zip || "78701"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-background/60">
            <div className="text-sm">
              {copyrightText}
            </div>
            <div className="flex space-x-6 text-sm mt-4 md:mt-0">
              {legalLinks.map((link: any, index: number) => (
                <a key={index} href={link.href} className="hover:text-background transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
