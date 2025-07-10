import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Building2 } from "lucide-react";
import { useState } from "react";
import austinSkyline from "@/assets/austin-skyline.jpg";
import { AnimatedCounter } from "./AnimatedCounter";
import MultiStepForm from "./MultiStepForm";

interface HeroSectionProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ showForm, setShowForm }) => {
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      setShowForm(true);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Austin Skyline Background */}
      <div className="absolute inset-0">
        <img 
          src={austinSkyline} 
          alt="Austin Texas skyline" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60"></div>
      </div>
      
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
            className="animate-pulse opacity-30"
            style={{ animationDuration: '8s' }}
          />
          {/* Secondary Wave Layer */}
          <path
            d="M0,96 C300,112 600,128 900,112 C1050,104 1200,96 1200,96 L1200,800 L0,800 Z"
            fill="var(--wave-secondary)"
            className="animate-pulse opacity-25"
            style={{ animationDuration: '12s', animationDelay: '2s' }}
          />
          {/* Tertiary Wave Layer */}
          <path
            d="M0,128 C200,144 400,160 600,144 C800,128 1000,112 1200,112 L1200,800 L0,800 Z"
            fill="var(--wave-tertiary)"
            className="animate-pulse opacity-20"
            style={{ animationDuration: '16s', animationDelay: '4s' }}
          />
        </svg>
      </div>
      
      {/* Bottom Wave Pattern */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          className="w-full h-32 md:h-40"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bottom Primary Wave */}
          <path
            d="M0,160 L0,96 C240,80 480,64 720,80 C960,96 1200,112 1200,112 L1200,160 Z"
            fill="var(--wave-primary)"
            className="animate-pulse opacity-35"
            style={{ animationDuration: '10s', animationDelay: '1s' }}
          />
          {/* Bottom Secondary Wave */}
          <path
            d="M0,160 L0,112 C300,96 600,80 900,96 C1050,104 1200,112 1200,112 L1200,160 Z"
            fill="var(--wave-secondary)"
            className="animate-pulse opacity-30"
            style={{ animationDuration: '14s', animationDelay: '3s' }}
          />
          {/* Bottom Tertiary Wave */}
          <path
            d="M0,160 L0,128 C200,112 400,96 600,112 C800,128 1000,144 1200,144 L1200,160 Z"
            fill="var(--wave-tertiary)"
            className="animate-pulse opacity-25"
            style={{ animationDuration: '18s', animationDelay: '5s' }}
          />
        </svg>
      </div>
      <div className="container px-4 mx-auto text-center relative z-10">
        {!showForm ? (
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
                  Check Savings
                </Button>
              </div>
            </form>

            <div className="flex justify-center mb-12">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-white border border-muted-foreground/30 hover:border-white transition-all duration-200"
              >
                <Building2 className="mr-2 h-4 w-4" />
                I have multiple properties
              </Button>
            </div>

            <div className="bg-card/20 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-5xl border border-primary/20 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 rounded-xl bg-background/30 backdrop-blur-sm border border-primary/10 hover:bg-background/40 transition-all duration-300">
                  <div className="text-5xl md:text-6xl font-bold text-primary mb-3 animate-fade-in">
                    <AnimatedCounter end={2500} prefix="$" className="tabular-nums" />
                  </div>
                  <div className="text-lg text-muted-foreground font-medium">Average Savings</div>
                </div>
                <div className="p-6 rounded-xl bg-background/30 backdrop-blur-sm border border-primary/10 hover:bg-background/40 transition-all duration-300">
                  <div className="text-5xl md:text-6xl font-bold text-primary mb-3 animate-fade-in">
                    <AnimatedCounter end={95} suffix="%" className="tabular-nums" />
                  </div>
                  <div className="text-lg text-muted-foreground font-medium">Success Rate</div>
                </div>
                <div className="p-6 rounded-xl bg-background/30 backdrop-blur-sm border border-primary/10 hover:bg-background/40 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-3 animate-fade-in">
                    <AnimatedCounter end={10000} suffix="+" className="tabular-nums" />
                  </div>
                  <div className="text-lg text-muted-foreground font-medium">Properties Protested</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <MultiStepForm address={address} onComplete={() => setShowForm(false)} />
          </div>
        )}
      </div>
    </section>
  );
};