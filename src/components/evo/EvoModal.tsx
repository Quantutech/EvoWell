import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserSignal } from './types';
import EvoIcon from './EvoIcon';
import ConversationFlow from './ConversationFlow';
import ResultsView from './ResultsView';
import { Button } from '@/components/ui';
import { Heading, Text } from '@/components/typography';

interface EvoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EvoState = 'INTRO' | 'CONVERSATION' | 'RESULTS';

const EvoModal: React.FC<EvoModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<EvoState>('INTRO');
  const [finalSignal, setFinalSignal] = useState<UserSignal | null>(null);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setView('INTRO');
        setFinalSignal(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleStart = () => setView('CONVERSATION');
  
  const handleComplete = (signal: UserSignal) => {
    setFinalSignal(signal);
    setView('RESULTS');
  };

  const handleReset = () => {
    setFinalSignal(null);
    setView('INTRO');
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] min-h-[500px] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Close Evo"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* INTRO VIEW */}
          {view === 'INTRO' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="mb-8 relative">
                 <div className="absolute inset-0 bg-brand-500 blur-[60px] opacity-20 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
                 <EvoIcon size="xl" className="relative z-10" />
              </div>
              
              <Heading level={1} className="mb-2 text-4xl tracking-tight">Hi, I'm Evo.</Heading>
              <Text className="text-brand-600 font-medium mb-6 uppercase tracking-wide text-sm">Your guide to the EvoWell ecosystem</Text>
              
              <Text variant="lead" className="max-w-md mb-10 text-slate-600 leading-relaxed">
                I'll ask a few quick questions to better understand your needs and guide you to the right resources.
              </Text>
              
              <Button 
                onClick={handleStart}
                size="lg"
                className="rounded-full px-12 text-lg shadow-brand-500/30 hover:shadow-brand-500/40 hover:-translate-y-1 transition-all"
                rightIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              >
                Get Started
              </Button>
            </div>
          )}

          {/* CONVERSATION VIEW */}
          {view === 'CONVERSATION' && (
            <div className="flex-1 h-full animate-in fade-in duration-300">
               <ConversationFlow onComplete={handleComplete} onClose={onClose} />
            </div>
          )}

          {/* RESULTS VIEW */}
          {view === 'RESULTS' && finalSignal && (
            <div className="flex-1 h-full animate-in fade-in duration-300">
               <ResultsView signal={finalSignal} onReset={handleReset} onClose={onClose} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EvoModal;
