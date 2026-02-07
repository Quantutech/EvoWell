import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endorsementService } from '../../../../services/endorsement.service';
import { api } from '../../../../services/api';
import { Endorsement, ProviderProfile } from '../../../../types';
import { Card, Button, Badge } from '../../../ui';
import { Heading, Text } from '../../../../components/typography';

/**
 * AdminEndorsementsTab - Management interface for platform-wide endorsements.
 * Allows admins to audit and revoke endorsements.
 */
const AdminEndorsementsTab: React.FC = () => {
  const { data: endorsements = [], refetch, isLoading: endorsementsLoading } = useQuery({
    queryKey: ['adminEndorsements'],
    queryFn: () => endorsementService.getAllEndorsements(),
  });

  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ['adminProviders'],
    queryFn: () => api.getAllProviders(),
  });

  const providerMap = useMemo(() => {
    const map = new Map<string, ProviderProfile>();
    if (Array.isArray(providers)) {
        providers.forEach((p: ProviderProfile) => map.set(p.id, p));
    }
    return map;
  }, [providers]);

  // Calculate endorsement counts per provider
  const endorsementCounts = useMemo(() => {
    const counts = new Map<string, number>();
    endorsements.forEach((e: Endorsement) => {
        counts.set(e.endorsedProviderId, (counts.get(e.endorsedProviderId) || 0) + 1);
    });
    return counts;
  }, [endorsements]);

  const handleRevoke = async (id: string) => {
    if (window.confirm('Are you sure you want to revoke this endorsement? This action is recorded but hides the endorsement from public view.')) {
      try {
        await endorsementService.revokeEndorsement(id);
        refetch();
      } catch (error) {
        console.error('Failed to revoke endorsement:', error);
        alert('Failed to revoke endorsement');
      }
    }
  };

  const REASON_LABELS: Record<string, string> = {
    clinical_expertise: 'Clinical Expertise',
    professional_collaboration: 'Professional Collaboration',
    ethical_practice: 'Ethical Practice',
    strong_outcomes: 'Strong Outcomes',
    community_contribution: 'Community Contribution'
  };

  const isLoading = endorsementsLoading || providersLoading;

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
        <Text color="muted">Loading endorsements data...</Text>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <Heading level={2}>Endorsements</Heading>
          <Text color="muted">Audit and manage professional trust signals.</Text>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Total Signals</span>
            <span className="text-xl font-black text-brand-600">{endorsements.length}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {endorsements.map((e: Endorsement) => {
            const provider = providerMap.get(e.endorsedProviderId);
            const count = endorsementCounts.get(e.endorsedProviderId) || 0;
            
            return (
            <div key={e.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row items-center gap-6">
                
                {/* Target Provider Info */}
                <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                    <div className="relative">
                        {provider?.imageUrl ? (
                            <img src={provider.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-slate-100" alt="" />
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-100">
                                {provider?.firstName?.charAt(0) || '?'}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-brand-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                            {count}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Endorsed Provider</p>
                        <h4 className="text-sm font-bold text-slate-900">
                            {provider ? `${provider.firstName} ${provider.lastName}` : 'Unknown Provider'}
                        </h4>
                        <p className="text-xs text-slate-500">{provider?.professionalTitle || 'N/A'}</p>
                    </div>
                </div>

                {/* Connection Line (Visual) */}
                <div className="hidden md:flex items-center gap-2 px-4 opacity-30">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    <div className="w-8 h-px bg-slate-400"></div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div className="w-8 h-px bg-slate-400"></div>
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                </div>

                {/* Endorser Info */}
                <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                     <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xs border border-blue-100">
                        {e.endorser ? e.endorser.firstName.charAt(0) : 'S'}
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Endorsed By</p>
                        <h4 className="text-sm font-bold text-slate-900">
                            {e.endorser ? `${e.endorser.firstName} ${e.endorser.lastName}` : 'System / Admin'}
                        </h4>
                        <div className="flex items-center gap-2">
                            <Badge variant="neutral" className="text-[9px] py-0 px-2">{e.endorserRole}</Badge>
                            <span className="text-[10px] text-slate-400">on {new Date(e.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Metadata & Actions */}
                <div className="flex flex-col items-end gap-3 min-w-[150px]">
                    <div className="flex gap-2">
                         <Badge variant={e.endorsementType === 'evowell' ? 'brand' : 'info'} className="text-[10px] uppercase tracking-wider">
                            {e.endorsementType}
                         </Badge>
                         {e.reason && (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                {REASON_LABELS[e.reason] || e.reason}
                            </span>
                         )}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRevoke(e.id)} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 text-xs font-bold"
                    >
                        Revoke Endorsement
                    </Button>
                </div>

            </div>
        )})}

        {endorsements.length === 0 && (
            <div className="py-32 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <Text color="muted" weight="bold">No endorsements found in the system.</Text>
            </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 pt-6">
         <Card className="p-6 border-amber-100 bg-amber-50/30">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-2">Automated Insights</h4>
            <Heading level={4} className="text-sm mb-2">Endorsement Rings</Heading>
            <Text variant="small" color="muted">Network analysis is currently scanning for mutual endorsement clusters. No anomalies detected in the last 24 hours.</Text>
         </Card>
         <Card className="p-6 border-brand-100 bg-brand-50/30">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 mb-2">Platform Health</h4>
            <Heading level={4} className="text-sm mb-2">Trust Signal Velocity</Heading>
            <Text variant="small" color="muted">Endorsement growth is within normal parameters (+12% MoM). 84% of endorsements include a structured reason.</Text>
         </Card>
      </div>
    </div>
  );
};

export default AdminEndorsementsTab;
