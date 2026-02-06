import React from 'react';
import { designSystem } from '@/styles/design-system';

export interface ContainerProps {
  children: React.ReactNode;
  size?: 'full' | 'content' | 'narrow' | 'tight';
  className?: string;
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  size = 'content', 
  className = '', 
  as = 'div' 
}) => {
  const Component = as;
  
  // Resolve max-width class from design system
  const maxWidthClass = designSystem.containers[size];
  
  // Resolve padding
  const paddingClass = designSystem.spacing.container.padding;

  const combinedClassName = `mx-auto w-full ${maxWidthClass} ${paddingClass} ${className}`;

  return (
    <Component className={combinedClassName}>
      {children}
    </Component>
  );
};

export default Container;