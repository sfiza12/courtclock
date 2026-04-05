import { useState, useEffect } from 'react';

const easeOutQuart = (x) => {
  return 1 - Math.pow(1 - x, 4);
};

export const useCountUp = (target, duration = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === undefined || target === null) return;

    let startTime = null;
    let animationFrame;

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      const percentage = Math.min(progress / duration, 1);
      const easedProgress = easeOutQuart(percentage);
      
      setCount(target * easedProgress);

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animateCount);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animateCount);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
};
