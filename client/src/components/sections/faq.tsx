import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does AURAA analyze my style?",
    answer: "AURAA uses advanced AI algorithms to analyze your style preferences through photos, quiz responses, and past purchases. Our system considers your body type, lifestyle, color preferences, and budget to create a comprehensive style profile."
  },
  {
    question: "Is the virtual try-on feature accurate?",
    answer: "Yes! Our AR technology uses your precise measurements and body mapping to show how clothes will fit and look. The accuracy is constantly improving with each use and user feedback."
  },
  {
    question: "Can I connect my existing shopping accounts?",
    answer: "Absolutely! AURAA integrates with major retailers and shopping platforms to import your purchase history and provide seamless shopping experiences across your favorite brands."
  },
  {
    question: "How much does AURAA cost?",
    answer: "We offer a free basic plan with limited features, and premium plans starting at $9.99/month. Premium includes unlimited outfit recommendations, virtual try-on, and personalized shopping assistance."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-slate">Everything you need to know about AURAA</p>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden scroll-reveal">
              <button 
                className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-semibold text-navy">{faq.question}</span>
                <ChevronDown 
                  className={`h-5 w-5 text-slate transform transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-slate">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
