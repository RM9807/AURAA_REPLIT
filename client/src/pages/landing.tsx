import { useEffect } from "react";
import Navigation from "@/components/ui/nav";
import Hero from "@/components/sections/hero";
import Features from "@/components/sections/features";
import HowItWorks from "@/components/sections/how-it-works";
import BeforeAfter from "@/components/sections/before-after";
import Stats from "@/components/sections/stats";
import FAQ from "@/components/sections/faq";
import UserDashboard from "@/components/sections/user-dashboard";
import FinalCTA from "@/components/sections/final-cta";
import Footer from "@/components/sections/footer";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useParallax } from "@/hooks/use-parallax";

export default function Landing() {
  useScrollReveal();
  useParallax();

  useEffect(() => {
    document.title = "AURAA - Your Personal AI Stylist | Transform Your Wardrobe Instantly";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Transform your wardrobe with AURAA, the AI-powered personal stylist. Get personalized outfit recommendations, virtual try-on, and smart shopping assistance.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Transform your wardrobe with AURAA, the AI-powered personal stylist. Get personalized outfit recommendations, virtual try-on, and smart shopping assistance.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <BeforeAfter />
      <Stats />
      <FAQ />
      <UserDashboard />
      <FinalCTA />
      <Footer />
    </div>
  );
}