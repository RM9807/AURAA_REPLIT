import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="scroll-reveal">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Upgrade Your <span className="gradient-text">Style?</span>
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of fashion-forward individuals who've transformed their wardrobes with AI
          </p>
          <Button className="px-12 py-4 bg-gradient-purple-pink text-white text-xl font-bold rounded-xl hover-lift">
            Start Your Style Journey
          </Button>
          <p className="text-white/60 mt-4">Free 7-day trial • No credit card required</p>
        </div>
      </div>
      
      {/* Floating background elements */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-blue-teal rounded-full opacity-10 floating"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-purple-pink rounded-full opacity-10 floating" style={{animationDelay: '-2s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-pink opacity-20 rounded-full floating" style={{animationDelay: '-5s'}}></div>
    </section>
  );
}
