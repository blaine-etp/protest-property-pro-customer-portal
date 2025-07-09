import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";

export const HeroSection = () => {
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      // Here you would typically handle the address submission
      console.log("Address submitted:", address);
      // For now, just show an alert
      alert(`Starting property tax protest process for: ${address}`);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Wave Background Pattern */}
      <div className="absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Primary Wave Layer */}
          <path
            d="M0,64 C240,80 480,96 720,80 C960,64 1200,48 1200,48 L1200,800 L0,800 Z"
            fill="var(--wave-primary)"
            className="animate-pulse"
            style={{ animationDuration: '8s' }}
          />
          {/* Secondary Wave Layer */}
          <path
            d="M0,96 C300,112 600,128 900,112 C1050,104 1200,96 1200,96 L1200,800 L0,800 Z"
            fill="var(--wave-secondary)"
            className="animate-pulse"
            style={{ animationDuration: '12s', animationDelay: '2s' }}
          />
          {/* Tertiary Wave Layer */}
          <path
            d="M0,128 C200,144 400,160 600,144 C800,128 1000,112 1200,112 L1200,800 L0,800 Z"
            fill="var(--wave-tertiary)"
            className="animate-pulse"
            style={{ animationDuration: '16s', animationDelay: '4s' }}
          />
        </svg>
      </div>
      <div className="container px-4 mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Lower Your Property Taxes
            <span className="text-primary"> Guaranteed</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional property tax protest services that save homeowners thousands. 
            Enter your address below to see if you qualify for significant tax savings.
          </p>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-card rounded-xl shadow-hero">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Enter your property address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-12 h-14 text-lg border-0 bg-transparent focus:ring-0"
                  required
                />
              </div>
              <Button 
                type="submit" 
                variant="hero" 
                size="lg"
                className="h-14 px-8 text-lg font-semibold"
              >
                <Search className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">$2,500</div>
              <div className="text-muted-foreground">Average Savings</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Properties Protested</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};