import React, { useEffect, useState } from 'react';
import { WishlistEntry } from '@/types';
import { wishlistService } from '@/services/wishlist.service';
import ProviderCard from '@/components/provider/ProviderCard';
import { Heading, Text } from '@/components/typography';
import { Button } from '@/components/ui';
import { useNavigation } from '@/App';

const ClientSavedProviders: React.FC = () => {
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigate } = useNavigation();

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const data = await wishlistService.getSavedProviders();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch saved providers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = (providerId: string, saved: boolean) => {
    if (!saved) {
      // Remove from list immediately
      setItems(prev => prev.filter(item => item.providerId !== providerId));
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading saved providers...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
           <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </div>
        <Heading level={3} className="mb-2">No saved providers yet</Heading>
        <Text className="text-slate-500 mb-6 max-w-md mx-auto">
          Browse our directory to find providers that match your needs and save them here for quick access.
        </Text>
        <Button onClick={() => navigate('#/directory')}>Browse Directory</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading level={2}>Saved Providers</Heading>
        <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full text-sm">{items.length} saved</span>
      </div>
      
      <div className="space-y-4">
        {items.map(item => (
           item.provider && (
             <ProviderCard 
               key={item.id} 
               provider={item.provider} 
               className="w-full shadow-sm hover:shadow-md transition-all border border-slate-200"
               isSaved={true} 
               onToggleSave={(saved) => handleToggleSave(item.providerId, saved)}
             />
           )
        ))}
      </div>
    </div>
  );
};

export default ClientSavedProviders;
