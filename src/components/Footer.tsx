import { Scale, Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-primary rounded-lg">
                <Scale className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">TaxProtest Pro</span>
            </div>
            <p className="text-background/80 mb-6 max-w-md">
              Professional property tax protest services helping homeowners save thousands on their annual tax bills. No upfront fees, guaranteed results.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-background transition-colors">Property Tax Protest</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Tax Assessment Review</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Commercial Properties</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Residential Properties</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Consultation Services</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-background/80">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>(555) 012-3456</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>info@taxprotestpro.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 flex-shrink-0 mt-1" />
                <span>
                  123 Business Plaza<br />
                  Austin, TX 78701
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-background/60">
            <div className="text-sm">
              © 2024 TaxProtest Pro. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm mt-4 md:mt-0">
              <a href="#" className="hover:text-background transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-background transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-background transition-colors">License Information</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};