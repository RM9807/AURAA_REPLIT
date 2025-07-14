import Hero from "@/components/sections/hero";
import Features from "@/components/sections/features";
import HowItWorks from "@/components/sections/how-it-works";
import BeforeAfter from "@/components/sections/before-after";
import Stats from "@/components/sections/stats";
import FAQ from "@/components/sections/faq";
import FinalCTA from "@/components/sections/final-cta";
import Footer from "@/components/sections/footer";
import Navigation from "@/components/ui/nav";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <BeforeAfter />
      <Stats />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}