import { useEffect } from "react";

export function useParallax() {
  useEffect(() => {
    const handleParallax = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-back, .parallax-mid');
      
      parallaxElements.forEach(element => {
        const speed = element.classList.contains('parallax-back') ? 0.5 : 0.7;
        const yPos = -(scrolled * speed);
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleParallax);
    return () => window.removeEventListener('scroll', handleParallax);
  }, []);
}
