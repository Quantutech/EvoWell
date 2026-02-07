
import React, { useState } from 'react';
import { AppointmentType, ProviderProfile, ServicePackage } from '../../types';
import AvailabilityCalendar from './AvailabilityCalendar';
import { api } from '../../services/api';
import { useAuth } from '../../App';
import { useToast } from '../../contexts/ToastContext';

interface BookingModalProps {
  provider: ProviderProfile;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ provider, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  // Use the provider's first available package or fallback to hourly rate
  const packages = provider.servicePackages?.filter(p => p.isActive) || [];

  const handleBooking = async () => {
    if (!user || !selectedSlot) return;
    setLoading(true);

    try {
      const price = selectedPackage ? selectedPackage.priceCents / 100 : provider.pricing.hourlyRate;
      const amountCents = Math.round(price * 100);
      await api.createAppointment({
        providerId: provider.id,
        clientId: user.id,
        dateTime: selectedSlot.toISOString(),
        durationMinutes: selectedPackage?.durationMinutes || 60,
        type: AppointmentType.VIDEO,
        notes,
        amountCents,
      });

      addToast('success', 'Appointment request submitted.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      addToast('error', error instanceof Error ? error.message : 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900">Book Session</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              With Dr. {provider.lastName}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow">
          {step === 1 && (
            <div className="space-y-8">
              {/* Package Selection */}
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Select Service</p>
                <div className="grid gap-4">
                  {packages.map(pkg => (
                    <div 
                      key={pkg.id} 
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedPackage?.id === pkg.id ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{pkg.name}</span>
                        <span className="font-black text-slate-900">${pkg.priceCents / 100}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{pkg.durationMinutes} min • {pkg.description}</p>
                    </div>
                  ))}
                  {/* Default Hourly Option */}
                  <div 
                    onClick={() => setSelectedPackage(null)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedPackage === null ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Standard Consultation</span>
                      <span className="font-black text-slate-900">${provider.pricing.hourlyRate}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">60 min • General intake or follow-up session.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <AvailabilityCalendar 
                providerId={provider.id} 
                providerTimezone={provider.timezone || 'UTC'}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
              />
              
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes for Provider</label>
                 <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Anything specific you'd like to discuss?"
                    rows={3}
                 />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-50">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-700"
                >
                  Back
                </button>
                <button 
                  onClick={handleBooking}
                  disabled={!selectedSlot || loading}
                  className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm & Pay'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
