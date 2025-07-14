import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "Austin, TX",
    savings: "$3,200",
    rating: 5,
    quote: "TaxProtest Pro saved us over $3,000 on our property taxes! The process was completely hassle-free and they handled everything. Highly recommend!"
  },
  {
    name: "Mike Rodriguez", 
    location: "Dallas, TX",
    savings: "$2,800",
    rating: 5,
    quote: "I was skeptical at first, but they delivered exactly what they promised. No upfront fees and they reduced our tax bill significantly."
  },
  {
    name: "Jennifer Chen",
    location: "Houston, TX", 
    savings: "$2,100",
    rating: 5,
    quote: "Professional service from start to finish. They kept me informed throughout the process and got results. Worth every penny of their fee."
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="relative -mt-20 pt-32 pb-20 bg-gradient-to-b from-gradient-hero-start/80 via-background/60 to-background overflow-hidden">
      {/* Continuation of wave pattern from hero */}
      <div className="absolute top-0 left-0 w-full">
        <svg
          className="w-full h-32"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0 C240,16 480,32 720,16 C960,0 1200,16 1200,16 L1200,160 L0,160 Z"
            fill="var(--wave-primary)"
            className="animate-pulse opacity-25"
            style={{ animationDuration: '12s', animationDelay: '1s' }}
          />
          <path
            d="M0,0 C300,20 600,40 900,20 C1050,10 1200,20 1200,20 L1200,160 L0,160 Z"
            fill="var(--wave-secondary)"
            className="animate-pulse opacity-20"
            style={{ animationDuration: '16s', animationDelay: '3s' }}
          />
        </svg>
      </div>

      {/* Middle wave layers for continuous flow */}
      <div className="absolute top-1/3 left-0 w-full">
        <svg
          className="w-full h-24"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,40 C240,56 480,72 720,56 C960,40 1200,48 1200,48 L1200,120 L0,120 Z"
            fill="var(--wave-tertiary)"
            className="animate-pulse opacity-15"
            style={{ animationDuration: '14s', animationDelay: '2s' }}
          />
        </svg>
      </div>

      {/* Bottom wave pattern extending toward next section */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          className="w-full h-32"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,120 C200,104 400,88 600,104 C800,120 1000,136 1200,136 L1200,160 L0,160 Z"
            fill="var(--wave-primary)"
            className="animate-pulse opacity-20"
            style={{ animationDuration: '18s', animationDelay: '4s' }}
          />
          <path
            d="M0,140 C300,124 600,108 900,124 C1050,132 1200,140 1200,140 L1200,160 L0,160 Z"
            fill="var(--wave-secondary)"
            className="animate-pulse opacity-15"
            style={{ animationDuration: '20s', animationDelay: '6s' }}
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of satisfied homeowners who have successfully reduced their property taxes with our help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="p-6 bg-card/40 backdrop-blur-sm border border-primary/20 hover:bg-card/60 hover:shadow-hero transition-all duration-300 transform hover:-translate-y-2"
            >
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-primary fill-current" />
                  ))}
                </div>
                
                <div className="relative mb-6">
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/30" />
                  <p className="text-foreground/90 leading-relaxed pl-6 font-medium">
                    "{testimonial.quote}"
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{testimonial.savings}</div>
                    <div className="text-sm text-muted-foreground">Saved</div>
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