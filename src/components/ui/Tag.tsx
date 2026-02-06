import React from 'react';

export interface TagProps {
  children: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Tag: React.FC<TagProps> = ({
  children,
  selected = false,
  onSelect,
  onRemove,
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseStyles = 'px-5 py-2 rounded-full text-xs font-bold transition-all min-h-[44px] inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 select-none';

  const stateStyles = selected
    ? 'bg-slate-900 text-white shadow-lg border border-transparent'
    : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700';

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if (onSelect) {
        onSelect();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation(); // Prevent triggering select
    if (onRemove) onRemove();
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      {children}
      {onRemove && (
        <span 
          onClick={handleRemove}
          className={`ml-1 rounded-full p-0.5 transition-colors flex items-center justify-center ${selected ? 'hover:bg-white/20' : 'hover:bg-slate-200'}`}
          role="button"
          aria-label="Remove tag"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                handleRemove(e as any);
            }
          }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      )}
    </button>
  );
};

export default Tag;