import React from 'react';
import { designSystem } from '@/styles/design-system';

export interface HeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'display' | 'h1' | 'h2' | 'h3' | 'h4';
  color?: 'primary' | 'secondary' | 'brand' | 'white' | 'accent';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  id?: string;
}

const Heading: React.FC<HeadingProps> = ({
  children,
  level,
  size,
  color = 'primary',
  className = '',
  as,
  id,
}) => {
  // Determine semantic HTML tag
  const Component = as || (`h${level}` as any);

  // Determine visual size class
  // Default to the level if size is not explicitly provided
  let sizeClass = '';
  const effectiveSize = size || `h${level}`;

  switch (effectiveSize) {
    case 'display':
      sizeClass = designSystem.typography.display;
      break;
    case 'h1':
      sizeClass = designSystem.typography.h1;
      break;
    case 'h2':
      sizeClass = designSystem.typography.h2;
      break;
    case 'h3':
      sizeClass = designSystem.typography.h3;
      break;
    case 'h4':
    case 'h5':
    case 'h6':
      sizeClass = designSystem.typography.h4;
      break;
    default:
      sizeClass = designSystem.typography.h2;
  }

  // Determine color class
  let colorClass = '';
  switch (color) {
    case 'primary':
      colorClass = designSystem.colors.textPrimary;
      break;
    case 'secondary':
      colorClass = designSystem.colors.textSecondary;
      break;
    case 'brand':
      colorClass = designSystem.colors.brandPrimary;
      break;
    case 'white':
      colorClass = 'text-white';
      break;
    case 'accent':
      colorClass = 'text-blue-600'; // Hardcoded accent for now as it's not in design-system.ts colors object yet
      break;
    default:
      colorClass = designSystem.colors.textPrimary;
  }

  return (
    <Component id={id} className={`${sizeClass} ${colorClass} ${className}`}>
      {children}
    </Component>
  );
};

export default Heading;