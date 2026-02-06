
import React, { useState, useEffect } from 'react';
import { useAuth, useNavigation } from '../../App';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';
import Logo from '../brand/Logo';

interface NavItem {
  id: string;
  label: string;
  icon: string;
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
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const sidebarColor = role === 'admin' ? 'bg-[#1e293b]' : 'bg-white';
  const sidebarTextColor = role === 'admin' ? 'text-slate-400' : 'text-slate-500';
  const sidebarActiveText = role === 'admin' ? 'text-white' : 'text-white';
  const activeBg = themeColor; 

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className={`w-72 fixed top-0 bottom-0 z-30 flex flex-col justify-between hidden lg:flex shadow-2xl transition-colors ${sidebarColor} ${role !== 'admin' ? 'border-r border-slate-200' : ''}`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12" onClick={() => navigate('#/')} style={{cursor: 'pointer'}}>
             {role === 'admin' ? (
                <div className="flex items-center gap-3 text-white">
                   <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-black">E</div>
                   <span className="font-bold text-lg tracking-tight">Admin OS</span>
                </div>
             ) : (
                <Logo className="h-8" />
             )}
          </div>
          
          <nav className="space-y-2">
            {navItems.map(link => (
              <button 
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === link.id 
                    ? `${activeBg} ${sidebarActiveText} shadow-lg` 
                    : `${sidebarTextColor} hover:bg-slate-100/10 hover:text-slate-900` // Adjusted hover for dark/light capability
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} /></svg>
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className={`p-8 border-t ${role === 'admin' ? 'border-slate-700' : 'border-slate-100'}`}>
           <div className={`flex items-center gap-3 ${role === 'admin' ? 'text-white' : 'text-slate-900'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${role === 'admin' ? 'bg-slate-700' : 'bg-brand-50 text-brand-600'}`}>
                 {user.firstName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                 <p className="text-xs font-bold truncate">{user.firstName} {user.lastName}</p>
                 <button onClick={logout} className={`text-[10px] uppercase font-bold hover:underline ${role === 'admin' ? 'text-slate-400' : 'text-slate-500'}`}>Sign Out</button>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow lg:ml-72 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-20 bg-[#f8fafc]/95 backdrop-blur-sm border-b border-slate-200/50">
           <div className="flex items-center gap-4">
              <div className="lg:hidden">
                 {/* Mobile Menu Trigger Placeholder */}
                 <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 capitalize tracking-tight hidden md:block">
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
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
           {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
