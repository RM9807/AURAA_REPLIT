import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const revealOnScroll = () => {
      const reveals = document.querySelectorAll('.scroll-reveal');
      
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add('revealed');
        }
      }
    };

    // Initial check
    revealOnScroll();

    window.addEventListener('scroll', revealOnScroll);
    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);
}
