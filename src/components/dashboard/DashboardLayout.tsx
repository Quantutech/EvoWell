import React, { useState, useEffect } from 'react';
import { useAuth, useNavigation } from '@/App';
import { api } from '@/services/api';
import { User, UserRole } from '@/types';
import Logo from '@/components/brand/Logo';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  category?: string;
}

interface DashboardLayoutProps {
  user: User;
  role: 'admin' | 'provider' | 'client';
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  themeColor: string; // Tailwind class e.g., 'bg-slate-900'
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, role, navItems, activeTab, onTabChange, themeColor, headerActions, children 
}) => {
  const { logout } = useAuth();
  const { navigate } = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Poll for unread messages
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const count = await api.getUnreadCount(user.id);
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchUnread();
    const intervalId = setInterval(fetchUnread, 30000);
    return () => clearInterval(intervalId);
  }, [user]);

  const sidebarColor = role === 'admin' ? 'bg-[#0f311c]' : role === 'provider' ? 'bg-[#0f172a]' : 'bg-white';
  const sidebarTextColor = role === 'client' ? 'text-slate-500' : 'text-slate-400';
  const sidebarActiveText = 'text-white';
  const activeBg = themeColor; 
  const sidebarWidth = isCollapsed ? 'w-20' : 'w-72';

  // State for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('dashboard_sidebar_sections');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleSection = (category: string) => {
    const newState = { ...openSections, [category]: !openSections[category] };
    setOpenSections(newState);
    localStorage.setItem('dashboard_sidebar_sections', JSON.stringify(newState));
  };

  // Keyboard navigation for sections
  const handleSectionKeyDown = (e: React.KeyboardEvent, category: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSection(category);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-brand-500 selection:text-white">
      {/* Sidebar */}
      <aside className={`${sidebarWidth} fixed top-0 bottom-0 z-30 flex flex-col hidden lg:flex shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] transition-all duration-500 ${sidebarColor} ${role === 'client' ? 'border-r border-slate-200' : ''}`}>
        {/* Logo Section */}
        <div className="p-4 md:p-6 shrink-0">
          <div className="flex items-center justify-between mb-8">
             {!isCollapsed && (
               <div className="flex items-center gap-3" onClick={() => navigate('#/')} style={{cursor: 'pointer'}}>
                 {role === 'admin' ? (
                    <div className="flex items-center gap-3 text-white">
                       <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-black">E</div>
                       <span className="font-bold text-lg tracking-tight">Admin OS</span>
                    </div>
                 ) : (
                    <Logo className="h-8" variant={role === 'provider' ? 'white' : 'color'} />
                 )}
               </div>
             )}
             {isCollapsed && (
                <div className="mx-auto cursor-pointer" onClick={() => navigate('#/')}>
                   {role === 'admin' ? (
                      <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-black text-white">E</div>
                   ) : (
                      <Logo className="h-8 w-8" showText={false} variant={role === 'provider' ? 'white' : 'color'} />
                   )}
                </div>
             )}
          </div>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-grow overflow-y-auto px-4 md:px-6 custom-scrollbar">
          <nav className="space-y-6 pb-6">
            {Object.entries(navItems.reduce((acc, item) => {
                const cat = item.category || 'General';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(item);
                return acc;
            }, {} as Record<string, NavItem[]>)).map(([category, items], idx, arr) => {
                const isOpen = openSections[category] !== false; // Default to open
                return (
                    <div key={category} className="space-y-2">
                        {category !== 'General' && !isCollapsed && (
                            <button 
                                onClick={() => toggleSection(category)}
                                onKeyDown={(e) => handleSectionKeyDown(e, category)}
                                className="w-full flex items-center justify-between px-4 text-[10px] font-black uppercase tracking-widest text-left"
                            >
                                <span className={role === 'client' ? 'text-slate-400' : 'text-slate-500'}>
                                    {category}
                                </span>
                                <svg 
                                    className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${role === 'client' ? 'text-slate-300' : 'text-slate-600'}`} 
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        )}
                        {category !== 'General' && isCollapsed && idx > 0 && (
                            <div className={`mx-3 h-px ${role === 'client' ? 'bg-slate-100' : 'bg-white/5'} my-2`}></div>
                        )}
                        <div className={`space-y-1 transition-all duration-300 ${isOpen || isCollapsed ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                            {items.map(link => (
                              <button 
                                key={link.id}
                                onClick={() => onTabChange(link.id)}
                                title={isCollapsed ? link.label : ''}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                                  activeTab === link.id 
                                    ? `${activeBg} ${sidebarActiveText} shadow-xl shadow-brand-500/20 scale-[1.02]` 
                                    : `${sidebarTextColor} ${role === 'client' ? 'hover:bg-slate-50 hover:text-brand-600' : 'hover:bg-white/5 hover:text-white'}`
                                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                              >
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} /></svg>
                                {!isCollapsed && <span>{link.label}</span>}
                              </button>
                            ))}
                        </div>
                    </div>
                );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="px-4 md:px-6 pb-4 shrink-0">
           {/* Collapse Toggle Button (Bottom Position) */}
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className={`w-full flex ${isCollapsed ? 'justify-center' : 'justify-start'} mb-4 p-2 rounded-xl transition-colors ${role === 'client' ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-white/10 text-slate-500'}`}
             title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
           >
             {isCollapsed ? (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
             ) : (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
             )}
           </button>

          <button 
            onClick={() => navigate('#/')}
            title={isCollapsed ? "Back to Home" : ""}
            className={`w-full flex items-center gap-4 px-3 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${sidebarTextColor} ${role === 'client' ? 'hover:bg-slate-100/50 hover:text-slate-900' : 'hover:bg-white/10 hover:text-white'} ${isCollapsed ? 'justify-center' : ''}`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            {!isCollapsed && "Back to Home"}
          </button>
        </div>

        <div className={`p-4 md:p-6 border-t ${role === 'client' ? 'border-slate-100' : 'border-slate-700/50'}`}>
           <div className={`flex items-center gap-3 ${role === 'client' ? 'text-slate-900' : 'text-white'} ${isCollapsed ? 'justify-center' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${role === 'client' ? 'bg-brand-50 text-brand-600' : 'bg-slate-700'}`}>
                 {user.firstName.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                   <p className="text-xs font-bold truncate">{user.firstName} {user.lastName}</p>
                   <button onClick={logout} className={`text-[10px] uppercase font-bold hover:underline ${role === 'client' ? 'text-slate-500' : 'text-slate-400'}`}>Sign Out</button>
                </div>
              )}
           </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 bottom-0 w-72 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col transition-all overflow-y-auto no-scrollbar bg-white dark:bg-slate-900">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <Logo className="h-8" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <div className="p-4 flex-grow">
                <nav className="space-y-2">
                   {navItems.map(link => (
                      <button 
                        key={link.id}
                        onClick={() => { onTabChange(link.id); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                          activeTab === link.id 
                            ? `${themeColor} text-white shadow-lg` 
                            : `text-slate-500 hover:bg-slate-50`
                        }`}
                      >
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} /></svg>
                        <span>{link.label}</span>
                      </button>
                   ))}
                </nav>
             </div>
             <div className="p-6 border-t border-slate-100">
                <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign Out
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-grow ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'} transition-all duration-500 min-h-screen flex flex-col`}>
        {/* Header */}
        <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors">
                 <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h2 className="text-lg md:text-xl font-black text-slate-900 capitalize tracking-tight">
                 {activeTab.replace('-', ' ')}
              </h2>
           </div>

           <div className="flex items-center gap-6">
              {headerActions}

              <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

              {/* Notification Bell */}
              <button className="relative p-2 text-slate-400 hover:text-brand-500 transition-colors">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                 {unreadCount > 0 && (
                   <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white">
                     {unreadCount > 9 ? '9+' : unreadCount}
                   </div>
                 )}
              </button>
           </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 lg:p-12 max-w-[1440px] mx-auto w-full">
           {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;