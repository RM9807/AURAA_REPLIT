import { Dna, ShoppingBag, Sparkles, Calendar, RotateCcw, Users } from "lucide-react";

const features = [
  {
    icon: Dna,
    title: "Style DNA",
    description: "Analyze your preferences, body type, and lifestyle to create your unique style profile.",
    gradient: "bg-gradient-blue-teal"
  },
  {
    icon: ShoppingBag,
    title: "Shop Smart",
    description: "Get personalized recommendations from thousands of brands that match your style and budget.",
    gradient: "bg-gradient-purple-pink"
  },
  {
    icon: Sparkles,
    title: "Virtual Try-On",
    description: "See how outfits look on you before buying with our advanced AR technology.",
    gradient: "bg-gradient-blue-teal"
  },
  {
    icon: Calendar,
    title: "Outfit Planning",
    description: "Plan your looks for the week with weather-aware and event-appropriate suggestions.",
    gradient: "bg-gradient-purple-pink"
  },
  {
    icon: RotateCcw,
    title: "Closet Sync",
    description: "Digitize your entire wardrobe and get mix-and-match suggestions from what you own.",
    gradient: "bg-gradient-blue-teal"
  },
  {
    icon: Users,
    title: "Style Community",
    description: "Connect with fashion enthusiasts and get inspired by trending looks worldwide.",
    gradient: "bg-gradient-purple-pink"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Revolutionize Your <span className="gradient-text">Style</span>
          </h2>
          <p className="text-xl text-slate max-w-2xl mx-auto">
            AI-powered fashion intelligence that understands your unique style DNA
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl hover-lift scroll-reveal border border-gray-100 shadow-lg">
              <div className={`w-16 h-16 ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-4">{feature.title}</h3>
              <p className="text-slate">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
