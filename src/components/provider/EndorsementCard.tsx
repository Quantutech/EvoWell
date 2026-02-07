import React from 'react';
import { Endorsement } from '../../types';
import { Link } from 'react-router-dom';

interface EndorsementCardProps {
  endorsement: Endorsement;
  className?: string;
}

const REASON_LABELS: Record<string, string> = {
  clinical_expertise: 'Clinical Expertise',
  professional_collaboration: 'Professional Collaboration',
  ethical_practice: 'Ethical Practice',
  strong_outcomes: 'Strong Outcomes',
  community_contribution: 'Community Contribution'
};

/**
 * EndorsementCard - Individual peer identity card for Trust section.
 * Redesigned for better readability on light backgrounds.
 */
export const EndorsementCard: React.FC<EndorsementCardProps> = ({ endorsement, className = '' }) => {
  const { endorser, reason } = endorsement;
  
  if (!endorser) return null;

  return (
    <div className={`bg-white border border-slate-200 p-5 rounded-[20px] flex flex-col h-full hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 group min-w-[280px] max-w-[320px] snap-center ${className}`}>
      <div className="flex items-center mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 mr-4 border border-slate-100 flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
          {endorser.imageUrl ? (
            <img 
              src={endorser.imageUrl} 
              alt={`${endorser.firstName} ${endorser.lastName}`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold bg-slate-50">
              {endorser.firstName[0]}{endorser.lastName[0]}
            </div>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <Link 
            to={endorser.profileSlug ? `/provider/${endorser.profileSlug}` : '#'} 
            className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors block truncate leading-tight mb-1"
          >
            {endorser.firstName} {endorser.lastName}
          </Link>
          {endorser.professionalTitle && (
            <span className="text-[11px] text-slate-500 font-medium block truncate tracking-wide">
              {endorser.professionalTitle}
            </span>
          )}
        </div>
      </div>
      
      {/* Reason chip */}
      {reason && (
        <div className="mt-auto">
          <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100 group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-100 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {REASON_LABELS[reason] || reason.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
