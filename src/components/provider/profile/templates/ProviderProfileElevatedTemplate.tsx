import React, { Suspense } from 'react';
import { BlogPost, Endorsement, ProviderProfile, User } from '@/types';
import { EndorseButton } from '@/components/provider/EndorseButton';
import { EndorsementCard } from '@/components/provider/EndorsementCard';
import { Badge, Card, Icon } from '@/components/ui';
import { iconPaths } from '@/components/ui/iconPaths';
import { Heading, Label, Text } from '@/components/typography';
import { ProviderProfileViewModel } from '@/features/provider-profile/model/buildProviderProfileViewModel';
import ProfileIntroVideoCard from './shared/ProfileIntroVideoCard';
import ProfileBookingCard from './shared/ProfileBookingCard';
import ProfileExchangePromoCard from './shared/ProfileExchangePromoCard';
import ProfileStickyActions from './shared/ProfileStickyActions';

interface ProviderProfileElevatedTemplateProps {
  provider: ProviderProfile;
  user: User | null;
  model: ProviderProfileViewModel;
  activeTab: string;
  onSelectTab: (elementId: string, label: string) => void;
  registerSection: (id: string) => (el: HTMLElement | null) => void;
  userTimezone: string;
  bookingMode: 'In Person' | 'Online';
  setBookingMode: (mode: 'In Person' | 'Online') => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedSlot: string | null;
  setSelectedSlot: (slot: string | null) => void;
  availableDates: Date[];
  availableSlots: Date[];
  slotsLoading: boolean;
  bookingStatus: 'idle' | 'booking' | 'success' | 'error';
  onConfirmBooking: () => void;
  onSignInToBook: () => void;
  onSaveToWishlist: () => void;
  onChatWithEvo: () => void;
  onBrowseExchange: () => void;
  onViewArticle: (slug: string) => void;
  onSectionAction: (elementId: string, label: string) => void;
  onEndorseSuccess: () => void;
  renderMap: () => React.ReactNode;
  blogs: BlogPost[];
  peerEndorsements: Endorsement[];
}

