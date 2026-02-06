
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  path?: string;
  children?: React.ReactNode;
}

const Icon: React.FC<IconProps> = ({ size = 24, path, children, className, ...props }) => {
  const sizeStyle = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={sizeStyle} 
      height={sizeStyle} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      {path ? <path d={path} /> : children}
    </svg>
  );
};

export default Icon;
