import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  pill?: boolean;
  className?: string;
}

const variants = {
  brand: 'bg-brand-50 text-brand-600 border border-brand-100',
  neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
  success: 'bg-green-50 text-green-700 border border-green-100',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  danger: 'bg-red-50 text-red-700 border border-red-100',
  info: 'bg-blue-50 text-blue-700 border border-blue-100',
};

const sizes = {
  sm: 'text-[9px] px-2 py-0.5',
  md: 'text-[11px] px-3 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  pill = false,
  className = ''
}) => {
  return (
    <span className={`
      inline-flex items-center justify-center font-black uppercase tracking-widest
      ${variants[variant]}
      ${sizes[size]}
      ${pill ? 'rounded-full' : 'rounded-lg'}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;