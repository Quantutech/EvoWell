import React, { useEffect, useState } from 'react';
import { useAuth, useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import { notificationService } from '../services/notifications';
import { Notification } from '../types';
import { Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, CardBody } from '../components/ui';

const NotificationsView: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    if (user) {
      const data = await notificationService.getNotifications(user.id, 50);
      setNotifications(data);
    }
    setLoading(false);
  };

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleDelete = async (id: string) => {
    await notificationService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Breadcrumb items={[{ label: 'Dashboard', href: '#/dashboard' }, { label: 'Notifications' }]} />

      <Section spacing="sm">
        <Container size="narrow">
          <div className="flex justify-between items-center mb-8">
            <Heading level={1} size="h2">Notifications</Heading>
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>Mark all read</Button>
          </div>

          <Card variant="default" className="overflow-hidden p-0">
            {loading ? (
              <div className="p-12 text-center text-slate-400 animate-pulse font-bold text-xs uppercase tracking-widest">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <Text color="muted">You're all caught up!</Text>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-6 flex gap-4 transition-colors group ${n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/20 hover:bg-blue-50/40'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type === 'message' ? 'bg-blue-100 text-blue-600' :
                      n.type === 'appointment' ? 'bg-green-100 text-green-600' :
                      n.type === 'payment' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {n.type === 'message' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                      {n.type === 'appointment' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                      {n.type === 'payment' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      {n.type === 'system' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    </div>
                    
                    <div className="flex-grow cursor-pointer" onClick={() => { handleMarkRead(n.id); if(n.link) navigate(`#${n.link}`); }}>
                      <div className="flex justify-between items-start mb-1">
                        <Heading level={4} size="h4" className={`text-sm ${n.is_read ? 'font-normal' : 'font-bold'}`}>{n.title}</Heading>
                        <Label variant="badge" color="muted" className="ml-4 whitespace-nowrap">
                          {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </Label>
                      </div>
                      <Text variant="small" className={`${n.is_read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>{n.message}</Text>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <button 
                        onClick={() => handleDelete(n.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      {!n.is_read && (
                        <button 
                          onClick={() => handleMarkRead(n.id)}
                          className="w-3 h-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                          title="Mark as read"
                        ></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default NotificationsView;