import { X, Check } from "lucide-react";

export default function BeforeAfter() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Transform Your <span className="gradient-text">Wardrobe</span>
          </h2>
          <p className="text-xl text-slate">See the difference AURAA makes</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Before */}
          <div className="scroll-reveal">
            <div className="bg-gray-100 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-slate mb-6">Before AURAA</h3>
              <img 
                src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                alt="Cluttered disorganized closet"
                className="rounded-xl w-full h-64 object-cover mb-4"
              />
              <ul className="text-left space-y-3 text-slate">
                <li className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-3" />
                  Cluttered, disorganized closet
                </li>
                <li className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-3" />
                  Nothing to wear syndrome
                </li>
                <li className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-3" />
                  Impulse buying & regret
                </li>
                <li className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-3" />
                  Outdated style choices
                </li>
              </ul>
            </div>
          </div>
          
          {/* After */}
          <div className="scroll-reveal">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center relative">
              <h3 className="text-2xl font-bold text-navy mb-6">With AURAA</h3>
              <img 
                src="/images/auraa-outfit.png"
                alt="Curated outfit flatlay with hat, pink shirt, jeans, shoes, bag and sunglasses"
                className="rounded-xl w-full h-64 object-cover mb-4 floating"
              />
              <ul className="text-left space-y-3 text-navy">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Perfectly curated wardrobe
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Endless outfit combinations
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Smart shopping decisions
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Always on-trend & confident
                </li>
              </ul>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-blue-teal rounded-full opacity-60 floating"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-purple-pink rounded-full opacity-40 floating" style={{animationDelay: '-3s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
