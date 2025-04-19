
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { PricingSection } from "@/components/home/PricingSection";
import { CtaSection } from "@/components/home/CtaSection";
import { Footer } from "@/components/home/Footer";
import { NavBar } from "@/components/home/NavBar";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Handle redirect if user is already logged in
  useEffect(() => {
    if (!loading) {
      setInitialLoadComplete(true);
      
      if (user) {
        console.log("Index: User authenticated, redirecting to today");
        navigate("/today", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading state until initial check is complete
  if (loading || (user && !initialLoadComplete)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Don't render anything if user is logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavBar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Index;
