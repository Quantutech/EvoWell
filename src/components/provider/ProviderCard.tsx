import React from 'react';
import { ProviderProfile } from '@/types';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import { Heading, Text, Label } from '@/components/typography';
import { useNavigation } from '@/App';

interface ProviderCardProps {
  provider: ProviderProfile;
  className?: string;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, className }) => {
  const { navigate } = useNavigation();

  const getNextAvailable = (days: string[]) => {
    if (!days || days.length === 0) return "Contact for Availability";
    return `Next ${days[0]} at 9:00 AM`; 
  };

  const displayName = provider.firstName ? `Dr. ${provider.firstName} ${provider.lastName}` : `Dr. ${provider.id.split('-')[1].toUpperCase()}`;

  return (
    <Card className={`reveal group p-0 overflow-hidden ${className}`} hoverable>
      <div className="flex flex-col md:flex-row h-full">
        <div className="md:w-60 lg:w-64 shrink-0 bg-slate-100 relative min-h-[250px] md:min-h-full">
          <img src={provider.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={displayName} />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end md:hidden text-white">
              <span className="font-bold">{provider.address?.city}</span>
              <Badge variant="brand">Available</Badge>
          </div>
        </div>
        <CardBody className="p-6 flex flex-col justify-between">
          <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Heading level={3} className="leading-tight">{displayName}</Heading>
                      <Badge variant="info">Verified</Badge>
                    </div>
                    <Text variant="small" color="muted" weight="bold">{provider.professionalTitle}</Text>
                </div>
                <div className="hidden md:flex flex-col items-end">
                    <Heading level={3}>${provider.pricing.hourlyRate}<span className="text-[11px] text-slate-500 font-bold">/hr</span></Heading>
                    {provider.pricing.slidingScale && <Label color="success">Sliding Scale</Label>}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 my-3 text-[11px] font-medium text-slate-600 border-y border-slate-50 py-3">
                <div className="flex items-center gap-2"><span className="text-base">🎓</span><span className="font-bold">{provider.yearsExperience} Years Exp.</span></div>
                <div className="flex items-center gap-2"><span className="text-base">⭐</span><span className="font-bold">{provider.averageRating || 'New'} ({provider.totalReviews || 0})</span></div>
                <div className="flex items-center gap-2"><span className="text-base">📍</span><span className="font-bold">{provider.address?.city || 'Remote'}, {provider.address?.state}</span></div>
              </div>
              <Text variant="small" color="muted" className="mb-4 line-clamp-2">"{provider.bio}"</Text>
              <div className="flex flex-wrap gap-2 mb-4">
                {provider.languages.map(lang => <Badge key={lang} variant="neutral">{lang}</Badge>)}
                <Badge variant="brand">{getNextAvailable(provider.availability.days)}</Badge>
              </div>
          </div>
          <div className="flex gap-3">
              <Button fullWidth onClick={() => navigate(`#/provider/${provider.id}`)}>Book Appointment</Button>
              <Button fullWidth variant="secondary" onClick={() => navigate(`#/provider/${provider.id}`)}>View Profile</Button>
          </div>
        </CardBody>
      </div>
    </Card>
  );
};

export default ProviderCard;
