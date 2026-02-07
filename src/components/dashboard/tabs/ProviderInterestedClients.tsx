import React, { useEffect, useState } from 'react';
import { WishlistEntry } from '@/types';
import { wishlistService } from '@/services/wishlist.service';
import { useAuth } from '@/App';
import { Card } from '@/components/ui';
import { Heading, Text } from '@/components/typography';
import ProfileImage from '@/components/ui/ProfileImage';

const ProviderInterestedClients: React.FC = () => {
  const { provider } = useAuth();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (provider) {
        fetchInterested();
    }
  }, [provider]);

  const fetchInterested = async () => {
    if (!provider) return;
    setLoading(true);
    try {
      const data = await wishlistService.getWishlistedBy(provider.id);
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch interested clients", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading interested clients...</div>;

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
         <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
           <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
         </div>
         <Heading level={4}>No clients have saved your profile yet</Heading>
         <Text className="text-slate-500">
           As clients browse and save your profile, they will appear here.
         </Text>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading level={2}>Interested Clients</Heading>
        <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full text-sm">{items.length} total</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
             <div className="flex items-center gap-4">
                <ProfileImage src={item.client?.imageUrl} alt={`${item.client?.firstName} ${item.client?.lastName}`} className="w-12 h-12 rounded-full" />
                <div>
                   <Heading level={4} className="mb-0.5">{item.client?.firstName} {item.client?.lastName?.charAt(0)}.</Heading>
                   <Text variant="small" className="text-slate-500">
                     {item.client?.location || 'Location hidden'}
                   </Text>
                   <Text variant="small" className="text-slate-400 text-[10px] mt-1">
                     Saved {new Date(item.createdAt).toLocaleDateString()}
                   </Text>
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProviderInterestedClients;
