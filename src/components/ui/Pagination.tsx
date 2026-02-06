
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || isLoading}
        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Previous
      </button>
      
      <span className="text-xs font-bold text-slate-400">
        Page {currentPage} of {totalPages}
      </span>

      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || isLoading}
        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
