import { Button } from "@/components/ui/button";
import { Scale, Phone, Mail } from "lucide-react";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/d57bb117-1d86-4e7e-abfa-9ee338ec74a4.png" 
              alt="EasyTaxProtest.com" 
              className="h-8"
            />
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-foreground hover:text-primary transition-colors">
              Services
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <a href="tel:555-0123" className="hidden sm:flex items-center text-muted-foreground hover:text-primary transition-colors">
              <Phone className="h-4 w-4 mr-2" />
              (555) 012-3456
            </a>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
            <Button variant="default" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};