import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Home, FileCheck, Gavel, CheckCircle } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Home,
    title: "Enter Your Address",
    description: "Provide your property address and we'll analyze your current tax assessment against comparable properties in your area."
  },
  {
    step: "02", 
    icon: FileCheck,
    title: "Property Analysis",
    description: "Our certified appraisers conduct a thorough review of your property and identify opportunities for tax reduction."
  },
  {
    step: "03",
    icon: Gavel,
    title: "File Your Protest",
    description: "We prepare and file all necessary paperwork with the appraisal district on your behalf before the deadline."
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "Save Money",
    description: "Once approved, enjoy reduced property taxes for years to come. You only pay our fee if we're successful."
  }
];

export const ProcessSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            How Our Process Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our streamlined 4-step process makes property tax protest simple and risk-free for homeowners.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="p-6 h-full bg-card border-border/50 hover:shadow-hero transition-all duration-300">
                <CardContent className="p-0 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-6">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  
                  <div className="text-sm font-bold text-primary mb-2">STEP {step.step}</div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center shadow-card">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};