import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock, DollarSign, FileText, Users, Award } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "No Upfront Fees",
    description: "You only pay when we successfully reduce your property taxes. No risk to you."
  },
  {
    icon: Shield,
    title: "100% Guarantee",
    description: "If we don't reduce your taxes, you pay nothing. It's that simple."
  },
  {
    icon: Clock,
    title: "Fast Process",
    description: "Most protests are completed within 30-60 days. We handle everything for you."
  },
  {
    icon: FileText,
    title: "Expert Analysis",
    description: "Professional appraisers review your property and build a strong case."
  },
  {
    icon: Users,
    title: "Experienced Team",
    description: "Over 15 years of experience in property tax law and appeals."
  },
  {
    icon: Award,
    title: "Proven Results",
    description: "95% success rate with average savings of $2,500 per property."
  }
];

export const BenefitsSection = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Why Choose Our Property Tax Protest Services?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We've helped thousands of property owners reduce their tax burden with our proven process and expert team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-hero transition-all duration-300 transform hover:-translate-y-1 border-border/50"
            >
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-gradient-primary rounded-lg">
                    <benefit.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};