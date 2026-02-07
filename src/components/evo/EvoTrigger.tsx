import React from 'react';
import { useEvo } from './EvoContext';
import EvoIcon from './EvoIcon';

const EvoTrigger: React.FC = () => {
  const { openEvo, isOpen } = useEvo();

  if (isOpen) return null;

  return (
    <button
      onClick={openEvo}
      className="fixed bottom-6 right-6 z-[400] group flex items-center gap-3 bg-white pl-2 pr-5 py-2 rounded-full shadow-2xl shadow-brand-500/20 border border-slate-100 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
      aria-label="Chat with Evo"
    >
      <EvoIcon size="md" />
      <div className="flex flex-col items-start">
        <span className="text-sm font-bold text-slate-900">Chat with Evo</span>
        <span className="text-[10px] font-medium text-slate-500">Navigation Assistant</span>
      </div>
    </button>
  );
};

export default EvoTrigger;
