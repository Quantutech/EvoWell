
import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth, useNavigation } from '../../App';

interface CheckoutButtonProps {
  providerId: string;
  price: number;
  title: string;
  date?: string; // Optional for immediate booking
  className?: string;
  label?: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ 
  providerId, price, title, date, className, label = "Book & Pay" 
}) => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate('#/login');
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = window.location.href.split('#')[0] + '#/dashboard'; // Return to client dashboard
      
      const { data, error } = await supabase.functions.invoke('stripe-payments', {
        body: {
          action: 'create_checkout',
          providerId,
          clientId: user.id,
          price,
          title,
          appointmentDate: date, // e.g. "2024-03-20T10:00:00Z"
          redirectUrl
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }

    } catch (err: any) {
      console.error(err);
      alert('Failed to initialize checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading}
      className={className || "bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"}
    >
      {loading ? 'Preparing...' : label}
    </button>
  );
};

export default CheckoutButton;
