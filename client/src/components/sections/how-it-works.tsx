import { Check } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Analyze",
    description: "Our AI analyzes your style preferences, body measurements, lifestyle, and budget to understand your unique fashion DNA.",
    features: [
      "Upload photos or take style quiz",
      "Input body measurements",
      "Set style preferences & budget"
    ],
    image: "/images/style-analysis-professional.svg",
    alt: "Your Style DNA Profile showing personalized style analysis"
  },
  {
    number: 2,
    title: "Digitize",
    description: "Scan your existing wardrobe or browse our curated selection. AURAA creates a digital twin of your closet.",
    features: [
      "Scan existing clothes with camera",
      "Auto-categorize and tag items",
      "Create digital wardrobe inventory"
    ],
    image: "/images/wardrobe.png",
    alt: "Curated wardrobe with clothing items hanging on a rod - beige, brown, floral, and green garments"
  },
  {
    number: 3,
    title: "Style",
    description: "Get personalized outfit recommendations, virtual try-ons, and style advice tailored specifically for you.",
    features: [
      "Daily outfit recommendations",
      "Virtual try-on with AR",
      "Shop suggestions & styling tips"
    ],
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    alt: "Woman using fashion styling app on smartphone"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            How <span className="gradient-text">AURAA</span> Works
          </h2>
          <p className="text-xl text-slate">Three simple steps to transform your style</p>
        </div>
        
        {steps.map((step, index) => (
          <div key={index} className={`flex flex-col lg:flex-row items-center mb-20 ${
            index % 2 === 1 ? 'lg:flex-row-reverse' : ''
          }`}>
            <div className={`lg:w-1/2 mb-8 lg:mb-0 scroll-reveal ${
              index % 2 === 1 ? 'lg:pl-12' : 'lg:pr-12'
            }`}>
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 ${
                  step.number % 2 === 1 ? 'bg-gradient-blue-teal' : 'bg-gradient-purple-pink'
                } rounded-full flex items-center justify-center text-white font-bold text-xl mr-4`}>
                  {step.number}
                </div>
                <h3 className="text-3xl font-bold text-navy">{step.title}</h3>
              </div>
              <p className="text-lg text-slate mb-6">
                {step.description}
              </p>
              <ul className="space-y-3 text-slate">
                {step.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 scroll-reveal">
              <img 
                src={step.image}
                alt={step.alt}
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
