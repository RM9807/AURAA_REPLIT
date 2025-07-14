import { useState, useCallback } from "react";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export function useCounterAnimation(stats: StatItem[]) {
  const [counters, setCounters] = useState<number[]>(new Array(stats.length).fill(0));
  const [animated, setAnimated] = useState<boolean[]>(new Array(stats.length).fill(false));

  const startCounting = useCallback((index: number) => {
    if (animated[index]) return;

    const newAnimated = [...animated];
    newAnimated[index] = true;
    setAnimated(newAnimated);

    const target = stats[index].value;
    const increment = target / 100;
    let current = 0;
    
    const updateCounter = () => {
      if (current < target) {
        current += increment;
        setCounters(prev => {
          const newCounters = [...prev];
          newCounters[index] = Math.ceil(current);
          return newCounters;
        });
        requestAnimationFrame(updateCounter);
      } else {
        setCounters(prev => {
          const newCounters = [...prev];
          newCounters[index] = target;
          return newCounters;
        });
      }
    };
    
    updateCounter();
  }, [stats, animated]);

  return { counters, startCounting };
}
