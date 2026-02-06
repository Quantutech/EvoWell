import React from 'react';

const ProviderDocuments: React.FC = () => {
  return (
    <div className="bg-white rounded-[2.5rem] p-12 border border-slate-200 text-center shadow-sm">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Clinical Documents</h3>
      <p className="text-slate-500 text-sm">Upload and manage practice documents.</p>
    </div>
  );
};

export default ProviderDocuments;
