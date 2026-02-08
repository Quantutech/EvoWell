import React from 'react';
import { ProviderProfile } from '@/types';
import { Card, CardBody, Badge, Button, Icon } from '@/components/ui';
import { Heading, Text } from '@/components/typography';
import { useNavigation } from '@/App';
import { EndorsementBadge } from './EndorsementBadge';
import { WishlistButton } from './WishlistButton';
import { iconPaths } from '@/components/ui/iconPaths';

interface ProviderCardProps {
  provider: ProviderProfile;
  className?: string;
  isSaved?: boolean;
  onToggleSave?: (saved: boolean) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, className, isSaved, onToggleSave }) => {
  const { navigate } = useNavigation();

  const getNextAvailable = (days: string[]) => {
    if (!days || days.length === 0) return "Contact for Availability";
    return `Next ${days[0]} at 9:00 AM`; 
  };

  const displayName = provider.firstName ? `Dr. ${provider.firstName} ${provider.lastName}` : `Dr. ${provider.id.split('-')[1].toUpperCase()}`;

  return (
    <Card className={`group p-0 overflow-hidden relative ${className}`} hoverable>
      <div className="absolute top-2 right-2 z-30">
        <WishlistButton 
          providerId={provider.id} 
          initialIsSaved={isSaved} 
          onToggle={onToggleSave}
        />
      </div>
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
                    {provider.pricing.slidingScale && (
                      <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-2.5 py-1 rounded-md border border-brand-200 shadow-sm mt-1" title="This provider offers flexible pricing based on income">
                        <span className="text-[10px] font-black uppercase tracking-widest">Sliding Scale Available</span>
                      </div>
                    )}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 my-3 text-[11px] font-medium text-slate-600 border-y border-slate-50 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon path={iconPaths.education} className="w-3 h-3" />
                  </span>
                  <span className="font-bold">{provider.yearsExperience} Years Exp.</span>
                </div>
                {/* Note: Star ratings removed in favor of professional endorsements */}
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon path={iconPaths.pin} className="w-3 h-3" />
                  </span>
                  <span className="font-bold">{provider.address?.city || 'Remote'}, {provider.address?.state}</span>
                </div>
              </div>

              {/* Endorsements Row */}
              {(provider.endorsements?.evowell || (provider.endorsements?.peerCount ?? 0) > 0) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.endorsements?.evowell && <EndorsementBadge type="evowell" />}
                  {(provider.endorsements?.peerCount ?? 0) > 0 && (
                    <EndorsementBadge type="peer" count={provider.endorsements?.peerCount} />
                  )}
                </div>
              )}
              <Text variant="small" color="muted" className="mb-4 line-clamp-2">"{provider.bio}"</Text>
              <div className="flex flex-wrap gap-2 mb-4">
                {provider.languages.map(lang => <Badge key={lang} variant="neutral">{lang}</Badge>)}
                <Badge variant="brand">{getNextAvailable(provider.availability.days)}</Badge>
              </div>
          </div>
          <div className="flex gap-3">
              <Button fullWidth onClick={() => navigate(`#/provider/${provider.profileSlug || provider.id}`)}>Book Appointment</Button>
              <Button fullWidth variant="secondary" onClick={() => navigate(`#/provider/${provider.profileSlug || provider.id}`)}>View Profile</Button>
          </div>
        </CardBody>
      </div>
    </Card>
  );
};

export default ProviderCard;
