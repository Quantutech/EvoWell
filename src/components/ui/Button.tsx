import React from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'brand' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: 'button' | 'a' | 'link';
  href?: string;
  to?: string; // For React Router Link
  className?: string;
}

const variants = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 focus-visible:ring-slate-900',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-400',
  brand: 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20 focus-visible:ring-brand-500',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400 shadow-none',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 focus-visible:ring-red-500',
};

const sizes = {
  sm: 'px-4 py-2 text-xs min-h-[32px]',
  md: 'px-6 py-3 text-sm min-h-[44px]',
  lg: 'px-8 py-4 text-sm min-h-[52px]',
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  as = 'button',
  href,
  to,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0';
  
  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const combinedClassName = `${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`;

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2 -mr-1">{rightIcon}</span>}
    </>
  );

  if (as === 'link' && to) {
    return (
      <Link to={to} className={combinedClassName}>
        {content}
      </Link>
    );
  }

  if (as === 'a' && href) {
    return (
      <a href={href} className={combinedClassName} {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;