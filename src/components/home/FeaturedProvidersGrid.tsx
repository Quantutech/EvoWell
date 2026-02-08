import React from 'react';
import { useNavigation } from '@/App';
import { ProviderProfile } from '@/types';
import { Button } from '@/components/ui';
import { Container, Section } from '@/components/layout';
import { Heading, Label, Text } from '@/components/typography';

interface FeaturedProvider extends ProviderProfile {
  firstName: string;
  lastName: string;
}

interface FeaturedProvidersGridProps {
  providers: FeaturedProvider[];
  title: string;
  subhead: string;
  microcopy: string;
  ctaLabel: string;
  previewLabel?: string;
}

const FeaturedProvidersGrid: React.FC<FeaturedProvidersGridProps> = ({
  providers,
  title,
  subhead,
  microcopy,
  ctaLabel,
  previewLabel,
}) => {
  const { navigate } = useNavigation();
  const visibleProviders = providers.slice(0, 8);

  return (
    <Section spacing="lg" background="white">
      <Container>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            {previewLabel && (
              <Label variant="overline" color="muted" className="mb-3 block">
                {previewLabel}
              </Label>
            )}
            <Heading level={2} className="mb-3">
              {title}
            </Heading>
            <Text className="max-w-3xl text-slate-600">{subhead}</Text>
          </div>

          <Button variant="secondary" onClick={() => navigate('/search')}>
            {ctaLabel}
          </Button>
        </div>

        {visibleProviders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
            <Text className="text-slate-500">
              Featured providers are loading. Check back in a moment.
            </Text>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {visibleProviders.map((provider) => {
              const identifier = provider.profileSlug || provider.id;
              const displayName = `${provider.firstName} ${provider.lastName}`;
              const specialty = provider.specialties[0] || provider.professionalCategory || 'Wellness support';
              const imageSrc =
                provider.imageUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e2e8f0&color=334155&bold=true`;

              return (
                <article
                  key={provider.id}
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  onClick={() => navigate(`/provider/${identifier}`)}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={imageSrc}
                      alt={displayName}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 p-5">
                    <Label variant="badge" color="brand">
                      Verified Provider
                    </Label>
                    <Heading level={4} className="text-slate-900">
                      {displayName}
                    </Heading>
                    <Text variant="small" className="text-slate-500">
                      {specialty}
                    </Text>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Text variant="small" className="mt-6 text-slate-500">
          {microcopy}
        </Text>
      </Container>
    </Section>
  );
};

export default FeaturedProvidersGrid;
