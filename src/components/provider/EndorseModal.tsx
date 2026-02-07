import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ProviderProfile, EndorsementReason } from '../../types';
import Button from '../ui/Button';

interface EndorseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: EndorsementReason) => Promise<void>;
  provider: ProviderProfile;
}

const REASONS: { value: EndorsementReason; label: string }[] = [
  { value: 'clinical_expertise', label: 'Clinical Expertise' },
  { value: 'professional_collaboration', label: 'Professional Collaboration' },
  { value: 'ethical_practice', label: 'Ethical Practice' },
  { value: 'strong_outcomes', label: 'Strong Outcomes' },
  { value: 'community_contribution', label: 'Community Contribution' }
];

/**
 * EndorseModal - Multi-step confirmation flow for granting endorsements.
 * Features firm language and intentional friction to build credibility.
 */
export const EndorseModal: React.FC<EndorseModalProps> = ({ isOpen, onClose, onConfirm, provider }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedReason, setSelectedReason] = useState<EndorsementReason | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => setStep(2);
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(selectedReason);
      onClose();
    } catch (error) {
      console.error('Failed to confirm endorsement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[24px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-10 p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-full transition-all"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 sm:p-10">
          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-100 mb-2 leading-tight">
                Endorse {provider.firstName} {provider.lastName}
              </h2>
              <p className="text-[13px] text-slate-400 mb-8 leading-relaxed">
                Why are you endorsing this provider? <br/>
                <span className="opacity-60 text-[11px] uppercase tracking-wider">(Optional — select one)</span>
              </p>
              
              <div className="space-y-3 mb-10">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setSelectedReason(r.value)}
                    className={`w-full text-left p-4 rounded-[16px] border transition-all duration-200 group ${
                      selectedReason === r.value 
                        ? 'bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)]' 
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold tracking-wide ${selectedReason === r.value ? 'text-teal-400' : 'text-slate-300'}`}>
                        {r.label}
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedReason === r.value 
                          ? 'border-teal-500 bg-teal-500' 
                          : 'border-slate-600 group-hover:border-slate-500'
                      }`}>
                        {selectedReason === r.value && (
                          <svg className="w-3 h-3 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                 <Button 
                   onClick={handleNext} 
                   className="w-full rounded-full h-[54px] text-sm font-bold uppercase tracking-widest bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/20"
                 >
                   Continue
                 </Button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-100 mb-4 leading-tight">Confirm Your Endorsement</h2>
              
              <div className="bg-[#1e1b4b] border border-brand-900/50 p-5 rounded-[16px] mb-10">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-brand-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    You can only endorse a provider once. This action <span className="text-brand-400 font-bold underline decoration-brand-400/30 underline-offset-4">cannot be undone</span>. By confirming, your professional identity will be bound to this trust signal.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                    onClick={handleConfirm} 
                    loading={isSubmitting}
                    className="w-full rounded-full h-[54px] text-sm font-bold uppercase tracking-widest bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-500/20"
                >
                    Confirm Endorsement
                </Button>
                <button 
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="w-full py-2 text-[12px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                    Back to Reason selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
