import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  variant?: 'default' | 'dark';
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...', 
  className,
  ariaLabel,
  disabled = false,
  variant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  // Normalize options to objects
  const normalizedOptions: SelectOption[] = useMemo(
    () =>
      options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option)),
    [options],
  );

  const selectedOption = normalizedOptions.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
      return;
    }

    const selectedIndex = normalizedOptions.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [isOpen, normalizedOptions, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseButtonClasses =
    variant === 'dark'
      ? 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between min-h-[44px] outline-none focus:ring-2 focus:ring-brand-300/40 transition-all text-left text-white'
      : 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm cursor-pointer flex items-center justify-between min-h-[44px] outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-left';

  const menuClasses =
    variant === 'dark'
      ? 'absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-2 animate-in fade-in zoom-in-95 duration-100'
      : 'absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-2 animate-in fade-in zoom-in-95 duration-100';

  const getOptionClasses = (isSelected: boolean, isActive: boolean) => {
    if (variant === 'dark') {
      if (isSelected) return 'w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors flex justify-between items-center bg-brand-500 text-white';
      if (isActive) return 'w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex justify-between items-center bg-white/10 text-white';
      return 'w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex justify-between items-center text-slate-200 hover:bg-white/10';
    }

    if (isSelected) return 'w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors flex justify-between items-center bg-brand-50 text-brand-700';
    if (isActive) return 'w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex justify-between items-center bg-slate-100 text-slate-700';
    return 'w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex justify-between items-center text-slate-600 hover:bg-slate-50';
  };

  const selectByIndex = (index: number) => {
    const option = normalizedOptions[index];
    if (!option) return;
    onChange(option.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const onButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(normalizedOptions.length, 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? Math.max(normalizedOptions.length - 1, 0) : prev - 1,
      );
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (activeIndex >= 0) {
        selectByIndex(activeIndex);
      }
    }
  };

  return (
    <div className={`space-y-2 relative ${className}`} ref={containerRef}>
      {label && (
        <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${variant === 'dark' ? 'text-slate-300' : 'text-slate-400'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          ref={buttonRef}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={onButtonKeyDown}
          disabled={disabled}
          aria-label={ariaLabel || label || placeholder}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          className={`${baseButtonClasses} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {selectedOption ? (
            <span className={`${variant === 'dark' ? 'text-white font-semibold' : 'text-slate-900 font-bold'}`}>{selectedOption.label}</span>
          ) : (
            <span className={variant === 'dark' ? 'text-slate-300' : 'text-slate-400'}>{placeholder}</span>
          )}
          
          <div className={`${variant === 'dark' ? 'text-slate-300' : 'text-slate-400'} ml-2`}>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div id={listboxId} role="listbox" className={menuClasses}>
            {normalizedOptions.map((option, index) => (
              <button
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  selectByIndex(index);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={getOptionClasses(value === option.value, activeIndex === index)}
              >
                {option.label}
                {value === option.value && (
                  <span className={variant === 'dark' ? 'text-white' : 'text-brand-600'}>✓</span>
                )}
              </button>
            ))}
            {normalizedOptions.length === 0 && (
              <div className={`px-4 py-3 text-sm text-center ${variant === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>No options</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
