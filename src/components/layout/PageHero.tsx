import React from 'react';
import Section from './Section';
import Container from './Container';
import { designSystem } from '@/styles/design-system';

export interface PageHeroProps {
  overline?: string;
  title: string | React.ReactNode;
  description?: string;
  variant?: 'centered' | 'split' | 'left-aligned';
  visual?: React.ReactNode;
  actions?: React.ReactNode;
  background?: 'gradient' | 'plain' | 'dark';
  className?: string;
}

const PageHero: React.FC<PageHeroProps> = ({
  overline,
  title,
  description,
  variant = 'centered',
  visual,
  actions,
  background = 'plain',
  className = ''
}) => {
  // Determine Text Alignment and Layout
  const isCentered = variant === 'centered';
  const isSplit = variant === 'split';
  
  const textAlignClass = isCentered ? 'text-center mx-auto' : 'text-left';
  const maxWidthClass = isCentered ? 'max-w-4xl' : 'max-w-3xl';
  
  // Background Styles
  let bgStyles = '';
  let textStyles = 'text-slate-900';
  let descStyles = 'text-slate-500';
  
  if (background === 'dark') {
    bgStyles = 'bg-slate-900';
    textStyles = 'text-white';
    descStyles = 'text-slate-300';
  } else if (background === 'gradient') {
    bgStyles = 'bg-gradient-to-b from-brand-50 to-white';
  }

  // Content Block
  const Content = (
    <div className={`${textAlignClass} ${maxWidthClass} relative z-10`}>
      {overline && (
        <div className={`inline-block px-4 py-1.5 rounded-full border mb-6 text-[10px] font-black uppercase tracking-widest ${
          background === 'dark' 
            ? 'bg-white/10 border-white/10 text-brand-300' 
            : 'bg-white border-slate-200 text-slate-600'
        }`}>
          {overline}
        </div>
      )}
      
      <h1 className={`${designSystem.typography.display} ${textStyles} mb-6`}>
        {title}
      </h1>
      
      {description && (
        <p className={`${designSystem.typography.lead} ${descStyles} mb-10`}>
          {description}
        </p>
      )}
      
      {actions && (
        <div className={`flex flex-wrap gap-4 ${isCentered ? 'justify-center' : 'justify-start'}`}>
          {actions}
        </div>
      )}
    </div>
  );

  return (
    <section className={`relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden ${bgStyles} ${className}`}>
      {/* Background Decorators */}
      {background !== 'dark' && (
        <>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>
        </>
      )}

      <Container size="full" className="px-6 relative z-10">
        {isSplit ? (
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              {Content}
            </div>
            {visual && (
              <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end reveal">
                {visual}
              </div>
            )}
          </div>
        ) : (
          Content
        )}
      </Container>
    </section>
  );
};

export default PageHero;