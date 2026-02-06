
import React, { useState } from 'react';
import { useAuth, useNavigation } from '../App';
import Logo from './brand/Logo';
import { useRealtimeNotifications } from '../hooks/useRealtime';

const DashboardNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  
  // Realtime Hook
  const { notifications, unreadCount, markAsRead, markAllRead } = useRealtimeNotifications(user?.id || null);

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    if (notif.link) navigate(`#${notif.link}`);
    setShowNotifMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 h-20 shadow-sm">
      <div className="h-full px-6 lg:px-10 flex justify-between items-center max-w-[1920px] mx-auto">
        <div className="flex items-center gap-12">
          <div className="cursor-pointer flex items-center gap-2" onClick={() => navigate('#/dashboard')}>
            <Logo className="h-8" />
            <span className="hidden lg:inline-block bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
              {user?.role === 'PROVIDER' ? 'Expert Console' : user?.role === 'ADMIN' ? 'Admin OS' : 'Patient Portal'}
            </span>
          </div>
          <button onClick={() => navigate('#/')} className="hidden lg:flex items-center gap-2 text-slate-400 hover:text-brand-500 transition-colors text-xs font-bold uppercase tracking-widest group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Public Site
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => navigate('#/contact')} className="hidden md:flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             <span className="text-[10px] font-bold uppercase tracking-widest">Support</span>
          </button>

          <div className="w-px h-8 bg-slate-100 hidden md:block"></div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-400 hover:text-brand-500 transition-colors"
            >
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
               {unreadCount > 0 && (
                 <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white animate-pulse">
                   {unreadCount > 9 ? '9+' : unreadCount}
                 </div>
               )}
            </button>

            {showNotifMenu && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                   <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</p>
                   {unreadCount > 0 && (
                     <button onClick={markAllRead} className="text-[9px] font-bold text-brand-600 hover:underline">Mark all read</button>
                   )}
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                   {notifications.length === 0 ? (
                     <div className="p-8 text-center text-slate-400 text-xs">No recent notifications.</div>
                   ) : (
                     notifications.map(n => (
                       <button 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                       >
                          <div className="flex justify-between items-start mb-1">
                             <span className={`text-xs font-bold ${!n.is_read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</span>
                             <span className="text-[9px] text-slate-400">{new Date(n.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                       </button>
                     ))
                   )}
                </div>
                <div className="p-3 border-t border-slate-50 text-center">
                   <button onClick={() => { setShowNotifMenu(false); navigate('#/notifications'); }} className="text-[10px] font-black text-slate-400 hover:text-brand-600 uppercase tracking-widest">View History</button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
             <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-all">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role}</p>
                </div>
                <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
                   {user?.firstName.charAt(0)}
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
             </button>

             {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                   <div className="p-4 border-b border-slate-50">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
                   </div>
                   <div className="p-2">
                      <button onClick={() => { setShowUserMenu(false); navigate('#/dashboard'); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors flex items-center gap-3">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                         Dashboard
                      </button>
                      <button onClick={() => { setShowUserMenu(false); navigate('#/contact'); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors flex items-center gap-3">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                         Help & Support
                      </button>
                   </div>
                   <div className="p-2 border-t border-slate-50">
                      <button onClick={logout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                         Sign Out
                      </button>
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
