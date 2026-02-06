import React, { useState, useEffect } from 'react';
import { ProviderProfile, SubscriptionTier, SubscriptionStatus } from '@/types';
import { Button, Card, Badge } from '@/components/ui';
import { Heading, Text, Label } from '@/components/typography';
import { supabase, isConfigured } from '@/services/supabase';
import { useAuth } from '@/App';

interface ProviderSubscriptionTabProps {
  provider: ProviderProfile;
  onUpgrade: (tier: SubscriptionTier) => Promise<void>;
}

interface Invoice {
    id: string;
    date: string;
    amount: number;
    status: string;
    plan: string;
    pdfUrl: string;
    number: string;
}

const PACKAGES = [
  {
    id: SubscriptionTier.FREE,
    name: 'Starter',
    price: 30,
    description: 'Essential tools to get your practice online.',
    features: [
      'Basic Directory Listing',
      'Standard Profile Page',
      'Patient Inquiries',
      'Standard Email Support'
    ],
    popular: false
  },
  {
    id: SubscriptionTier.PROFESSIONAL,
    name: 'Professional',
    price: 99,
    description: 'Advanced features for growing practices.',
    features: [
      'Everything in Starter',
      'Verified Provider Badge',
      'Priority Search Ranking',
      'Analytics Dashboard',
      'Appointment Scheduling',
      'Digital Product Sales'
    ],
    popular: true
  },
  {
    id: SubscriptionTier.PREMIUM,
    name: 'Premium',
    price: 299,
    description: 'Maximum visibility and concierge support.',
    features: [
      'Everything in Professional',
      'Featured Homepage Placement',
      'Concierge Onboarding',
      'Unlimited Blog Posts',
      'API Access',
      'Dedicated Account Manager'
    ],
    popular: false
  },
];

const MOCK_INVOICES: Invoice[] = [
    {
        id: 'inv_mock_1',
        date: new Date().toISOString(),
        amount: 99.00,
        status: 'paid',
        plan: 'Professional Plan',
        pdfUrl: '#',
        number: 'INV-2024-001'
    },
    {
        id: 'inv_mock_2',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 99.00,
        status: 'paid',
        plan: 'Professional Plan',
        pdfUrl: '#',
        number: 'INV-2024-002'
    },
    {
        id: 'inv_mock_3',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 30.00,
        status: 'paid',
        plan: 'Starter Plan',
        pdfUrl: '#',
        number: 'INV-2023-012'
    }
];

