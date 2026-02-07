import React, { useState, useEffect } from 'react';

interface InlineEditCellProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  type?: 'text' | 'select';
  options?: { label: string; value: string }[];
}

export const InlineEditCell: React.FC<InlineEditCellProps> = ({ 
  value: initialValue, 
  onSave, 
  type = 'text',
  options 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    if (value === initialValue) {
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      setValue(initialValue);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
        {type === 'text' ? (
          <input 
            autoFocus
            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500/20 w-full"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            disabled={isLoading}
          />
        ) : (
          <select
            autoFocus
            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500/20 w-full"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={handleSave}
            disabled={isLoading}
          >
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
        {isLoading && <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>}
      </div>
    );
  }

  return (
    <div 
      className="group flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-100/50 px-2 py-1 rounded transition-colors"
      onClick={() => setIsEditing(true)}
    >
      <span className="text-sm">{value}</span>
      <svg className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </div>
  );
};
