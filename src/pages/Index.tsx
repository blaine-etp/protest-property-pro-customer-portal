import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ProcessSection } from "@/components/ProcessSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [formAddress, setFormAddress] = useState("");
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('access_token') || hash.includes('type=recovery')) {
      navigate('/auth/callback', { replace: true });
    }
  }, [navigate]);

  const handleStartFlow = (address: string) => {
    setFormAddress(address);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen">
      {!showForm && <Header />}
      <main>
        <HeroSection 
          showForm={showForm} 
          setShowForm={setShowForm} 
          referralCode={referralCode}
          initialAddress={formAddress}
        />
        {!showForm && (
          <>
            <TestimonialsSection />
            <BenefitsSection />
            <ProcessSection />
            <CTASection onStartFlow={handleStartFlow} />
          </>
        )}
      </main>
      {!showForm && <Footer />}
    </div>
  );
};

export default Index;