const ProviderProfileElevatedTemplate: React.FC<ProviderProfileElevatedTemplateProps> = ({
  provider,
  user,
  model,
  activeTab,
  onSelectTab,
  registerSection,
  userTimezone,
  bookingMode,
  setBookingMode,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  availableDates,
  availableSlots,
  slotsLoading,
  bookingStatus,
  onConfirmBooking,
  onSignInToBook,
  onSaveToWishlist,
  onChatWithEvo,
  onBrowseExchange,
  onViewArticle,
  onSectionAction,
  onEndorseSuccess,
  renderMap,
  blogs,
  peerEndorsements,
}) => {
  return (
    <div className="min-h-screen bg-[#F3F6FB] pb-28">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 md:py-14">
        <div className="pointer-events-none absolute -left-20 top-4 h-64 w-64 rounded-full bg-brand-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-8 h-72 w-72 rounded-full bg-sky-300/15 blur-3xl" />
        <div className="mx-auto max-w-[1440px] px-4 md:px-6">
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <Card className="self-start rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-xl shadow-slate-900/10">
              <div className="flex flex-col gap-6 lg:flex-row">
                <img
                  src={provider.imageUrl}
                  alt={model.identity.fullName}
                  className="h-36 w-36 rounded-3xl border border-slate-200 object-cover shadow-md"
                />
                <div className="min-w-0">
                  <Label
                    variant="overline"
                    color="brand"
                    className="mb-2 inline-block rounded-full border border-brand-100 bg-brand-50 px-3 py-1"
                  >
                    EvoWell Signature Profile
                  </Label>
                  <Heading level={1} className="text-3xl text-slate-900">
                    {model.identity.fullName}
                  </Heading>
                  <Text className="mt-1 font-bold text-brand-700">{model.identity.credentialLine}</Text>
                  {model.identity.pronouns && (
                    <Text variant="small" className="mt-1 text-slate-500">
                      {model.identity.pronouns}
                    </Text>
                  )}
                  <Text className="mt-4 text-slate-700">{model.identity.positioningLine}</Text>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {model.identity.experienceYears && model.identity.isVerified && (
                      <Badge variant="neutral">{model.identity.experienceYears}+ years</Badge>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${model.identity.status.badgeClassName}`}
                    >
                      {model.identity.status.label}
                    </span>
                    {model.identity.sessionFormats.map((format) => (
                      <Badge key={format} variant="info">
                        {format}
                      </Badge>
                    ))}
                  </div>
                  <Text variant="small" className="mt-2 text-slate-500">
                    {model.identity.availabilityMicrocopy}
                  </Text>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <ProfileIntroVideoCard videoUrl={provider.videoUrl} />
              <ProfileBookingCard
                rateLabel={model.booking.rateLabel}
                supportsSlidingScale={model.booking.supportsSlidingScale}
                bookingMode={bookingMode}
                setBookingMode={setBookingMode}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                availableDates={availableDates}
                availableSlots={availableSlots}
                slotsLoading={slotsLoading}
                userTimezone={userTimezone}
                bookingStatus={bookingStatus}
                isAuthenticated={!!user}
                onConfirmBooking={onConfirmBooking}
                onSignInToBook={onSignInToBook}
                onSaveToWishlist={onSaveToWishlist}
              />
              <ProfileExchangePromoCard onBrowseExchange={onBrowseExchange} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        <nav className="sticky top-20 z-20 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex gap-2">
            {model.sections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => onSelectTab(section.elementId, section.label)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wide ${
                  activeTab === section.label
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-6 grid gap-6">
          <Card
            id="section-introduction"
            ref={registerSection('section-introduction')}
            className="scroll-mt-36 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-slate-900" />
            <Heading level={2}>Introduction</Heading>
            <Text className="mt-3 text-slate-700">{model.introduction.lead}</Text>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {model.introduction.expectations.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-600">
                    <Icon path={iconPaths.shield} size={14} />
                  </div>
                  <Text variant="small" className="text-slate-700">{item}</Text>
                </div>
              ))}
            </div>
            <Text variant="small" className="mt-4 text-slate-500">
              {model.introduction.disclaimer}
            </Text>
            <div className="mt-5 flex flex-wrap gap-2">
              {model.introduction.specialties.map((specialty) => (
                <Badge key={specialty} variant="info">{specialty}</Badge>
              ))}
              {model.introduction.agesServed.map((item) => (
                <Badge key={item} variant="neutral">{item}</Badge>
              ))}
              {model.introduction.languages.map((language) => (
                <Badge key={language} variant="success">{language}</Badge>
              ))}
            </div>
          </Card>

          <Card
            id="section-credentials"
            ref={registerSection('section-credentials')}
            className="scroll-mt-36 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-brand-600" />
            <Heading level={2}>Credentials & Background</Heading>
            <Text className="mt-2 text-sm text-slate-500">
              Verified credentials help clients make informed decisions.
            </Text>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Label className="mb-3">Education</Label>
                {model.credentials.education.length === 0 ? (
                  <Text variant="small" color="muted">No education details added yet.</Text>
                ) : (
                  model.credentials.education.map((item, idx) => (
                    <div key={`${item.degree}-${idx}`} className="mb-3 last:mb-0">
                      <Text weight="bold">{item.degree}</Text>
                      <Text variant="small" color="muted">
                        {item.institution}{item.year ? ` • ${item.year}` : ''}
                      </Text>
                    </div>
                  ))
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Label className="mb-3">Licenses</Label>
                {model.credentials.licenses.length === 0 ? (
                  <Text variant="small" color="muted">No license details added yet.</Text>
                ) : (
                  model.credentials.licenses.map((license, idx) => (
                    <div key={`${license.state}-${idx}`} className="mb-3 last:mb-0">
                      <Text weight="bold">
                        {license.state} License{license.number ? ` - #${license.number}` : ''}
                      </Text>
                      <Text variant="small" color="muted">
                        {license.verified ? 'Verified' : 'Pending verification'}
                      </Text>
                    </div>
                  ))
                )}
              </div>
            </div>
            <Text variant="small" className="mt-4 text-slate-500">
              {model.credentials.verificationMicrocopy}
            </Text>
          </Card>

          <Card
            id="section-endorsements"
            ref={registerSection('section-endorsements')}
            className="scroll-mt-36 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-brand-600" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Heading level={2}>Trust & Endorsements</Heading>
                <Text className="mt-1 text-sm text-slate-500">
                  Verified endorsements highlight professional credibility and collaboration.
                </Text>
              </div>
              <EndorseButton provider={provider} onSuccess={onEndorseSuccess} />
            </div>
            <div className="mt-5">
              {peerEndorsements.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                  <Text weight="bold">{model.endorsements.emptyTitle}</Text>
                  <Text variant="small" color="muted" className="mt-1">{model.endorsements.emptyCopy}</Text>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {peerEndorsements.map((endorsement) => (
                    <EndorsementCard key={endorsement.id} endorsement={endorsement} />
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card
            id="section-media"
            ref={registerSection('section-media')}
            className="scroll-mt-36 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-brand-600" />
            <Heading level={2}>Media & Appearances</Heading>
            <Text className="mt-1 text-sm text-slate-500">
              Talks, podcasts, interviews, and public education.
            </Text>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {model.media.items.length === 0 ? (
                <Text color="muted">{model.media.emptyCopy}</Text>
              ) : (
                model.media.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.href || '#'}
                    target={item.href ? '_blank' : undefined}
                    rel={item.href ? 'noopener noreferrer' : undefined}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-brand-200"
                  >
                    <Badge variant="neutral">{item.type}</Badge>
                    <Text weight="bold" className="mt-2">{item.title}</Text>
                    {item.source && <Text variant="small" color="muted">{item.source}</Text>}
                    <Text variant="small" className="mt-2 font-bold text-brand-700">
                      {item.type === 'Podcast' ? 'Listen' : 'Watch'}
                    </Text>
                  </a>
                ))
              )}
            </div>
          </Card>

          <Card
            id="section-articles"
            ref={registerSection('section-articles')}
            className="scroll-mt-36 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-brand-600" />
            <Heading level={2}>Articles & Insights</Heading>
            <Text className="mt-1 text-sm text-slate-500">
              Educational writing from this provider. Informational only.
            </Text>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {blogs.length === 0 ? (
                <Text color="muted">No articles published yet.</Text>
              ) : (
                model.articles.items.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => onViewArticle(article.slug)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-brand-200"
                  >
                    <Text weight="bold">{article.title}</Text>
                    <Text variant="small" color="muted" className="mt-1 line-clamp-2">
                      {article.excerpt}
                    </Text>
                    <Text variant="small" className="mt-2 font-bold text-brand-700">
                      Read article
                    </Text>
                  </button>
                ))
              )}
            </div>
            <Text variant="small" className="mt-4 text-slate-500">
              {model.articles.disclaimer}
            </Text>
          </Card>

          <Card
            id="section-location"
            ref={registerSection('section-location')}
            className="scroll-mt-36 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-brand-600" />
            <Heading level={2}>Office Location</Heading>
            <Text className="mt-1 text-sm text-slate-500">
              In-person availability may vary by schedule.
            </Text>
            <div className="mt-5 h-80 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {model.location.hasMap ? (
                <Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-100" />}>
                  {renderMap()}
                </Suspense>
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <div>
                    <Text weight="bold">Map preview unavailable</Text>
                    <Text variant="small" color="muted">
                      Address details are shown below.
                    </Text>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-1">
              <Text weight="bold">{model.location.addressLine}</Text>
              <Text variant="small" color="muted">{model.location.cityStateLine}</Text>
              {model.location.accessibilityNotes && (
                <Text variant="small" color="muted">
                  Accessibility notes: {model.location.accessibilityNotes}
                </Text>
              )}
            </div>
          </Card>
        </div>
      </div>

      <ProfileStickyActions
        onBook={() => onSectionAction('section-introduction', 'Introduction')}
        onSave={onSaveToWishlist}
        onChatWithEvo={onChatWithEvo}
      />
    </div>
  );
};

export default ProviderProfileElevatedTemplate;