export const ProviderSubscriptionTab: React.FC<ProviderSubscriptionTabProps> = ({ provider, onUpgrade }) => {
  const { user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const currentPlan = PACKAGES.find(p => p.id === provider.subscriptionTier) || PACKAGES[0];
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 14); // Mock date

  useEffect(() => {
    // Check for success return
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
        setSuccessMessage('Payment successful! Your subscription has been updated.');
        // Clear param without reload
        window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }

    fetchBillingHistory();
  }, []);

  const fetchBillingHistory = async () => {
    setLoadingInvoices(true);

    // --- MOCK MODE ---
    if (!isConfigured) {
        await new Promise(r => setTimeout(r, 600)); // Simulate latency
        setInvoices(MOCK_INVOICES);
        setLoadingInvoices(false);
        return;
    }
    
    try {
        const { data, error } = await supabase.functions.invoke('stripe-payments', {
            body: {
                action: 'get_billing_history',
                providerId: provider.id
            }
        });
        if (error) throw error;
        setInvoices(data.invoices || []);
    } catch (err) {
        console.error('Failed to fetch invoices', err);
    } finally {
        setLoadingInvoices(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);

    // --- MOCK MODE ---
    if (!isConfigured) {
        await new Promise(r => setTimeout(r, 600));
        alert("MOCK MODE: In production, this would redirect you to the Stripe Customer Portal to manage cards and subscriptions.");
        setPortalLoading(false);
        return;
    }

    try {
        const { data, error } = await supabase.functions.invoke('stripe-payments', {
            body: {
                action: 'create_portal_session',
                providerId: provider.id,
                redirectUrl: window.location.href
            }
        });
        if (error) throw error;
        if (data?.url) window.location.href = data.url;
    } catch (err: any) {
        alert(err.message || "Failed to open billing portal");
    } finally {
        setPortalLoading(false);
    }
  };

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    setLoadingTier(tier);

    // --- MOCK MODE ---
    if (!isConfigured) {
        await new Promise(r => setTimeout(r, 1000));
        setSuccessMessage(`MOCK MODE: Successfully upgraded to ${tier} plan!`);
        setLoadingTier(null);
        return;
    }

    try {
      const redirectUrl = window.location.href.split('?')[0]; 
      
      const { data, error } = await supabase.functions.invoke('stripe-payments', {
        body: {
          action: 'create_subscription_checkout',
          providerId: provider.id,
          tier,
          userEmail: user?.email,
          userName: `${user?.firstName} ${user?.lastName}`,
          redirectUrl
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }

    } catch (error: any) {
      console.error('Failed to upgrade', error);
      alert(error.message || 'Failed to initialize subscription. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 font-bold flex items-center gap-2">
            <span>✓</span> {successMessage}
        </div>
      )}
      
      {/* ── Current Plan Header ────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Label variant="overline" color="muted">Current Plan</Label>
              <Badge variant={provider.subscriptionStatus === SubscriptionStatus.ACTIVE ? 'success' : 'warning'}>
                {provider.subscriptionStatus}
              </Badge>
            </div>
            <Heading level={2} className="mb-2">{currentPlan.name} Plan</Heading>
            <Text color="muted">
              {provider.trialEndsAt 
                ? `Trial ends on ${new Date(provider.trialEndsAt).toLocaleDateString()}` 
                : `Next billing date: ${nextBillingDate.toLocaleDateString()}`
              }
            </Text>
          </div>

          <div className="flex gap-4">
             <div className="bg-slate-50 rounded-2xl p-4 min-w-[140px]">
                <Label variant="overline" color="muted" className="mb-1">Amount</Label>
                <div className="text-xl font-black text-slate-900">${currentPlan.price}<span className="text-sm font-medium text-slate-400">/mo</span></div>
             </div>
             <div className="bg-slate-50 rounded-2xl p-4 min-w-[140px]">
                <Label variant="overline" color="muted" className="mb-1">Member Since</Label>
                <div className="text-xl font-black text-slate-900">{new Date(provider.audit.createdAt).getFullYear()}</div>
             </div>
          </div>
        </div>
      </div>

      {/* ── Available Packages ─────────────────────────────── */}
      <div>
        <div className="flex justify-between items-end mb-8">
           <Heading level={3}>Available Packages</Heading>
           <Text variant="small" color="muted">Switch plans anytime. Prorated charges apply.</Text>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {PACKAGES.map(pkg => {
            const isCurrent = pkg.id === provider.subscriptionTier;
            return (
              <div 
                key={pkg.id} 
                className={`relative rounded-[2rem] p-8 border transition-all duration-300 flex flex-col ${
                  isCurrent 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.02]' 
                    : pkg.popular 
                      ? 'bg-white border-brand-200 ring-4 ring-brand-50 shadow-lg' 
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'
                }`}
              >
                {pkg.popular && !isCurrent && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-lg font-black mb-2 ${isCurrent ? 'text-white' : 'text-slate-900'}`}>{pkg.name}</h3>
                  <p className={`text-sm ${isCurrent ? 'text-slate-400' : 'text-slate-500'}`}>{pkg.description}</p>
                </div>

                <div className="mb-8">
                  <span className={`text-4xl font-black ${isCurrent ? 'text-white' : 'text-slate-900'}`}>${pkg.price}</span>
                  <span className={`text-sm font-medium ${isCurrent ? 'text-slate-500' : 'text-slate-400'}`}>/month</span>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  {pkg.features.map((feature, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isCurrent ? 'bg-slate-800 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                        ✓
                      </div>
                      <span className={isCurrent ? 'text-slate-300' : 'text-slate-600'}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant={isCurrent ? 'secondary' : pkg.id === SubscriptionTier.PROFESSIONAL ? 'brand' : 'primary'}
                  className={`w-full ${isCurrent ? 'bg-slate-800 text-white border-none hover:bg-slate-700' : ''}`}
                  disabled={isCurrent || loadingTier !== null}
                  onClick={() => handleSelectPlan(pkg.id)}
                >
                  {isCurrent ? 'Current Plan' : loadingTier === pkg.id ? 'Processing...' : 'Upgrade'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Payment History ────────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
         <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <Heading level={3} size="h4">Billing History</Heading>
            <Button variant="ghost" size="sm" onClick={handleManageBilling} disabled={portalLoading}>
                {portalLoading ? 'Opening...' : 'Manage Billing'}
            </Button>
         </div>
         <table className="w-full text-left">
            <thead className="bg-slate-50">
               <tr>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {loadingInvoices ? (
                 <tr>
                    <td colSpan={5} className="px-8 py-8 text-center text-slate-500">
                        Loading billing history...
                    </td>
                 </tr>
               ) : invoices.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="px-8 py-8 text-center text-slate-500">
                        No billing history found.
                    </td>
                 </tr>
               ) : (
                 invoices.map(pay => (
                 <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 text-sm font-bold text-slate-700">{new Date(pay.date).toLocaleDateString()}</td>
                    <td className="px-8 py-5 text-sm text-slate-600">{pay.plan}</td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-900">${pay.amount.toFixed(2)}</td>
                    <td className="px-8 py-5">
                       <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${pay.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {pay.status}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <a href={pay.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 text-xs font-bold hover:underline">Download</a>
                    </td>
                 </tr>
               ))
             )}
            </tbody>
         </table>
      </div>

    </div>
  );
};
