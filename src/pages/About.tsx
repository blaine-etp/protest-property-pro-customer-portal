
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Scale, MapPin, Award, Users, Clock, Star } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center mb-6">
                <Scale className="h-12 w-12 text-primary mr-4" />
                <h1 className="text-4xl font-bold text-foreground">
                  About EasyTaxProtest.com
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8">
                Texas's premier property tax protest specialists, proudly serving homeowners and businesses across the Lone Star State from our Austin headquarters.
              </p>
              <div className="flex items-center justify-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Austin, Texas</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
                  <p className="text-muted-foreground mb-6">
                    EasyTaxProtest.com is a Texas-focused property tax protest firm dedicated to helping property owners across the state reduce their property tax burden. Based in Austin, we combine local expertise with statewide reach to deliver exceptional results for our clients.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Our team of experienced professionals understands the unique challenges of Texas property taxation and the intricacies of each county's appraisal process. We don't just file protests – we craft compelling cases that get results.
                  </p>
                  <div className="flex items-center text-primary">
                    <Award className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Texas Property Tax Specialists</span>
                  </div>
                </div>
                <div className="bg-card rounded-lg p-8 border">
                  <h3 className="text-xl font-bold mb-4">Our Mission</h3>
                  <p className="text-muted-foreground mb-4">
                    To make property tax protests simple, effective, and accessible to every Texas property owner, ensuring fair assessments and maximizing tax savings.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">Expert Texas tax law knowledge</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">Personalized service for each client</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">No upfront fees - pay only when we save you money</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12">Why Choose EasyTaxProtest.com</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Texas Expertise</h3>
                    <p className="text-muted-foreground">
                      Deep understanding of Texas property tax laws and local county procedures across all 254 counties.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Proven Results</h3>
                    <p className="text-muted-foreground">
                      Thousands of successful protests and millions in tax savings for Texas property owners.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Full Service</h3>
                    <p className="text-muted-foreground">
                      We handle everything from initial assessment to hearing representation – you don't lift a finger.
                    </p>
                  </div>
                </div>
              </div>

              {/* Our Process */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12">Our Process</h2>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Property Analysis</h3>
                      <p className="text-muted-foreground">
                        We analyze your property's assessment against comparable sales and market data to identify potential savings.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Evidence Gathering</h3>
                      <p className="text-muted-foreground">
                        Our team compiles compelling evidence including comparable sales, market analysis, and property condition reports.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Protest Filing</h3>
                      <p className="text-muted-foreground">
                        We file your protest with the appropriate county appraisal district and manage all deadlines and paperwork.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      4
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Hearing Representation</h3>
                      <p className="text-muted-foreground">
                        Our experienced representatives present your case at the appraisal review board hearing to secure the best possible outcome.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center bg-card rounded-lg p-8 border">
                <h2 className="text-2xl font-bold mb-4">Ready to Reduce Your Property Taxes?</h2>
                <p className="text-muted-foreground mb-6">
                  Let our Texas property tax experts help you save money with a professional protest. No upfront fees – you only pay when we save you money.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/">Get Started Today</Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    <a href="tel:555-0123">Call (555) 012-3456</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
