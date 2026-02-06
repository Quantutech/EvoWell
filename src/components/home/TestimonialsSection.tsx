
import React, { useState, useEffect, useRef } from 'react';
import { Testimonial } from '../../types';

const TestimonialsSection: React.FC<{ testimonials: Testimonial[] }> = ({ testimonials }) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (testimonials.length > 0) {
      startRotation();
    }
    return () => stopRotation();
  }, [testimonials]);

  const startRotation = () => {
    stopRotation();
    intervalRef.current = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
  };

  const stopRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleClick = (index: number) => {
    setActiveTestimonial(index);
    startRotation();
  };

  return (
    <section className="py-24 bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-6 text-center reveal">
        <h2 className="text-3xl font-black text-slate-900 mb-12">Hear from Our Community</h2>
        {testimonials.length > 0 ? (
          <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 min-h-[360px] flex flex-col justify-center transition-all duration-500">
            {testimonials.map((t, idx) => (
              <div key={t.id} className={`${idx === activeTestimonial ? 'block animate-in fade-in zoom-in-95 duration-500' : 'hidden'}`}>
                <img src={t.imageUrl} className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-slate-50 shadow-sm object-cover" alt={t.author} />
                <h4 className="text-lg font-black text-slate-900">{t.author}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">{t.role}</p>
                <p className="text-xl font-medium text-slate-500 italic leading-relaxed">
                  "{t.text}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 min-h-[360px] flex items-center justify-center text-slate-400 italic">
            No testimonials available at this time.
          </div>
        )}
        
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => handleClick(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'w-8 bg-slate-800' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
