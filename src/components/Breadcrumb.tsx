import React from 'react';
import { useNavigation } from '@/App';

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const { navigate } = useNavigation();
  return (
    <div className={`pt-28 pb-4 max-w-[1440px] mx-auto px-6 ${className || ''}`}>
      <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <svg className="w-3 h-3 cursor-pointer hover:text-slate-600" onClick={() => navigate('#/')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {item.href ? (
              <span className="cursor-pointer hover:text-slate-600" onClick={() => navigate(item.href!)}>{item.label}</span>
            ) : (
              <span className="text-slate-900 font-black">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};
export default Breadcrumb;