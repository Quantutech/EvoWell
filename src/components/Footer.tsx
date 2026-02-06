import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@/App';
import Logo from '@/components/brand/Logo';

const Link: React.FC<{ href: string; className?: string; children: React.ReactNode }> = ({ href, className, children }) => {
  const { navigate } = useNavigation();
  return (
    <a 
      href={href} 
      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded ${className}`} 
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
};

const Footer: React.FC = () => {
  const { navigate } = useNavigation();
  const footerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Entrance Animation Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && footerRef.current) {
          footerRef.current.classList.remove('opacity-0', 'translate-y-20');
          footerRef.current.classList.add('opacity-100', 'translate-y-0');
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitted(true);
    // Simulate API call
    setTimeout(() => {
      setEmail('');
      setIsSubmitted(false);
    }, 3000);
  };
  
  return (
    <div ref={footerRef} className="opacity-0 translate-y-20 transition-all duration-1000 ease-out">
      <footer className="relative mt-40">
        {/* Curved Top */}
        <div className="absolute top-0 left-[-5%] w-[110%] overflow-hidden leading-none -translate-y-[99%] z-10 pointer-events-none">
          <svg 
            className="relative block w-full h-[80px] md:h-[120px]" 
            data-name="Layer 1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            {/* Smoother Quad Curve */}
            <path 
              d="M0,120 Q600,0 1200,120 V120 H0 Z" 
              fill="#0f311c" 
            />
          </svg>
        </div>

        <div className="bg-[#0f311c] pt-12 pb-12 text-white relative overflow-hidden">
          {/* Subtle Background Texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="max-w-[1440px] mx-auto px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              
              {/* Left: Newsletter */}
              <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
                      Join the Evolution
                    </h2>
                    <p className="text-white/70 text-base max-w-md mx-auto lg:mx-0 font-medium">
                      Weekly insights for the modern wellness professional.
                    </p>
                  </div>
                  
                  <form 
                    onSubmit={handleSubmit}
                    className="relative max-w-sm mx-auto lg:mx-0"
                  >
                    <div className="relative flex items-center">
                      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                      <input 
                        id="newsletter-email"
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@domain.com" 
                        className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400 focus:bg-white/10 focus:ring-1 focus:ring-brand-400 transition-all pr-14"
                        required
                      />
                      <button 
                        type="submit"
                        disabled={isSubmitted}
                        className="absolute right-2 p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                        aria-label="Subscribe"
                      >
                        {isSubmitted ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        )}
                      </button>
                    </div>
                    {isSubmitted && <p className="absolute mt-2 text-xs text-brand-300 font-medium animate-in fade-in">Subscribed successfully.</p>}
                  </form>
              </div>

              {/* Center: Refined Animation */}
              <div className="lg:col-span-2 flex justify-center py-10 lg:py-0">
                  <button 
                    className="relative group cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-900 rounded-full" 
                    onClick={() => navigate('#/')}
                    aria-label="Return to Home"
                  >
                    {/* Subtle glow behind */}
                    <div className="absolute inset-0 bg-brand-500/20 blur-[60px] rounded-full"></div>
                    
                    {/* Ripple Rings */}
                    <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.8] animate-[ping_3s_ease-in-out_infinite] opacity-20"></div>
                    <div className="absolute inset-0 border border-white/10 rounded-full scale-[1.4] animate-[pulse_4s_ease-in-out_infinite]"></div>
                    
                    {/* Main Circle */}
                    <div className="w-32 h-32 bg-[#0a2215] border border-white/10 rounded-full flex items-center justify-center relative z-10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                      <Logo className="h-16 w-16" variant="white" showText={false} />
                    </div>
                  </button>
              </div>

              {/* Right: Contact (Static Text) */}
              <div className="lg:col-span-5 text-center lg:text-right space-y-8">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400 mb-2">Get in touch</p>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-white tracking-tight">hello@evowell.com</p>
                      <p className="text-xl font-medium text-white/70 tracking-tight">+1 (310) 555 33 33</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-white/60 leading-relaxed font-medium">
                    123 Wellness Ave, Suite 400<br/>
                    New York, NY 10001
                  </div>
              </div>

            </div>

            {/* Bottom Bar */}
            <div className="mt-24 pt-8 border-t border-white/10 flex flex-col-reverse md:flex-row justify-between items-center gap-8">
              
              <div className="flex gap-8 text-xs font-bold text-white/60 uppercase tracking-widest">
                  <p>© 2026 EvoWell Inc.</p>
                  <Link href="#/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="#/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="#/investors" className="hover:text-white transition-colors">Investors</Link>
                  <Link href="#/careers" className="hover:text-white transition-colors">Careers</Link>
              </div>

              {/* Accessible Social Icons */}
              <div className="flex gap-4">
                {[
                  { name: 'LinkedIn', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 4a2 2 0 110-4 2 2 0 010 4z' },
                  { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                  { name: 'Instagram', icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m0 2a3.8 3.8 0 00-3.8 3.8v8.4A3.8 3.8 0 007.8 20h8.4a3.8 3.8 0 003.8-3.8V7.8A3.8 3.8 0 0016.2 4H7.8z' },
                ].map(social => (
                  <a 
                    key={social.name}
                    href="#" 
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-brand-600 hover:border-brand-500 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;