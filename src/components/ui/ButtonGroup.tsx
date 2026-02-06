import React from 'react';

export interface ButtonGroupProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  direction?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end' | 'between';
  className?: string;
}

const spacingMap = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6'
};

const alignMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between'
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  spacing = 'md',
  direction = 'horizontal',
  align = 'start',
  className = ''
}) => {
  const directionClasses = direction === 'vertical' ? 'flex-col' : 'flex-row items-center';
  const spacingClass = spacingMap[spacing];
  const alignClass = alignMap[align];

  return (
    <div className={`flex flex-wrap ${directionClasses} ${spacingClass} ${alignClass} ${className}`}>
      {children}
    </div>
  );
};

export default ButtonGroup;