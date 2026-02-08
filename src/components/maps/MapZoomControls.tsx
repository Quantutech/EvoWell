import React from 'react';

interface MapZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  disabled?: boolean;
  className?: string;
}

const MapZoomControls: React.FC<MapZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  disabled = false,
  className,
}) => {
  return (
    <div className={className}>
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 flex flex-col overflow-hidden">
        <button
          aria-label="Zoom in"
          disabled={disabled}
          onClick={onZoomIn}
          className="p-3 hover:bg-slate-50 text-slate-600 transition-colors border-b border-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
        <button
          aria-label="Zoom out"
          disabled={disabled}
          onClick={onZoomOut}
          className="p-3 hover:bg-slate-50 text-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
        </button>
      </div>
    </div>
  );
};

export default MapZoomControls;

