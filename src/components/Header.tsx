
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useSiteContent, useSectionContent } from "@/hooks/useSiteContent";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { content: headerContent } = useSectionContent("header");
  const { value: logoAlt } = useSiteContent("header", "logo_alt", "EasyTaxProtest.com");
  const { value: ctaButtonText } = useSiteContent("header", "cta_button_text", "Contact Us");
  const { value: signUpText } = useSiteContent("header", "sign_up_text", "Sign Up");
  const { value: navItems } = useSiteContent("header", "nav_items", [
    { label: "Services", href: "#services" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Resources", href: "/resources" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "#contact" }
  ]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src={headerContent.logo_url || "/lovable-uploads/fe72b475-c203-4999-8384-be417f456711.png"}
              alt={logoAlt}
              className="h-8"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item: any, index: number) => (
              <a
                key={index}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              {ctaButtonText}
            </Button>
            <Button size="sm">
              {signUpText}
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t">
            <nav className="flex flex-col space-y-4 pt-4">
              {navItems.map((item: any, index: number) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" size="sm">
                  {ctaButtonText}
                </Button>
                <Button size="sm">
                  {signUpText}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
