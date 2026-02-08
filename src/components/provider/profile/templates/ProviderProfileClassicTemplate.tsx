import React, { Suspense } from 'react';
import { BlogPost, Endorsement, ProviderProfile, User } from '@/types';
import { EndorseButton } from '@/components/provider/EndorseButton';
import { EndorsementCard } from '@/components/provider/EndorsementCard';
import { Badge, Card, Icon } from '@/components/ui';
import { iconPaths } from '@/components/ui/iconPaths';
import { Heading, Label, Text } from '@/components/typography';
import { ProviderProfileViewModel } from '@/features/provider-profile/model/buildProviderProfileViewModel';
import { ProviderProfileThemeConfig } from '@/config/providerProfileThemes';
import ProfileIntroVideoCard from './shared/ProfileIntroVideoCard';
import ProfileBookingCard from './shared/ProfileBookingCard';
import ProfileExchangePromoCard from './shared/ProfileExchangePromoCard';
import ProfileStickyActions from './shared/ProfileStickyActions';

interface ProviderProfileClassicTemplateProps {
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
  themeConfig: ProviderProfileThemeConfig;
}

const ProviderProfileClassicTemplate: React.FC<ProviderProfileClassicTemplateProps> = ({
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
  themeConfig,
}) => {
  return (
    <div
      className="bg-[#F8FAFC] min-h-screen pb-28"
      data-testid={`provider-profile-theme-${themeConfig.key.toLowerCase()}`}
    >
      <div className={`h-[280px] relative overflow-hidden ${themeConfig.heroShellClass}`}>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className={`pointer-events-none absolute -left-24 top-2 h-64 w-64 rounded-full blur-3xl ${themeConfig.heroGlowPrimaryClass}`} />
        <div className={`pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full blur-3xl ${themeConfig.heroGlowSecondaryClass}`} />
      </div>

      <div className="mx-auto -mt-28 max-w-[1440px] px-4 md:px-6 relative z-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card className="rounded-[2rem] border-slate-100 shadow-lg shadow-slate-200/50 p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-[140px_minmax(0,1fr)] items-start">
                <div className="relative mx-auto md:mx-0">
                  <img
                    src={provider.imageUrl}
                    alt={model.identity.fullName}
                    className="h-36 w-36 rounded-3xl object-cover border border-slate-200"
                  />
                  {model.identity.isVerified && (
                    <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
                      <Icon path={iconPaths.shield} size={14} />
                    </span>
                  )}
                </div>
                <div>
                  <Heading level={1} className="text-slate-900 text-3xl leading-tight">
                    {model.identity.fullName}
                    {model.identity.pronouns && (
                      <span className="ml-2 text-lg font-semibold text-slate-400">
                        ({model.identity.pronouns})
                      </span>
                    )}
                  </Heading>
                  <Text className={`mt-1 font-bold ${themeConfig.accentTextClass}`}>
                    {model.identity.credentialLine}
                  </Text>
                  <Text variant="small" className="mt-1 text-slate-500 font-semibold">
                    {model.identity.trustMicrocopy}
                  </Text>
                  <Text className="mt-4 italic text-slate-600">"{model.identity.positioningLine}"</Text>
                  {model.identity.headline && (
                    <Text className="mt-2 text-slate-600">{model.identity.headline}</Text>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {model.identity.experienceYears && model.identity.isVerified && (
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${themeConfig.badgeEmphasisClass}`}
                      >
                        {model.identity.experienceYears}+ years
                      </span>
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

            <nav
              aria-label="Provider profile sections"
              className="sticky top-20 z-20 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm overflow-x-auto"
            >
              <div className="flex gap-2">
                {model.sections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => onSelectTab(section.elementId, section.label)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wide ${
                      activeTab === section.label
                        ? themeConfig.tabActiveClass
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </nav>

            <Card
              id="section-introduction"
              ref={registerSection('section-introduction')}
              className="scroll-mt-36 rounded-3xl border-slate-100 p-6 md:p-8 relative overflow-hidden"
            >
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${themeConfig.sectionRailClassByKey.introduction}`}
              />
              <Heading level={2}>Introduction</Heading>
              <Text className="mt-3 text-slate-600">{model.introduction.lead}</Text>

              <div className="mt-5 space-y-3">
                {model.introduction.expectations.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className={`mt-1 ${themeConfig.accentTextClass}`}>
                      <Icon path={iconPaths.shield} size={14} />
                    </span>
                    <Text className="text-slate-700">{item}</Text>
                  </div>
                ))}
              </div>

              <Text variant="small" className="mt-5 text-slate-500">
                {model.introduction.disclaimer}
              </Text>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <Label className="mb-3">Specialties</Label>
                  <div className="flex flex-wrap gap-2">
                    {model.introduction.specialties.map((specialty) => (
                      <Badge key={specialty} variant="info">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-3">Ages served</Label>
                  <div className="flex flex-wrap gap-2">
                    {model.introduction.agesServed.map((item) => (
                      <Badge key={item} variant="neutral">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-3">Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {model.introduction.languages.map((language) => (
                      <Badge key={language} variant="success">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card
              id="section-credentials"
              ref={registerSection('section-credentials')}
              className="scroll-mt-36 rounded-3xl border-slate-100 p-6 md:p-8 relative overflow-hidden"
            >
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${themeConfig.sectionRailClassByKey.credentials}`}
              />
              <Heading level={2}>Credentials & Background</Heading>
              <Text className="mt-2 text-sm text-slate-500">
                Verified credentials help clients make informed decisions.
              </Text>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <Label className="mb-3">Education</Label>
                  {model.credentials.education.length === 0 ? (
                    <Text variant="small" color="muted">No education details added yet.</Text>
                  ) : (
                    <div className="space-y-3">
                      {model.credentials.education.map((item, idx) => (
                        <div key={`${item.degree}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <Text weight="bold">{item.degree}</Text>
                          <Text variant="small" color="muted">
                            {item.institution}{item.year ? ` • ${item.year}` : ''}
                          </Text>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="mb-3">Licenses</Label>
                  {model.credentials.licenses.length === 0 ? (
                    <Text variant="small" color="muted">No license details added yet.</Text>
                  ) : (
                    <div className="space-y-3">
                      {model.credentials.licenses.map((license, idx) => (
                        <div key={`${license.state}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <Text weight="bold">
                            {license.state} License
                            {license.number ? ` - #${license.number}` : ''}
                          </Text>
                          <Text variant="small" color="muted">
                            {license.verified ? 'Verified' : 'Pending verification'}
                          </Text>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Text variant="small" className="mt-5 text-slate-500">
                {model.credentials.verificationMicrocopy}
              </Text>
            </Card>

            <Card
              id="section-endorsements"
              ref={registerSection('section-endorsements')}
              className="scroll-mt-36 rounded-3xl border-slate-100 p-6 md:p-8 relative overflow-hidden"
            >
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${themeConfig.sectionRailClassByKey.endorsements}`}
              />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Heading level={2}>Trust & Endorsements</Heading>
                  <Text className="mt-1 text-sm text-slate-500">
                    Verified endorsements highlight professional credibility and collaboration.
                  </Text>
                </div>
                <EndorseButton provider={provider} onSuccess={onEndorseSuccess} />
              </div>

              <div className="mt-6">
                {peerEndorsements.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <Text weight="bold">{model.endorsements.emptyTitle}</Text>
                    <Text variant="small" color="muted" className="mt-1">
                      {model.endorsements.emptyCopy}
                    </Text>
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
              className="scroll-mt-36 rounded-3xl border-slate-100 p-6 md:p-8 relative overflow-hidden"
            >
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${themeConfig.sectionRailClassByKey.media}`}
              />
              <Heading level={2}>Media & Appearances</Heading>
              <Text className="mt-1 text-sm text-slate-500">
                Talks, podcasts, interviews, and public education.
              </Text>
              <div className="mt-6 space-y-3">
                {model.media.items.length === 0 ? (
                  <Text color="muted">{model.media.emptyCopy}</Text>
                ) : (
                  model.media.items.map((item) => (
                    <a
                      key={item.id}
                      href={item.href || '#'}
                      target={item.href ? '_blank' : undefined}
                      rel={item.href ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-slate-300"
                    >
                      <div>
                        <Badge variant="neutral">{item.type}</Badge>
                        <Text weight="bold" className="mt-2">{item.title}</Text>
                        {item.source && (
                          <Text variant="small" color="muted">{item.source}</Text>
                        )}
                      </div>
                      <span className={`text-xs font-black uppercase tracking-wide ${themeConfig.accentTextClass}`}>
                        {item.type === 'Podcast' ? 'Listen' : 'Watch'}
                      </span>
                    </a>
                  ))
                )}
              </div>
            </Card>

            <Card
              id="section-articles"
              ref={registerSection('section-articles')}
              className="scroll-mt-36 rounded-3xl border-slate-100 p-6 md:p-8 relative overflow-hidden"
            >
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${themeConfig.sectionRailClassByKey.articles}`}
              />
              <Heading level={2}>Articles & Insights</Heading>
              <Text className="mt-1 text-sm text-slate-500">
                Educational writing from this provider. Informational only.
              </Text>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {blogs.length === 0 ? (
                  <Text color="muted">No articles published yet.</Text>
                ) : (
                  model.articles.items.map((article) => (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => onViewArticle(article.slug)}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-slate-300"
                    >
                      <Text weight="bold">{article.title}</Text>
                      <Text variant="small" color="muted" className="mt-1 line-clamp-2">
                        {article.excerpt}
                      </Text>
                      <Text variant="small" className={`mt-3 font-bold ${themeConfig.accentTextClass}`}>
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
              className="scroll-mt-36 rounded-3xl border-slate-100 p-6 md:p-8 relative overflow-hidden"
            >
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${themeConfig.sectionRailClassByKey.location}`}
              />
              <Heading level={2}>Office Location</Heading>
              <Text className="mt-1 text-sm text-slate-500">
                In-person availability may vary by schedule.
              </Text>
              <div className="mt-6 h-80 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
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

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <ProfileIntroVideoCard
              videoUrl={provider.videoUrl}
              className={themeConfig.rightRailCardClass}
            />
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
              className={themeConfig.rightRailCardClass}
              accentTextClassName={themeConfig.bookingAccentTextClass}
              primaryButtonClassName={themeConfig.bookingPrimaryButtonClass}
              slotSelectedClassName={themeConfig.bookingSlotSelectedClass}
            />
            <ProfileExchangePromoCard
              onBrowseExchange={onBrowseExchange}
              className={themeConfig.exchangeCardClass}
              iconClassName={themeConfig.exchangeIconClass}
              linkClassName={themeConfig.exchangeLinkClass}
            />
          </aside>
        </div>
      </div>

      <ProfileStickyActions
        onBook={() => onSectionAction('section-introduction', 'Introduction')}
        onSave={onSaveToWishlist}
        onChatWithEvo={onChatWithEvo}
        primaryButtonClassName={themeConfig.stickyPrimaryButtonClass}
      />
    </div>
  );
};

export default ProviderProfileClassicTemplate;
