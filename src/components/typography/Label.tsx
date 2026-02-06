import React from 'react';
import { designSystem } from '@/styles/design-system';

export interface LabelProps {
  children: React.ReactNode;
  variant?: 'default' | 'overline' | 'badge';
  color?: 'default' | 'brand' | 'muted' | 'white' | 'success' | 'warning' | 'error';
  className?: string;
  as?: 'span' | 'p' | 'div' | 'label';
  htmlFor?: string;
}

const Label: React.FC<LabelProps> = ({
  children,
  variant = 'default',
  color = 'default',
  className = '',
  as = 'span',
  htmlFor
}) => {
  const Component = as;

  // Resolve typography style
  let variantClass = '';
  switch (variant) {
    case 'overline':
      variantClass = designSystem.typography.overline;
      break;
    case 'badge':
      variantClass = designSystem.typography.badge;
      break;
    case 'default':
    default:
      variantClass = designSystem.typography.label;
      break;
  }

  // Resolve Color
  let colorClass = '';
  switch (color) {
    case 'brand':
      colorClass = designSystem.colors.brandPrimary;
      break;
    case 'muted':
      colorClass = designSystem.colors.textMuted;
      break;
    case 'white':
      colorClass = 'text-white';
      break;
    case 'success':
      colorClass = 'text-green-600';
      break;
    case 'warning':
      colorClass = 'text-amber-600';
      break;
    case 'error':
      colorClass = 'text-red-500';
      break;
    case 'default':
    default:
      colorClass = designSystem.colors.textSecondary; // Labels usually slightly muted
      break;
  }

  return (
    <Component htmlFor={htmlFor} className={`${variantClass} ${colorClass} ${className}`}>
      {children}
    </Component>
  );
};

export default Label;