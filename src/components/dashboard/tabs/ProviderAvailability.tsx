import React from 'react';
import ScheduleBuilder from '../../ScheduleBuilder';
import { Availability } from '../../../types';

interface ProviderAvailabilityProps {
  availability: Availability;
  onUpdateAvailability: (val: Availability) => void;
  onSave: () => void;
}

const ProviderAvailability: React.FC<ProviderAvailabilityProps> = ({ availability, onUpdateAvailability, onSave }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 min-h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-2">
       <div className="flex justify-between items-center mb-8">
          <div>
             <h2 className="text-xl font-black text-slate-900 mb-1">Availability Settings</h2>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Manage your recurring weekly hours</p>
          </div>
          <button 
             onClick={onSave}
             className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg"
          >
             Save Changes
          </button>
       </div>

       <div className="max-w-3xl">
          <p className="text-sm text-slate-500 mb-6">Set your standard operating hours. You can block specific dates in the calendar view.</p>
          <ScheduleBuilder 
             value={availability}
             onChange={(val) => {
                onUpdateAvailability(val);
             }}
          />
       </div>
    </div>
  );
};

export default ProviderAvailability;
