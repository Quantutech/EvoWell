import React from 'react';
import { designSystem } from '@/styles/design-system';

export interface TextProps {
  children: React.ReactNode;
  variant?: 'lead' | 'body' | 'small' | 'caption';
  color?: 'primary' | 'secondary' | 'muted' | 'brand' | 'white' | 'success' | 'error' | 'warning';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
  as?: 'p' | 'span' | 'div' | 'li';
}

const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'secondary',
  weight,
  align,
  className = '',
  as = 'p',
}) => {
  const Component = as;

  // Resolve typography variant
  let variantClass = '';
  switch (variant) {
    case 'lead':
      variantClass = designSystem.typography.lead;
      break;
    case 'body':
      variantClass = designSystem.typography.body;
      break;
    case 'small':
      variantClass = designSystem.typography.small;
      break;
    case 'caption':
      variantClass = designSystem.typography.caption;
      break;
    default:
      variantClass = designSystem.typography.body;
  }

  // Resolve color
  let colorClass = '';
  switch (color) {
    case 'primary':
      colorClass = designSystem.colors.textPrimary;
      break;
    case 'secondary':
      colorClass = designSystem.colors.textSecondary;
      break;
    case 'muted':
      colorClass = designSystem.colors.textMuted;
      break;
    case 'brand':
      colorClass = designSystem.colors.brandPrimary;
      break;
    case 'white':
      colorClass = 'text-white';
      break;
    case 'success':
      colorClass = 'text-green-600';
      break;
    case 'error':
      colorClass = 'text-red-600';
      break;
    case 'warning':
      colorClass = 'text-amber-600';
      break;
    default:
      colorClass = designSystem.colors.textSecondary;
  }

  // Resolve Weight Override (if provided, otherwise inherits from variant class)
  let weightClass = '';
  if (weight) {
    weightClass = `font-${weight}`;
  }

  // Resolve Align
  let alignClass = '';
  if (align) {
    alignClass = `text-${align}`;
  }

  return (
    <Component className={`${variantClass} ${colorClass} ${weightClass} ${alignClass} ${className}`}>
      {children}
    </Component>
  );
};

export default Text;