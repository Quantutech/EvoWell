
import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  target: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ target, label, prefix = "", suffix = "", className = "" }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.2 });
    
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [isVisible, target]);

  return (
    <div ref={countRef} className={`bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl text-center transform hover:-translate-y-1 transition-all duration-300 ${className}`}>
      <p className="text-4xl font-black text-brand-500 mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
};

export default AnimatedCounter;
