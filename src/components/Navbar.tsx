import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useNavigation } from '@/App';
import Logo from '@/components/brand/Logo';
import Icon from '@/components/ui/Icon';
import { iconPaths } from '@/components/ui/iconPaths';
import ProfileImage from '@/components/ui/ProfileImage';

const Link: React.FC<{ href: string; className?: string; onClick?: () => void; children: React.ReactNode }> = ({ href, className, children, onClick }) => {
  const { navigate } = useNavigation();
  return (
    <a 
      href={href} 
      className={className} 
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
};

const Navbar: React.FC<{ currentPath: string }> = ({ currentPath }) => {
  const { user, provider, logout, isLoading } = useAuth();
  const { navigate } = useNavigation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navbarRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);

  // Determine if we are on a page with a dark header (Provider Profile, Exchange)
  const isDarkHeaderPage = currentPath.startsWith('#/provider/') || currentPath.startsWith('#/exchange');
  // Active Dark Mode is true only when on a dark page AND not scrolled (transparent background)
  const isDarkMode = isDarkHeaderPage && !scrolled;

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [currentPath]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = (e?: any) => {
      // Robust scroll detection for all browsers/configurations
      const target = e?.target || document.documentElement;
      const scrollTop = window.pageYOffset || 
                        document.documentElement.scrollTop || 
                        document.body.scrollTop || 
                        (target === document ? 0 : target.scrollTop) ||
                        window.scrollY ||
                        0;
      
      const isScrolled = scrollTop > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    // Listen on window and body to cover all scroll configurations
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.body.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.body.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('touchmove', handleScroll);
    };
  }, [scrolled]);

  // Handle Search Input Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const navItems: any[] = [
    {
      label: 'Find Care',
      id: 'care',
      gradient: 'from-brand-500 to-brand-600',
      items: [
        { label: 'Provider Directory', href: '#/directory', icon: 'clinic', desc: 'Browse all verified providers', badge: 'New' },
        { label: 'Search Providers', href: '#/search', icon: 'search', desc: 'Filter by specialty, location & more' },
        { label: 'Provider Map', href: '#/search-map', icon: 'map', desc: 'Find clinicians near you' },
      ],
    },
    {
      label: 'Resources',
      id: 'resources',
      gradient: 'from-blue-500 to-blue-600',
      items: [
        { label: 'Wellness Blog', href: '#/blog', icon: 'blog', desc: 'Articles & clinical guides' },
        { label: 'Podcasts', href: '#/podcasts', icon: 'podcast', desc: 'Listen to expert conversations' },
        { label: 'Branding & Guidelines', href: '#/docs', icon: 'folder', desc: 'Design system & assets' },
      ],
    },
    {
      label: 'About',
      id: 'about',
      gradient: 'from-slate-700 to-slate-900',
      items: [
        { label: 'Our Story', href: '#/about', icon: 'info', desc: 'Mission, values & team' },
        { label: 'Careers', href: '#/careers', icon: 'star', desc: 'Open positions' },
        { label: 'Contact', href: '#/contact', icon: 'chat', desc: 'Get in touch' },
      ],
    },
    {
      label: 'Ecosystem',
      id: 'ecosystem',
      gradient: 'from-indigo-500 to-violet-600',
      items: [
        { label: 'For Partners', href: '#/partners', icon: 'partners', desc: 'B2B & strategic alliances' },
        { label: 'For Investors', href: '#/investors', icon: 'star', desc: 'Investment thesis & strategy' },
        { label: 'Provider Exchange', href: '#/exchange', icon: 'folder', desc: 'Tools & digital resources' },
      ],
    },
    {
      label: 'For Providers',
      id: 'providers',
      gradient: 'from-slate-800 to-black',
      items: [
        { label: 'Why EvoWell', href: '#/benefits', icon: 'star', desc: 'Platform benefits & pricing' },
        { label: 'Onboarding Guide', href: '#/provider-guide', icon: 'map', desc: 'Step-by-step walkthrough' },
        { label: 'ROI Calculator', href: '#/calculator', icon: 'dollar', desc: 'Estimate your earnings' },
      ],
    },
  ];

  const getUserActions = () => {
    switch (user?.role) {
      case 'PROVIDER':
        return [
          { label: 'My Console', href: '#/console', icon: 'dashboard' },
          { label: 'View Public Profile', href: `#/provider/${provider?.id}`, icon: 'user' },
          { label: 'Settings', href: '#/console/settings', icon: 'settings' },
        ];
      case 'CLIENT':
        return [
          { label: 'My Health Portal', href: '#/portal', icon: 'heart' },
          { label: 'Bookings', href: '#/portal/sessions', icon: 'calendar' },
          { label: 'Settings', href: '#/portal/settings', icon: 'settings' },
        ];
      case 'ADMIN':
        return [
          { label: 'Admin Panel', href: '#/admin', icon: 'shield' },
          { label: 'System Stats', href: '#/admin', icon: 'chart' },
        ];
      default:
        return [];
    }
  };

  const userQuickActions = getUserActions();

  const toggleMobileDropdown = (id: string) => {
    setExpandedMobileItem(expandedMobileItem === id ? null : id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`#/search?query=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const textColorClass = isDarkMode ? 'text-white/90 hover:text-white focus-visible:text-white' : 'text-slate-600 hover:text-slate-900 focus-visible:text-slate-900';
  const logoVariant = isDarkMode ? 'white' : 'color';
  const mobileToggleClass = isDarkMode ? 'text-white' : 'text-slate-800';

  return (
    <>
      {showSearch && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[200] animate-in fade-in duration-200">
          <div className="max-w-4xl mx-auto pt-32 px-6">
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white text-2xl font-bold tracking-tight">Search EvoWell</h3>
                <button 
                  onClick={() => setShowSearch(false)}
                  className="text-white/50 hover:text-white p-2 transition-colors rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  aria-label="Close search"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Providers, specialties, or topics..."
                  className="w-full bg-white text-slate-900 rounded-2xl py-6 px-8 text-xl placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/50 shadow-2xl font-bold"
                  autoFocus
                />
                <button 
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-500 text-white rounded-xl flex items-center justify-center hover:bg-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                  aria-label="Submit search"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
              
              <div className="mt-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Popular Tags</p>
                <div className="flex flex-wrap gap-3">
                  {['Anxiety', 'Depression', 'Therapy', 'Sleep', 'Nutrition', 'Coaching'].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setSearchQuery(topic);
                      }}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 px-4 text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav 
        ref={navbarRef}
        className={`fixed top-0 inset-x-0 z-[500] transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-lg h-16' 
            : 'bg-white border-b border-slate-100 md:bg-transparent md:border-transparent h-16 md:h-20'
        }`}
        aria-label="Main Navigation"
      >
        <div className="max-w-[1440px] mx-auto px-6 h-full relative">
          <div className="relative flex justify-between items-center h-full">
            <div className="flex-shrink-0 z-20 flex items-center">
              <Link href="#/" className="flex items-center gap-2 group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg p-1">
                <Logo variant={logoVariant} className={`transition-all duration-300 ${scrolled ? 'h-8' : 'h-9'}`} />
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {navItems.map((item) => (
                <div 
                  key={item.label} 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.id || item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.href ? (
                    <Link 
                      href={item.href} 
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${textColorClass} ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button 
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-200 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                        activeDropdown === item.id 
                          ? 'bg-slate-100 text-slate-900'
                          : `${textColorClass} ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`
                      }`}
                      aria-expanded={activeDropdown === item.id}
                    >
                      {item.label}
                      <svg className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === item.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}

                  {item.items && activeDropdown === item.id && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-max animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 overflow-hidden p-2 min-w-[320px]">
                        <div className={`h-1.5 w-20 mx-auto rounded-full bg-gradient-to-r ${item.gradient} mb-2 opacity-50`}></div>
                        <div className="p-2 grid gap-1">
                          {item.items.map((sub: any) => (
                            <Link 
                              key={sub.label} 
                              href={sub.href} 
                              className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group/item focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                                <Icon path={iconPaths[sub.icon as keyof typeof iconPaths]} size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-900">{sub.label}</p>
                                  {sub.badge && <span className="text-[11px] font-black bg-brand-500 text-white px-1.5 py-0.5 rounded-md">{sub.badge}</span>}
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">{sub.desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3 z-20">
              {isLoading ? (
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="w-20 h-9 bg-slate-200/50 rounded-lg"></div>
                  <div className="w-28 h-10 bg-slate-200/50 rounded-full"></div>
                </div>
              ) : !user ? (
                <div className="flex items-center gap-3">
                  <Link href="#/login" className={`p-2 transition-colors rounded-full border border-slate-200 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${textColorClass}`} aria-label="Log In">
                    <Icon path={iconPaths.user} size={20} />
                  </Link>
                  <Link 
                    href="#/login?join=true" 
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                      isDarkMode 
                        ? 'bg-white text-brand-600 hover:bg-brand-50'
                        : 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/20'
                    }`}
                  >
                    Join as Provider
                  </Link>
                </div>
              ) : (
                <div className="relative group/user" onMouseEnter={() => handleMouseEnter('user')} onMouseLeave={handleMouseLeave}>
                  <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                    <span className="text-xs font-bold text-slate-700 pl-2">{user.firstName}</span>
                    <ProfileImage src={provider?.imageUrl} alt={`${user.firstName} ${user.lastName}`} className="w-8 h-8 rounded-full" />
                  </button>

                  {activeDropdown === 'user' && (
                    <div className="absolute right-0 top-full pt-2 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-50 mb-1">
                          <p className="text-xs font-bold text-slate-900">{user.email}</p>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{user.role}</p>
                        </div>
                        {userQuickActions.map(action => (
                          <Link 
                            key={action.label} 
                            href={action.href}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Icon path={iconPaths[action.icon as keyof typeof iconPaths]} size={18} className="text-slate-400" />
                            {action.label}
                          </Link>
                        ))}
                        <div className="border-t border-slate-50 mt-1 pt-1">
                          <button 
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 text-sm font-bold text-red-600 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-4 z-20">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className={`p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg ${mobileToggleClass}`}
                aria-label="Open mobile menu"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[900]">
            {/* Background overlay */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu panel */}
            <div className="absolute inset-y-0 right-0 w-full max-sm bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                  <Logo variant="color" className="h-8" />
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    aria-label="Close mobile menu"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="flex gap-2 mb-6">
                    <Link
                      href="#/directory"
                      className="flex-1 py-3 text-center rounded-xl bg-brand-50 text-brand-700 text-sm font-bold border border-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Directory
                    </Link>
                    <Link
                      href="#/search"
                      className="flex-1 py-3 text-center rounded-xl bg-slate-50 text-slate-700 text-sm font-bold border border-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Search
                    </Link>
                  </div>

                  <div className="space-y-6">
                    {navItems.map((item) => (
                      <div key={item.label}>
                        {item.items ? (
                          <div>
                            <button 
                              onClick={() => toggleMobileDropdown(item.id || item.label)}
                              className="flex items-center justify-between w-full text-lg font-bold text-slate-900 mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset rounded-lg p-1"
                            >
                              {item.label}
                              <svg className={`w-5 h-5 transition-transform ${expandedMobileItem === (item.id || item.label) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {expandedMobileItem === (item.id || item.label) && (
                              <div className="pl-4 space-y-3 border-l-2 border-slate-100 ml-1">
                                {item.items.map((sub: any) => (
                                  <Link 
                                    key={sub.label} 
                                    href={sub.href} 
                                    className="flex items-center justify-between text-sm font-medium text-slate-600 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset rounded-lg px-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {sub.label}
                                    {sub.badge && <span className="text-[10px] font-bold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">{sub.badge}</span>}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link 
                            href={item.href!} 
                            className="block text-lg font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset rounded-lg p-1"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-100 space-y-4">
                    {!user ? (
                      <>
                        <Link href="#/login" className="block w-full py-3 text-center rounded-xl bg-slate-100 font-bold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                        <Link href="#/login?join=true" className="block w-full py-3 text-center rounded-xl bg-slate-900 text-white font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2" onClick={() => setMobileMenuOpen(false)}>Provider Access</Link>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <ProfileImage src={provider?.imageUrl} alt={`${user.firstName} ${user.lastName}`} className="w-10 h-10 rounded-full" />
                          <div>
                            <p className="font-bold text-slate-900">{user.firstName}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                        <Link href="#/dashboard" className="block w-full py-3 text-center rounded-xl bg-slate-100 font-bold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                        <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full py-3 text-center rounded-xl border border-red-100 text-red-600 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">Sign Out</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
