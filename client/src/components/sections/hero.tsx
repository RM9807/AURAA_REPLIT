import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/components/auth/AuthProvider";

export default function Hero() {
  const { showAuthModal } = useAuthModal();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Slow parallax background image */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
          alt="Fashion studio background" 
          className="w-full h-full object-cover parallax-back"
        />
      </div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <img 
          src="@assets/Aaura-3-removebg-preview_1752500886755.png" 
          alt="AURAA Logo" 
          className="h-32 w-32 mx-auto mb-8 scroll-reveal"
        />
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 scroll-reveal">
          YOUR STYLE, <span className="gradient-text">PERFECTED</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-8 scroll-reveal max-w-4xl mx-auto">
          Your personal AI stylist that transforms morning uncertainty into instant confidence. Discover your style DNA, build your perfect wardrobe, and never have "nothing to wear" again.
        </p>
        <div className="space-x-4">
          <Button 
            onClick={showAuthModal}
            className="px-8 py-4 bg-gradient-purple-pink text-white text-lg font-semibold rounded-xl hover-lift scroll-reveal"
          >
            Get Stylish Now
          </Button>
          <Button 
            variant="outline" 
            className="px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl hover-lift scroll-reveal"
            onClick={() => window.location.href = '/dashboard'}
          >
            View Dashboard
          </Button>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-blue-teal rounded-full opacity-20 floating"></div>
      <div className="absolute bottom-1/4 right-10 w-16 h-16 bg-gradient-purple-pink rounded-full opacity-30 floating" style={{animationDelay: '-2s'}}></div>
    </section>
  );
}
