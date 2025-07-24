import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";
import { useFooterContent } from "@/hooks/useFooterContent";

export const Footer = () => {
  const { content, loading } = useFooterContent();

  if (loading) {
    return (
      <footer id="contact" className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">Loading...</div>
        </div>
      </footer>
    );
  }

  return (
    <footer id="contact" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src={content.company.logoUrl}
                alt="Tax Logo" 
                className="h-12"
              />
            </div>
            <p className="text-background/80 mb-6 max-w-md">
              {content.company.description}
            </p>
            <div className="flex space-x-4">
              <a href={content.social.facebook} className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={content.social.twitter} className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href={content.social.linkedin} className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-background/80">
              {content.services.map((service, index) => (
                <li key={index}>
                  <a href={service.url} className="hover:text-background transition-colors">{service.name}</a>
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
                <span>{content.contact.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>{content.contact.email}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 flex-shrink-0 mt-1" />
                <span dangerouslySetInnerHTML={{ __html: content.contact.address.replace(/\n/g, '<br />') }} />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-background/60">
            <div className="text-sm">
              {content.legal.copyright}
            </div>
            <div className="flex space-x-6 text-sm mt-4 md:mt-0">
              <a href={content.legal.privacyUrl} className="hover:text-background transition-colors">{content.legal.privacy}</a>
              <a href={content.legal.termsUrl} className="hover:text-background transition-colors">{content.legal.terms}</a>
              <a href={content.legal.licenseUrl} className="hover:text-background transition-colors">{content.legal.license}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};