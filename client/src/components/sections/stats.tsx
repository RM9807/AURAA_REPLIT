import { useCounterAnimation } from "@/hooks/use-counter-animation";

const stats = [
  { value: 10000, suffix: "+", label: "Happy Users" },
  { value: 95, suffix: "%", label: "Satisfaction Rate" },
  { value: 50, suffix: "min", label: "Time Saved Daily" },
  { value: 500, suffix: "+", label: "Brand Partners" }
];

export default function Stats() {
  const { counters, startCounting } = useCounterAnimation(stats);

  return (
    <section className="py-20 bg-navy relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center scroll-reveal" ref={(el) => {
              if (el) {
                const observer = new IntersectionObserver(
                  (entries) => {
                    if (entries[0].isIntersecting) {
                      startCounting(index);
                      observer.disconnect();
                    }
                  },
                  { threshold: 0.5 }
                );
                observer.observe(el);
              }
            }}>
              <div className="text-5xl font-bold gradient-text mb-2">
                {counters[index]?.toLocaleString() || 0}{stat.suffix}
              </div>
              <p className="text-xl text-white">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-blue-teal rounded-full opacity-10 floating"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-purple-pink rounded-full opacity-10 floating" style={{animationDelay: '-4s'}}></div>
    </section>
  );
}
