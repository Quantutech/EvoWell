import React, { useEffect, useState } from 'react';
import { UserSignal, Recommendation } from './types';
import { KNOWLEDGE_BASE } from './knowledge';
import { ProviderProfile } from '@/types';
import { providerService } from '@/services/provider.service';
import ProviderCard from '@/components/provider/ProviderCard';
import { Heading, Text } from '@/components/typography';
import { Button } from '@/components/ui';
import { useNavigation } from '@/App';

interface ResultsViewProps {
  signal: UserSignal;
  onReset: () => void;
  onClose: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ signal, onReset, onClose }) => {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigate } = useNavigation();

  // Determine if we are in a non-client flow
  const isSpecialRole = signal.user_role && signal.user_role !== 'Client';
  const role = signal.user_role || 'Client';

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (isSpecialRole) {
            // No API call needed for static knowledge base
            setLoading(false);
            return;
        }

        // Map signal to search filters for Clients
        const filters: any = {};
        if (signal.primary_concern && signal.primary_concern !== 'Other' && signal.primary_concern !== 'Not sure') {
          filters.query = signal.primary_concern;
        }
        if (signal.preferred_specialties && signal.preferred_specialties.length > 0) {
           filters.specialty = signal.preferred_specialties[0]; 
        }
        if (signal.budget_sensitivity === 'yes') {
            filters.maxPrice = 150; 
        }
        
        const { providers } = await providerService.search(filters);
        
        // Prioritize sliding scale if budget is a concern
        let sortedProviders = [...providers];
        if (signal.budget_sensitivity === 'yes' || signal.budget_sensitivity === 'somewhat') {
             sortedProviders.sort((a, b) => {
                 if (a.pricing.slidingScale && !b.pricing.slidingScale) return -1;
                 if (!a.pricing.slidingScale && b.pricing.slidingScale) return 1;
                 return a.pricing.hourlyRate - b.pricing.hourlyRate;
             });
        }
        
        setProviders(sortedProviders.slice(0, 3)); 
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [signal, isSpecialRole]);

  const handleNavigate = (url: string) => {
      onClose();
      // Handle internal navigation via hook
      if (url.startsWith('#')) {
          navigate(url.substring(1));
      } else if (url.startsWith('/')) {
          navigate(url);
      } else {
          window.location.href = url;
      }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mb-4"></div>
        <Text>Finding the best resources for you...</Text>
      </div>
    );
  }

  // --- RENDER FOR PARTNERS / INVESTORS / PROVIDERS ---
  if (isSpecialRole) {
      const recommendations = KNOWLEDGE_BASE[role] || [];
      
      return (
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-6 pb-24 space-y-8">
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-brand-500 text-white p-1.5 rounded-lg">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <Heading level={4} className="text-brand-900 m-0">Welcome to EvoWell</Heading>
                    </div>
                    <Text className="mb-4">
                        We're excited to connect with {role === 'Provider' ? 'clinicians' : role === 'Investor' ? 'partners' : 'organizations'} like you. Here are the most relevant resources to get you started.
                    </Text>
                </div>

                <Heading level={4} className="mb-4">Recommended Resources</Heading>
                <div className="space-y-4">
                    {recommendations.map((rec, idx) => (
                        <div key={rec.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-brand-300 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => handleNavigate(rec.url)}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${rec.type === 'article' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {rec.type}
                                </span>
                                <svg className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-1">{rec.title}</h4>
                            <p className="text-sm text-slate-500 mb-3">{rec.description}</p>
                            {rec.match_reasons && (
                                <p className="text-xs text-brand-600 font-medium italic">
                                    Why: {rec.match_reasons[0]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section className="pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button variant="secondary" onClick={onReset}>Start Over</Button>
                </div>
            </section>
        </div>
      );
  }

  // --- RENDER FOR CLIENTS (Existing Logic) ---
  const primaryRecommendation = providers[0];

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-6 pb-24 space-y-8">
      
      {/* Section A: Primary Recommendation */}
      {primaryRecommendation && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
               <div className="bg-brand-500 text-white p-1.5 rounded-lg">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
               </div>
               <Heading level={4} className="text-brand-900 m-0">Here's a great path forward</Heading>
            </div>
            <Text className="mb-4">
              Since you're navigating <strong>{signal.primary_concern || 'some challenges'}</strong>, connecting with a <strong>{primaryRecommendation.professionalCategory}</strong> could be transformative. 
              {signal.support_goal === 'tools' ? 'They can equip you with practical strategies to regain balance.' : 'They offer a safe space to explore and understand your experience.'}
            </Text>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <ProviderCard provider={primaryRecommendation} className="border-0 shadow-none" />
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
                    <Text variant="small" className="text-slate-500 italic">
                        <strong>Why this match?</strong> You mentioned {signal.primary_concern} and prefer {signal.session_format || 'flexible'} sessions.
                    </Text>
                </div>
            </div>
          </div>
        </section>
      )}

      {/* Section B: Matched Providers */}
      {providers.length > 1 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <Heading level={4} className="mb-4">Other great matches</Heading>
            <div className="space-y-4">
                {providers.slice(1).map(provider => (
                    <ProviderCard key={provider.id} provider={provider} />
                ))}
            </div>
        </section>
      )}

      {/* Section C: Resources (Free) */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <Heading level={4} className="mb-4">Free resources to explore</Heading>
        <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-300 transition-colors cursor-pointer group" onClick={() => handleNavigate('/blog')}>
                <div className="flex items-start justify-between mb-2">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Guide</span>
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-1">Understanding {signal.primary_concern || 'Mental Wellness'}</h4>
                <p className="text-sm text-slate-500">A comprehensive guide to recognizing symptoms and finding balance.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-300 transition-colors cursor-pointer group" onClick={() => handleNavigate('/exchange')}>
                <div className="flex items-start justify-between mb-2">
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Tool</span>
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-1">Daily Mood Tracker</h4>
                <p className="text-sm text-slate-500">Simple template to log your emotions and identify triggers.</p>
            </div>
        </div>
      </section>

      {/* Section D: Actions */}
      <section className="pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
        <div className="grid grid-cols-3 gap-3">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="secondary" onClick={onReset}>Start Over</Button>
            <Button onClick={() => handleNavigate('/directory')}>View All</Button>
        </div>
      </section>

    </div>
  );
};

export default ResultsView;
