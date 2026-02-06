import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  className?: string;
  as?: 'div' | 'article' | 'section' | 'li';
  onClick?: () => void;
  id?: string;
}

const variants = {
  default: 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50',
  elevated: 'bg-white border border-slate-100 shadow-2xl',
  outlined: 'bg-white border-2 border-slate-200 shadow-none',
  muted: 'bg-slate-50 border border-slate-100 shadow-sm',
};

const sizes = {
  sm: 'p-6 rounded-2xl',     // Compact
  md: 'p-8 rounded-3xl',     // Standard
  lg: 'p-10 rounded-[2.5rem]', // Large/Feature (mapped to custom large radius for consistency with existing design language)
};

const hoverStyles = 'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  hoverable = false,
  className = '',
  as = 'div',
  onClick,
  id,
  ...props
}) => {
  const Component = as;
  
  // If onClick is provided, we default to hoverable unless explicitly disabled
  const isInteractive = hoverable || !!onClick;
  
  const combinedClassName = `
    ${variants[variant]} 
    ${sizes[size]} 
    ${isInteractive ? hoverStyles : ''} 
    ${className}
    flex flex-col relative overflow-hidden
  `.trim();

  return (
    <Component 
      id={id}
      className={combinedClassName} 
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

// --- Subcomponents ---

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mb-6 flex flex-col gap-2 ${className}`}>
    {children}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex-grow ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mt-8 pt-6 border-t border-slate-100/50 flex items-center justify-between gap-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string; as?: 'h2' | 'h3' | 'h4' }> = ({ 
  children, 
  className = '', 
  as = 'h3' 
}) => {
  const Component = as;
  return (
    <Component className={`text-xl font-black text-slate-900 tracking-tight leading-tight ${className}`}>
      {children}
    </Component>
  );
};

export default Card;