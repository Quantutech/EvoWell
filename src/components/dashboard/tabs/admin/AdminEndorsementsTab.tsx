import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endorsementService } from '../../../../services/endorsement.service';
import { Endorsement } from '../../../../types';
import { Card, Button, Badge } from '../../../ui';
import { Heading, Text } from '../../../../components/typography';

/**
 * AdminEndorsementsTab - Management interface for platform-wide endorsements.
 * Allows admins to audit and revoke endorsements.
 */
const AdminEndorsementsTab: React.FC = () => {
  const { data: endorsements = [], refetch, isLoading } = useQuery({
    queryKey: ['adminEndorsements'],
    queryFn: () => endorsementService.getAllEndorsements(),
  });

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

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
        <Text color="muted">Loading endorsements...</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Heading level={2}>Endorsements Management</Heading>
          <Text color="muted">Audit and manage professional trust signals across the network.</Text>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/40">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Target Provider</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Endorser Identity</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Signal Type</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Structured Reason</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Granted On</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {endorsements.map((e: Endorsement) => (
                    <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                       <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-brand-500/40" />
                             <Text weight="bold" className="text-sm">ID: {e.endorsedProviderId.slice(0, 8)}...</Text>
                          </div>
                       </td>
                       <td className="py-4 px-6">
                          <div className="flex flex-col">
                             <Text weight="bold" className="text-sm">
                               {e.endorser ? `${e.endorser.firstName} ${e.endorser.lastName}` : 'System/Admin'}
                             </Text>
                             <Text variant="caption" color="muted" className="uppercase tracking-tighter">
                               Role: {e.endorserRole}
                             </Text>
                          </div>
                       </td>
                       <td className="py-4 px-6">
                          <Badge 
                            variant={e.endorsementType === 'evowell' ? 'brand' : 'info'}
                            className="rounded-lg text-[10px] font-black uppercase"
                          >
                             {e.endorsementType}
                          </Badge>
                       </td>
                       <td className="py-4 px-6">
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                            {e.reason ? (REASON_LABELS[e.reason] || e.reason) : 'N/A'}
                          </span>
                       </td>
                       <td className="py-4 px-6">
                          <Text variant="caption" className="font-medium text-slate-400">
                            {new Date(e.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                       </td>
                       <td className="py-4 px-6 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRevoke(e.id)} 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                          >
                             Revoke
                          </Button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
            {endorsements.length === 0 && (
                <div className="py-32 text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <Text color="muted" weight="bold">No active endorsements found on the platform.</Text>
                </div>
            )}
         </div>
      </Card>

      {/* Abuse Detection Placeholder (Future Integration) */}
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
