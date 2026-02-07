import React, { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface ImprovedSidebarProps {
  sections: NavSection[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const ImprovedSidebar: React.FC<ImprovedSidebarProps> = ({ sections, activeTab, onTabChange }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(sections.map(s => [s.title, true]))
  );

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <nav className="flex-grow overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar">
      {sections.map(section => (
        <div key={section.title} className="space-y-2">
          <button 
            onClick={() => toggleSection(section.title)}
            className="w-full flex items-center justify-between px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-700 transition-colors"
          >
            {section.title}
            <svg 
              className={`w-3 h-3 transition-transform duration-300 ${openSections[section.title] ? 'rotate-180' : ''}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className={`space-y-1 overflow-hidden transition-all duration-300 ${openSections[section.title] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {section.items.map(item => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === item.id 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-[1.02]' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
};
