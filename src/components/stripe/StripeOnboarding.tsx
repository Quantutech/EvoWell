
import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { ProviderProfile } from '../../types';

interface StripeOnboardingProps {
  provider: ProviderProfile;
  onUpdate: () => void;
}

const StripeOnboarding: React.FC<StripeOnboardingProps> = ({ provider, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      // 1. Check if account exists, if not create one
      let accountId = provider.businessInfo?.stripeAccountId;
      
      if (!accountId) {
        const { data: createData, error: createError } = await supabase.functions.invoke('stripe-connect', {
          body: { action: 'create_account', providerId: provider.id, userId: provider.userId }
        });
        if (createError) throw createError;
        accountId = createData.accountId;
      }

      // 2. Create Account Link for onboarding
      const returnUrl = window.location.href; // Returns to current settings page
      const { data: linkData, error: linkError } = await supabase.functions.invoke('stripe-connect', {
        body: { action: 'create_account_link', accountId, returnUrl }
      });

      if (linkError) throw linkError;

      // 3. Redirect
      window.location.href = linkData.url;

    } catch (err: any) {
      alert(`Connection failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleDashboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect', {
        body: { action: 'create_login_link', accountId: provider.businessInfo?.stripeAccountId }
      });
      if (error) throw error;
      window.open(data.url, '_blank');
    } catch (err) {
      alert("Could not access dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!provider.businessInfo?.stripeAccountId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect', {
        body: { action: 'check_status', accountId: provider.businessInfo?.stripeAccountId }
      });
      if (!error && data) {
        onUpdate(); // Trigger parent refresh to get new DB status
        alert("Status updated!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isComplete = provider.businessInfo?.stripeOnboardingComplete;
  const isEnabled = provider.businessInfo?.stripeChargesEnabled;

  return (
    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
            Payout Settings
            {isEnabled ? (
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">Active</span>
            ) : (
              <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">Setup Required</span>
            )}
          </h3>
          <p className="text-slate-500 text-sm max-w-md">
            Connect a Stripe Express account to receive payouts for your sessions and digital products. EvoWell processes payments securely and transfers earnings to your bank.
          </p>
        </div>

        <div className="flex flex-col gap-3 min-w-[200px]">
          {!isComplete ? (
            <button 
              onClick={handleConnect} 
              disabled={loading}
              className="bg-[#635BFF] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-[#635BFF]/20 hover:bg-[#534be0] transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Connect Stripe'}
            </button>
          ) : (
            <>
              <button 
                onClick={handleDashboard}
                disabled={loading}
                className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                View Payouts Dashboard
              </button>
              <button 
                onClick={handleRefreshStatus}
                className="text-xs text-slate-400 font-bold hover:text-slate-600 underline"
              >
                Refresh Status
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripeOnboarding;
