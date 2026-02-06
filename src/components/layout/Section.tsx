import React from 'react';
import { designSystem } from '@/styles/design-system';

export interface SectionProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  background?: 'default' | 'white' | 'muted' | 'dark' | 'brand';
  className?: string;
  id?: string;
}

const Section: React.FC<SectionProps> = ({
  children,
  spacing = 'md',
  background = 'default',
  className = '',
  id
}) => {
  // Resolve vertical spacing
  const spacingClass = designSystem.spacing.section[spacing];

  // Resolve background styles
  let bgClass = '';
  switch (background) {
    case 'white':
      bgClass = 'bg-white';
      break;
    case 'muted':
      bgClass = 'bg-slate-50 border-y border-slate-100'; // Muted often implies a subtle separation
      break;
    case 'dark':
      bgClass = 'bg-slate-900 text-white';
      break;
    case 'brand':
      bgClass = 'bg-brand-900 text-white';
      break;
    case 'default':
    default:
      bgClass = 'bg-[#F8FAFC]'; // Matches standard page background
      break;
  }

  const combinedClassName = `${spacingClass} ${bgClass} ${className}`;

  return (
    <section id={id} className={combinedClassName}>
      {children}
    </section>
  );
};

export default Section;