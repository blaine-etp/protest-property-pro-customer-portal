
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Phone, Building2, CheckCircle, Users, Clock, Award } from "lucide-react";

const MultiPropertyContact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,64 C240,80 480,96 720,80 C960,64 1200,48 1200,48 L1200,800 L0,800 Z"
              fill="var(--wave-primary)"
              className="animate-pulse opacity-30"
              style={{ animationDuration: '8s' }}
            />
            <path
              d="M0,96 C300,112 600,128 900,112 C1050,104 1200,96 1200,96 L1200,800 L0,800 Z"
              fill="var(--wave-secondary)"
              className="animate-pulse opacity-25"
              style={{ animationDuration: '12s', animationDelay: '2s' }}
            />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Multiple Properties?
              <span className="text-primary block">Let's Talk</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              When you have 3 or more properties, you deserve personalized service. 
              Our concierge team specializes in bulk property tax protests with maximum savings.
            </p>

            {/* Phone Number Display */}
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-2xl border border-primary/20 shadow-xl mb-8">
              <div className="text-center">
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-2">Call us directly at:</p>
                <a 
                  href="tel:512-xxx-xxxx" 
                  className="text-4xl md:text-5xl font-bold text-primary hover:text-primary/80 transition-colors block mb-4"
                >
                  (512) XXX-XXXX
                </a>
                <p className="text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM CST
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Call Instead of Using Our Online Form?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                For property portfolios of 3+ properties, our concierge service delivers superior results 
                through personalized attention and bulk processing advantages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl bg-card/50 border border-primary/10 hover:bg-card/70 transition-all duration-300">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Dedicated Specialist</h3>
                <p className="text-muted-foreground">
                  Work with a single, experienced specialist who understands your entire portfolio and can identify patterns across properties.
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-card/50 border border-primary/10 hover:bg-card/70 transition-all duration-300">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Bulk Discounts</h3>
                <p className="text-muted-foreground">
                  Special pricing for multiple properties that can significantly reduce your per-property costs and maximize overall savings.
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-card/50 border border-primary/10 hover:bg-card/70 transition-all duration-300">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">Streamlined Process</h3>
                <p className="text-muted-foreground">
                  Handle all properties simultaneously with coordinated filings, unified reporting, and simplified documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What to Expect When You Call
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-6 bg-card rounded-xl border border-primary/10">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Portfolio Assessment</h3>
                  <p className="text-muted-foreground">
                    We'll review all your properties to identify the best candidates for tax protests and estimate your total potential savings.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-card rounded-xl border border-primary/10">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Custom Strategy</h3>
                  <p className="text-muted-foreground">
                    Our specialist will create a tailored approach for your portfolio, including timeline, documentation needs, and expected outcomes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-card rounded-xl border border-primary/10">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Concierge Onboarding</h3>
                  <p className="text-muted-foreground">
                    We handle all the paperwork, documentation, and filing processes. You'll receive regular updates throughout the process.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-primary/20">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  Ready to Get Started?
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Call now to speak with a property tax specialist and discover how much you could save across your entire portfolio.
                </p>
                <a 
                  href="tel:512-xxx-xxxx"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-md font-semibold text-lg shadow-card hover:shadow-hero transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Phone className="h-5 w-5" />
                  Call (512) XXX-XXXX
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MultiPropertyContact;
