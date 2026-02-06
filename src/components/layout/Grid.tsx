import React from 'react';

export interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Grid: React.FC<GridProps> = ({ 
  children, 
  cols = 3, 
  gap = 'md', 
  className = '' 
}) => {
  // Map columns to responsive grid classes
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }[cols];

  // Map gaps to Tailwind classes
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-8',
    lg: 'gap-12'
  }[gap];

  const combinedClassName = `grid ${colClasses} ${gapClasses} ${className}`;

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
};

export default Grid;