import React, { useEffect, useRef } from 'react';
import { useNavigation } from '@/App';
import Logo from '@/components/brand/Logo';
import { designSystem } from '@/styles/design-system';

interface FooterLinkItem {
  label: string;
  href: string;
}

interface FooterLinkGroup {
  title: string;
  links: FooterLinkItem[];
}

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

const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Home', href: '#/' },
      { label: 'Find Care', href: '#/search' },
      { label: 'Provider Exchange', href: '#/exchange' },
      { label: 'For Providers', href: '#/benefits' },
      { label: 'Pricing', href: '#/calculator' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#/about' },
      { label: 'Partnerships', href: '#/partners' },
      { label: 'Contact', href: '#/contact' },
      { label: 'Careers', href: '#/careers' },
      { label: 'Investors', href: '#/investors' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', href: '#/faq' },
      { label: 'Help Center', href: '#/help' },
      { label: 'Trust & Safety / Content Policy', href: '#/docs' },
      { label: 'Report an issue', href: '#/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#/privacy' },
      { label: 'Terms of Service', href: '#/terms' },
      { label: 'Cookie Policy', href: '#/privacy' },
      { label: 'Disclaimer', href: '#/terms' },
    ],
  },
];

const Footer: React.FC = () => {
  const { navigate } = useNavigation();
  const footerRef = useRef<HTMLDivElement>(null);
  
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
  
  return (
    <div ref={footerRef} className="opacity-0 translate-y-20 transition-all duration-1000 ease-out">
      <footer className="relative mt-16 md:mt-24 lg:mt-40">
        <div className="bg-gradient-to-b from-[#0f311c] to-[#0b2717] pt-12 pb-12 text-white relative overflow-hidden">
          {/* Subtle Background Texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="max-w-[1440px] mx-auto px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-10 items-center">
              <div className="text-center lg:text-left">
                <h2 className={`${designSystem.typography.h2} mb-4 text-white`}>
                  Built for trust. Designed for ease.
                </h2>
                <p className="text-white/75 text-sm md:text-base max-w-2xl font-medium mx-auto lg:mx-0">
                  Updates for providers and people seeking support.
                </p>
              </div>

              <div className="flex justify-center lg:justify-end py-2">
                  <button 
                    className="relative group cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-900 rounded-full" 
                    onClick={() => navigate('#/')}
                    aria-label="Return to Home"
                  >
                    {/* Subtle glow behind */}
                    <div className="absolute inset-0 bg-brand-500/20 blur-[40px] md:blur-[60px] rounded-full"></div>
                    
                    {/* Ripple Rings */}
                    <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.5] md:scale-[1.8] animate-[ping_3s_ease-in-out_infinite] opacity-20"></div>
                    <div className="absolute inset-0 border border-white/10 rounded-full scale-[1.2] md:scale-[1.4] animate-[pulse_4s_ease-in-out_infinite]"></div>
                    
                    {/* Main Circle */}
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-[#0a2215] border border-white/10 rounded-full flex items-center justify-center relative z-10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                      <Logo className="h-12 w-12 md:h-16 md:w-16" variant="white" showText={false} />
                    </div>
                  </button>
              </div>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {footerLinkGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-[11px] font-black uppercase tracking-widest text-brand-300 mb-3">
                    {group.title}
                  </p>
                  <ul className="space-y-2">
                    {group.links.map((link) => (
                      <li key={`${group.title}-${link.label}`}>
                        <Link
                          href={link.href}
                          className="text-sm text-white/75 hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-[11px] md:text-xs text-white/75 leading-relaxed font-medium">
                EvoWell provides provider discovery and practice tools. Evo is a navigation assistant and does not
                provide medical advice. For emergencies, contact local emergency services.
              </p>
              <p className="mt-2 text-[11px] md:text-xs text-white/65 leading-relaxed font-medium">
                Provider verification supports transparency, but it isn&apos;t a guarantee of outcomes.
              </p>
            </div>

            {/* Bottom Bar */}
            <div className="mt-16 md:mt-24 pt-8 border-t border-white/10 flex flex-col-reverse md:flex-row justify-between items-center gap-8">
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-widest">
                  <p className="w-full md:w-auto text-center md:text-left mb-2 md:mb-0">© 2026 EvoWell Inc.</p>
                  <Link href="#/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="#/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="#/privacy" className="hover:text-white transition-colors">Cookie Policy</Link>
              </div>

              {/* Accessible Social Icons */}
              <div className="flex gap-4">
                {[
                  {
                    name: 'LinkedIn',
                    href: 'https://www.linkedin.com',
                    tooltip: 'Follow EvoWell on LinkedIn',
                    icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 4a2 2 0 110-4 2 2 0 010 4z',
                  },
                  {
                    name: 'X',
                    href: 'https://x.com',
                    tooltip: 'Follow updates on X',
                    icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
                  },
                  {
                    name: 'Instagram',
                    href: 'https://www.instagram.com',
                    tooltip: 'Community highlights',
                    icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m0 2a3.8 3.8 0 00-3.8 3.8v8.4A3.8 3.8 0 007.8 20h8.4a3.8 3.8 0 003.8-3.8V7.8A3.8 3.8 0 0016.2 4H7.8z',
                  },
                ].map(social => (
                  <a 
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.tooltip}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-brand-600 hover:border-brand-500 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    aria-label={social.tooltip}
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
