import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { adminService } from '@/services/admin';
import { ModerationStatus } from '@/types';

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
}

const AdminOverviewTab: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getStats(),
    refetchInterval: 30_000,
  });

  const { data: recentUsers } = useQuery({
    queryKey: ['adminOverviewUsers'],
    queryFn: () =>
      adminService.getUsers({
        page: 1,
        pageSize: 8,
        includeDeleted: true,
        status: 'ALL',
      }),
    refetchInterval: 30_000,
  });

  const { data: recentProviders } = useQuery({
    queryKey: ['adminOverviewProviders'],
    queryFn: () =>
      adminService.getProviders({
        page: 1,
        pageSize: 8,
        status: 'ALL',
      }),
    refetchInterval: 30_000,
  });

  const { data: recentAppointments = [] } = useQuery({
    queryKey: ['adminOverviewAppointments'],
    queryFn: () => api.getAllAppointments(),
    refetchInterval: 30_000,
  });

  const { data: recentTickets = [] } = useQuery({
    queryKey: ['adminOverviewTickets'],
    queryFn: () => api.getTickets(),
    refetchInterval: 30_000,
  });

  const activityItems = useMemo<ActivityItem[]>(() => {
    const userActivities: ActivityItem[] =
      recentUsers?.data.slice(0, 4).map((user) => ({
        id: `user-${user.id}`,
        title: `New ${user.role.toLowerCase()} account: ${user.firstName} ${user.lastName}`,
        subtitle: user.email,
        timestamp: user.createdAt,
      })) || [];

    const providerActivities: ActivityItem[] =
      recentProviders?.data.slice(0, 4).map((provider) => ({
        id: `provider-${provider.id}`,
        title:
          provider.moderationStatus === ModerationStatus.PENDING
            ? `Provider pending review: ${provider.firstName || ''} ${provider.lastName || ''}`.trim()
            : `Provider ${provider.moderationStatus.toLowerCase()}: ${provider.firstName || ''} ${provider.lastName || ''}`.trim(),
        subtitle: provider.professionalTitle || 'Provider profile update',
        timestamp: provider.audit?.updatedAt || provider.audit?.createdAt || new Date().toISOString(),
      })) || [];

    const appointmentActivities: ActivityItem[] = recentAppointments.slice(0, 4).map((appointment) => ({
      id: `appointment-${appointment.id}`,
      title: `Appointment ${appointment.status.toLowerCase()}`,
      subtitle: new Date(appointment.dateTime).toLocaleString(),
      timestamp: appointment.createdAt || appointment.dateTime,
    }));

    const ticketActivities: ActivityItem[] = recentTickets.slice(0, 4).map((ticket) => ({
      id: `ticket-${ticket.id}`,
      title: `Support ticket ${ticket.status.toLowerCase()}: ${ticket.subject}`,
      subtitle: ticket.message.slice(0, 80),
      timestamp: ticket.createdAt,
    }));

    return [...providerActivities, ...userActivities, ...appointmentActivities, ...ticketActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [recentUsers, recentProviders, recentAppointments, recentTickets]);

  const cards = [
    {
      label: 'Total Users',
      value: stats?.users || 0,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      color: 'bg-slate-900',
    },
    {
      label: 'Active Providers',
      value: stats?.providers || 0,
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      color: 'bg-brand-600',
    },
    {
      label: 'Open Tickets',
      value: stats?.openTickets || 0,
      icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Review',
      value: stats?.pending || 0,
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.color} bg-opacity-10 p-3 rounded-2xl`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {card.label}
            </p>
            {statsLoading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <p className="text-3xl font-black text-slate-900">{card.value.toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">
          Recent System Activity
        </h3>

        {activityItems.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm italic">
            No recent activity found.
          </div>
        ) : (
          <div className="space-y-4">
            {activityItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black truncate">
                    {item.subtitle}
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverviewTab;
