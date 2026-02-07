import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, DonutChart } from '@/components/dashboard/DashboardComponents';
import { useAuth } from '@/App';
import { AppointmentStatus, ModerationStatus, UserRole } from '@/types';
import ProviderInterestedClients from '@/components/dashboard/tabs/ProviderInterestedClients';
import { api } from '@/services/api';
import { wishlistService } from '@/services/wishlist.service';

const ProviderOverview: React.FC = () => {
  const { user, provider } = useAuth();

  const { data: appointments = [] } = useQuery({
    queryKey: ['providerOverviewAppointments', user?.id],
    queryFn: () => (user ? api.getAppointmentsForUser(user.id, UserRole.PROVIDER) : []),
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const { data: providerBlogs = [] } = useQuery({
    queryKey: ['providerOverviewBlogs', provider?.id],
    queryFn: () => (provider ? api.getBlogsByProvider(provider.id) : []),
    enabled: !!provider,
    refetchInterval: 60_000,
  });

  const { data: interestedClients = [] } = useQuery({
    queryKey: ['providerOverviewInterestedClients', provider?.id],
    queryFn: () => (provider ? wishlistService.getWishlistedBy(provider.id) : []),
    enabled: !!provider,
    refetchInterval: 60_000,
  });

  const stats = useMemo(() => {
    const actionable = appointments.filter(
      (appointment) =>
        appointment.status !== AppointmentStatus.CANCELLED &&
        appointment.status !== AppointmentStatus.REJECTED,
    );

    const completed = actionable.filter(
      (appointment) =>
        appointment.status === AppointmentStatus.COMPLETED ||
        appointment.status === AppointmentStatus.PAID,
    );

    const activeClients = new Set(actionable.map((appointment) => appointment.clientId)).size;
    const completionRate =
      actionable.length > 0 ? Math.round((completed.length / actionable.length) * 100) : 0;

    const revenueCents = completed.reduce((sum, appointment) => {
      if (appointment.amountCents && appointment.amountCents > 0) {
        return sum + appointment.amountCents;
      }
      const hourlyRate = provider?.pricing?.hourlyRate || 0;
      const inferred = Math.round((hourlyRate * 100 * (appointment.durationMinutes || 60)) / 60);
      return sum + inferred;
    }, 0);

    const pendingRequests = appointments.filter(
      (appointment) => appointment.status === AppointmentStatus.PENDING,
    ).length;

    return {
      revenueCents,
      activeClients,
      completionRate,
      pendingRequests,
    };
  }, [appointments, provider]);

  const revenueData = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    const monthKeys: string[] = [];

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      monthKeys.push(`${date.getFullYear()}-${date.getMonth()}`);
    }

    const totalsByMonth = new Map<string, number>();
    for (const key of monthKeys) totalsByMonth.set(key, 0);

    for (const appointment of appointments) {
      if (
        appointment.status !== AppointmentStatus.COMPLETED &&
        appointment.status !== AppointmentStatus.PAID
      ) {
        continue;
      }

      const date = new Date(appointment.dateTime);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!totalsByMonth.has(key)) continue;

      const cents =
        appointment.amountCents && appointment.amountCents > 0
          ? appointment.amountCents
          : Math.round(
              ((provider?.pricing?.hourlyRate || 0) * 100 * (appointment.durationMinutes || 60)) / 60,
            );

      totalsByMonth.set(key, (totalsByMonth.get(key) || 0) + cents);
    }

    return labels.map((label, index) => ({
      label,
      value: Math.round((totalsByMonth.get(monthKeys[index]) || 0) / 100),
    }));
  }, [appointments, provider]);

  const patientStatusData = useMemo(() => {
    const statusCounts = {
      pending: appointments.filter((a) => a.status === AppointmentStatus.PENDING).length,
      confirmed: appointments.filter(
        (a) => a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.PAID,
      ).length,
      completed: appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length,
      cancelled: appointments.filter(
        (a) =>
          a.status === AppointmentStatus.CANCELLED || a.status === AppointmentStatus.REJECTED,
      ).length,
    };

    const total = Object.values(statusCounts).reduce((sum, value) => sum + value, 0);
    if (total === 0) return [];

    return [
      {
        label: 'Pending',
        value: Math.round((statusCounts.pending / total) * 100),
        color: '#F59E0B',
      },
      {
        label: 'Confirmed',
        value: Math.round((statusCounts.confirmed / total) * 100),
        color: '#3B82F6',
      },
      {
        label: 'Completed',
        value: Math.round((statusCounts.completed / total) * 100),
        color: '#10B981',
      },
      {
        label: 'Cancelled',
        value: Math.max(
          0,
          100 -
            Math.round((statusCounts.pending / total) * 100) -
            Math.round((statusCounts.confirmed / total) * 100) -
            Math.round((statusCounts.completed / total) * 100),
        ),
        color: '#94A3B8',
      },
    ];
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    const future = appointments
      .filter((appointment) => new Date(appointment.dateTime).getTime() > Date.now())
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    return future[0];
  }, [appointments]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-slate-500 mt-2">Here&rsquo;s what&rsquo;s happening with your practice today.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {provider?.moderationStatus === ModerationStatus.PENDING && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-800">Verification Pending</h4>
            <p className="text-xs text-amber-700 mt-1">
              Your profile is under review. You will be visible in the directory once approved.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Revenue',
            value: `$${(stats.revenueCents / 100).toLocaleString()}`,
            detail: `${appointments.length} appointments`,
            color: 'text-slate-900',
            icon: '💰',
          },
          {
            label: 'Active Patients',
            value: `${stats.activeClients}`,
            detail: `${interestedClients.length} interested`,
            color: 'text-brand-600',
            icon: '👥',
          },
          {
            label: 'Completion Rate',
            value: `${stats.completionRate}%`,
            detail: `${stats.pendingRequests} pending`,
            color: 'text-blue-600',
            icon: '📈',
          },
          {
            label: 'Published Articles',
            value: `${providerBlogs.length}`,
            detail: `${provider?.endorsements?.peerCount || 0} endorsements`,
            color: 'text-teal-600',
            icon: '🛡️',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {stat.label}
              </p>
              <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
              <p className="text-[10px] font-bold text-slate-500 mt-1">{stat.detail}</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <ProviderInterestedClients />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900">Revenue Trends</h3>
            <span className="bg-slate-50 rounded-lg text-xs font-bold px-3 py-2 text-slate-500">
              Last 6 Months
            </span>
          </div>
          {revenueData.some((item) => item.value > 0) ? (
            <BarChart data={revenueData} />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm italic">
              Revenue data will appear as sessions are completed.
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-8">Patient Status</h3>
          <div className="flex-grow flex items-center justify-center mb-4">
            {patientStatusData.length > 0 ? (
              <DonutChart data={patientStatusData} />
            ) : (
              <p className="text-slate-400 text-sm italic text-center">
                No appointment activity yet.
              </p>
            )}
          </div>
          {patientStatusData.length > 0 && (
            <div className="space-y-3">
              {patientStatusData.map((slice) => (
                <div key={slice.label} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="text-xs font-bold text-slate-600">{slice.label}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{slice.value}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Next Session
            </p>
            <p className="text-sm font-bold">
              {nextAppointment
                ? new Date(nextAppointment.dateTime).toLocaleString()
                : 'No upcoming sessions'}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Pending Requests
            </p>
            <p className="text-sm font-bold">{stats.pendingRequests}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Profile Health
            </p>
            <p className="text-sm font-bold">
              {provider?.isPublished ? 'Published' : 'Hidden'} • {provider?.moderationStatus || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderOverview;
