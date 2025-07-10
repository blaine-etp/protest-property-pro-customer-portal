import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ProcessSection } from "@/components/ProcessSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen">
      {!showForm && <Header />}
      <main>
        <HeroSection showForm={showForm} setShowForm={setShowForm} />
        {!showForm && (
          <>
            <BenefitsSection />
            <ProcessSection />
            <TestimonialsSection />
            <CTASection />
          </>
        )}
      </main>
      {!showForm && <Footer />}
    </div>
  );
};

export default Index;
