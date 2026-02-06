
import React, { useRef, useEffect, useState } from 'react';
import { useNavigation } from '../../App';
import { ProviderProfile } from '../../types';

interface FeaturedProvider extends ProviderProfile {
  firstName: string;
  lastName: string;
}

const FeaturedProviders: React.FC<{ providers: FeaturedProvider[] }> = ({ providers }) => {
  const { navigate } = useNavigation();
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Triple the providers for a smoother infinite effect
  const tripledProviders = [...providers, ...providers, ...providers];

  const handleDirectoryNavigate = () => {
    navigate('#/directory');
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || providers.length === 0) return;

    let animationFrameId: number;
    let lastTimestamp: number | null = null;
    const speed = 0.05; // Pixels per millisecond (slow and smooth)

    const step = (timestamp: number) => {
      if (!isPaused) {
        if (lastTimestamp !== null) {
          const deltaTime = timestamp - lastTimestamp;
          
          // Use a small increment and track fractional pixels for ultra-smooth movement
          const increment = speed * deltaTime;
          scrollContainer.scrollLeft += increment;

          // Seamless loop check
          // We use the scrollWidth of one set of items to ensure accuracy
          // gap is 32px (gap-8), card is 320px. 
          // However, scrollWidth/3 is more reliable for dynamic content
          const totalScrollWidth = scrollContainer.scrollWidth;
          const oneSetWidth = totalScrollWidth / 3;
          
          if (scrollContainer.scrollLeft >= oneSetWidth * 2) {
            scrollContainer.scrollLeft -= oneSetWidth;
          } else if (scrollContainer.scrollLeft <= 0) {
            scrollContainer.scrollLeft += oneSetWidth;
          }
        }
        lastTimestamp = timestamp;
      } else {
        lastTimestamp = null;
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [providers.length, isPaused]);

  const manualScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 360;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="py-24 mt-20 bg-[#F8FAFC] border-y border-slate-100 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-[1440px] mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <p className="text-brand-500 text-xs font-bold uppercase tracking-widest mb-4">Our Network</p>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Real People. Real Support.</h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl">Meet our verified providers: Care from licensed therapists, coaches, and nutritionists dedicated to your growth.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => manualScroll('left')} className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-brand-500 hover:border-brand-500 hover:shadow-lg transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={() => manualScroll('right')} className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-brand-500 hover:border-brand-500 hover:shadow-lg transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>

        {providers.length === 0 ? (
           <div className="py-20 text-center">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Discovering new wellness experts...</p>
           </div>
        ) : (
        <div className="relative group/container">
        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto pb-12 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Static Spacer for the sticky card at the beginning */}
          <div className="min-w-[320px] hidden lg:block"></div>

          {tripledProviders.map((p, idx) => (
            <div 
              key={`${p.id}-${idx}`} 
              onClick={() => navigate(`#/provider/${p.id}`)}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative min-w-[320px] h-[450px] bg-white rounded-3xl overflow-hidden cursor-pointer group shadow-xl hover:shadow-2xl border border-slate-100 hover:border-brand-100 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 h-[62%] overflow-hidden">
                <img src={p.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Dr. ${p.lastName}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90"></div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-[52%] bg-white p-8 pb-14 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-500 bg-brand-50 px-2.5 py-1 rounded-lg">{p.professionalTitle.split(' ')[0]}</p>
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span className="text-[9px] font-black uppercase tracking-wider">Verified</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">Dr. {p.firstName} {p.lastName}</h3>
                  <p className="text-[12px] font-bold text-slate-400 line-clamp-2 leading-relaxed italic">"{p.tagline}"</p>
                </div>
                
                <div className="pt-6 border-t border-slate-50 flex items-center gap-2.5 text-slate-500">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{p.address?.state || 'Nationwide'}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Static Spacer for the sticky card at the end */}
          <div className="min-w-[320px] hidden lg:block"></div>
        </div>

        {/* Sticky Directory Card */}
        <div 
          onClick={handleDirectoryNavigate}
          className="absolute left-0 top-0 min-w-[320px] h-[450px] bg-[#F8FAFC] z-20 hidden lg:flex pr-8 items-start"
        >
          <div className="w-full h-full bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl overflow-hidden cursor-pointer group shadow-2xl flex flex-col items-center justify-center text-center p-8 border border-brand-400/20 hover:shadow-brand-500/20 transition-all duration-500">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform shadow-inner">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10l2 2 4-4" /></svg>
          </div>
            <h3 className="text-3xl font-black text-white mb-6 relative z-10 tracking-tight">Discover<br/>More Experts</h3>
            <button className="bg-white text-brand-600 px-8 py-3 rounded-xl font-bold text-sm shadow-xl group-hover:scale-105 transition-all relative z-10">
              Browse Directory
            </button>
          </div>
        </div>

        {/* Mobile Fallback for the Directory Card (at the end of the scroll) */}
        <div className="lg:hidden px-6 mt-4">
          <div 
            onClick={handleDirectoryNavigate}
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-3xl p-8 text-center relative overflow-hidden shadow-lg shadow-brand-500/20"
          >
            <h3 className="text-2xl font-black text-white mb-4 relative z-10">Browse Full Directory</h3>
            <button className="bg-white text-brand-600 px-8 py-3 rounded-xl font-bold text-sm relative z-10 w-full shadow-md">View All Providers</button>
          </div>
        </div>
        </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProviders;
