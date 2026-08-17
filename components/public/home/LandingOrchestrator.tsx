import HeroSection from "./sections/HeroSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import SocialProofSection from "./sections/SocialProofSection";
import EditorDemoSection from "./sections/EditorDemoSection";
import FeaturesSection from "./sections/FeaturesSection";
import CtaBannerSection from "./sections/CtaBannerSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import PricingSection from "./sections/PricingSection";
import FinalCtaSection from "./sections/FinalCtaSection";

const LandingOrchestrator = () => {
  return (
    <main className="bg-slate-50 text-slate-900">
      <HeroSection />
      <HowItWorksSection />
      <SocialProofSection />
      <EditorDemoSection />
      <FeaturesSection />
      <CtaBannerSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCtaSection />
    </main>
  );
};

export default LandingOrchestrator;
