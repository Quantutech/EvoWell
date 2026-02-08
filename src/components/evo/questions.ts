import { Question, UserSignal } from './types';

const isClient = (signal: Partial<UserSignal>) => signal.roleContext === 'CLIENT';
const isProvider = (signal: Partial<UserSignal>) => signal.roleContext === 'PROVIDER';
const isBrowsing = (signal: Partial<UserSignal>) =>
  signal.roleContext === 'BROWSING' || signal.roleContext === 'ADMIN';
const isClientMatchingFlow = (signal: Partial<UserSignal>) =>
  isClient(signal) && (signal.clientIntent === 'FIND_PROVIDER' || signal.clientIntent === 'UNSURE');

const hasPreference = (signal: Partial<UserSignal>, key: string) =>
  (signal.preferenceFilters || []).includes(key);

export const QUESTIONS: Question[] = [
  {
    id: 'roleContext',
    text: 'What are you here for?',
    options: [
      { label: "I'm looking for a provider", value: 'CLIENT' },
      { label: "I'm a provider using EvoWell", value: 'PROVIDER' },
      { label: "I'm just browsing", value: 'BROWSING' },
    ],
    trigger: (signal) => !signal.roleContext,
  },
  {
    id: 'initialRequest',
    text: 'What can I help you with right now?',
    inputType: 'text',
    placeholder: 'Ask Evo anything about EvoWell...',
    allowSkip: true,
  },
  {
    id: 'clientIntent',
    text: 'How can I help you today?',
    options: [
      { label: 'Find a provider', value: 'FIND_PROVIDER' },
      { label: "I don't know what I need", value: 'UNSURE' },
      { label: 'Explore resources', value: 'EXPLORE_RESOURCES' },
      { label: 'Account help', value: 'ACCOUNT_HELP' },
      { label: 'Crisis or urgent situation', value: 'CRISIS' },
    ],
    trigger: isClient,
  },
  {
    id: 'providerIntent',
    text: 'What do you want to do?',
    options: [
      { label: 'Finish my profile', value: 'FINISH_PROFILE' },
      { label: 'Set availability', value: 'SET_AVAILABILITY' },
      { label: 'Set my sliding-scale membership', value: 'SET_MEMBERSHIP' },
      { label: 'Publish a resource', value: 'PUBLISH_RESOURCE' },
      { label: 'Troubleshoot something', value: 'TROUBLESHOOT' },
    ],
    trigger: isProvider,
  },
  {
    id: 'browsingIntent',
    text: 'What would you like to explore?',
    options: [
      { label: 'Find providers', value: 'FIND_PROVIDER' },
      { label: 'Learn about EvoWell', value: 'LEARN_PLATFORM' },
      { label: 'Explore Exchange resources', value: 'EXPLORE_EXCHANGE' },
      { label: 'Become a provider', value: 'BECOME_PROVIDER' },
    ],
    trigger: isBrowsing,
  },
  {
    id: 'unsureTopic',
    text: 'Which feels closest right now?',
    options: [
      { label: 'Anxiety or stress', value: 'ANXIETY_STRESS' },
      { label: 'Low mood', value: 'LOW_MOOD' },
      { label: 'Relationship conflict', value: 'RELATIONSHIP_CONFLICT' },
      { label: 'Focus/ADHD concerns', value: 'FOCUS_ADHD' },
      { label: 'Sleep issues', value: 'SLEEP' },
      { label: 'Body pain or movement concerns', value: 'BODY_PAIN' },
      { label: 'Food or nutrition concerns', value: 'NUTRITION' },
      { label: 'Something else', value: 'OTHER', isCustom: true },
    ],
    trigger: (signal) => isClient(signal) && signal.clientIntent === 'UNSURE',
  },
  {
    id: 'urgencyState',
    text: 'Is this urgent or are you feeling unsafe right now?',
    options: [
      { label: 'Yes (urgent)', value: 'URGENT' },
      { label: 'No', value: 'SAFE' },
    ],
    trigger: (signal) => isClient(signal) && signal.clientIntent === 'UNSURE',
  },
  {
    id: 'supportNeeds',
    text: 'What kind of support are you looking for?',
    options: [
      { label: 'Therapy / Counseling', value: 'THERAPY' },
      { label: 'Coaching', value: 'COACHING' },
      { label: 'Nutrition', value: 'NUTRITION' },
      { label: 'Physical therapy / Movement', value: 'MOVEMENT' },
      { label: 'Sleep', value: 'SLEEP' },
      { label: 'Stress / Burnout', value: 'STRESS_BURNOUT' },
      { label: 'Couples / Relationships', value: 'COUPLES' },
      { label: 'Other', value: 'OTHER', isCustom: true },
    ],
    multiSelect: true,
    trigger: (signal) => isClient(signal) && signal.clientIntent === 'FIND_PROVIDER',
  },
  {
    id: 'preferenceFilters',
    text: 'Any preferences that matter most?',
    options: [
      { label: 'Language', value: 'LANGUAGE' },
      { label: 'Session format', value: 'SESSION_FORMAT' },
      { label: 'Availability (evenings/weekends)', value: 'AVAILABILITY' },
      { label: 'Budget', value: 'BUDGET' },
      { label: 'Insurance', value: 'INSURANCE' },
      { label: 'Provider gender preference', value: 'PROVIDER_GENDER' },
      { label: 'Faith/culture-informed care', value: 'CULTURE' },
      { label: 'No preference', value: 'NO_PREFERENCE' },
    ],
    multiSelect: true,
    trigger: isClientMatchingFlow,
  },
  {
    id: 'sessionFormat',
    text: 'Which session format works best?',
    options: [
      { label: 'Online', value: 'ONLINE' },
      { label: 'In-person', value: 'IN_PERSON' },
      { label: 'Open to either', value: 'EITHER' },
    ],
    trigger: isClientMatchingFlow,
  },
  {
    id: 'location',
    text: 'Which city/area should we use?',
    inputType: 'text',
    placeholder: 'Example: San Francisco, CA',
    allowSkip: true,
    trigger: (signal) => isClientMatchingFlow(signal) && signal.sessionFormat !== 'ONLINE',
  },
  {
    id: 'preferredLanguage',
    text: 'Preferred language?',
    inputType: 'text',
    placeholder: 'Example: English or Spanish',
    allowSkip: true,
    trigger: (signal) => isClientMatchingFlow(signal) && hasPreference(signal, 'LANGUAGE'),
  },
  {
    id: 'availabilityPreference',
    text: 'What availability is best?',
    options: [
      { label: 'Evenings', value: 'EVENINGS' },
      { label: 'Weekends', value: 'WEEKENDS' },
      { label: 'Flexible', value: 'FLEXIBLE' },
    ],
    trigger: (signal) => isClientMatchingFlow(signal) && hasPreference(signal, 'AVAILABILITY'),
  },
  {
    id: 'budgetRange',
    text: 'Do you have a budget range per session?',
    options: [
      { label: 'Under $120', value: 'UNDER_120' },
      { label: '$120-$200', value: '120_200' },
      { label: '$200+', value: '200_PLUS' },
      { label: 'Not sure', value: 'NOT_SURE' },
    ],
    trigger: (signal) => isClientMatchingFlow(signal) && hasPreference(signal, 'BUDGET'),
  },
  {
    id: 'insurancePreference',
    text: 'Do you want providers who accept insurance?',
    options: [
      { label: 'Yes', value: 'YES' },
      { label: 'No (self-pay is fine)', value: 'NO' },
      { label: 'Not sure', value: 'NOT_SURE' },
    ],
    trigger: (signal) => isClientMatchingFlow(signal) && hasPreference(signal, 'INSURANCE'),
  },
  {
    id: 'insurer',
    text: 'Which insurer should we match?',
    inputType: 'text',
    placeholder: 'Example: Aetna, Cigna, BlueCross',
    allowSkip: true,
    trigger: (signal) => isClientMatchingFlow(signal) && signal.insurancePreference === 'YES',
  },
  {
    id: 'providerGenderPreference',
    text: 'Provider gender preference?',
    options: [
      { label: 'Female', value: 'FEMALE' },
      { label: 'Male', value: 'MALE' },
      { label: 'Non-binary', value: 'NON_BINARY' },
      { label: 'No preference', value: 'NO_PREFERENCE' },
    ],
    trigger: (signal) => isClientMatchingFlow(signal) && hasPreference(signal, 'PROVIDER_GENDER'),
  },
  {
    id: 'culturalPreference',
    text: 'Any faith/culture-informed preference?',
    inputType: 'text',
    placeholder: 'Optional details',
    allowSkip: true,
    trigger: (signal) => isClientMatchingFlow(signal) && hasPreference(signal, 'CULTURE'),
  },
  {
    id: 'sortPreference',
    text: 'How should I sort results?',
    options: [
      { label: 'Soonest availability', value: 'SOONEST' },
      { label: 'Budget fit', value: 'BUDGET' },
      { label: 'Specialization match', value: 'SPECIALIZATION' },
    ],
    trigger: isClientMatchingFlow,
  },
  {
    id: 'providerProfileStatus',
    text: "What's your current profile status?",
    options: [
      { label: "I haven't started", value: 'NOT_STARTED' },
      { label: 'Profile drafted', value: 'DRAFTED' },
      { label: 'Verification pending', value: 'VERIFICATION_PENDING' },
      { label: 'Verified but not live', value: 'VERIFIED_NOT_LIVE' },
      { label: 'Live already', value: 'LIVE' },
    ],
    trigger: (signal) => isProvider(signal) && signal.providerIntent === 'FINISH_PROFILE',
  },
  {
    id: 'providerMembershipNow',
    text: 'Do you want to set your price now?',
    options: [
      { label: 'Yes', value: 'YES' },
      { label: 'Not now', value: 'NOT_NOW' },
    ],
    trigger: (signal) => isProvider(signal) && signal.providerIntent === 'SET_MEMBERSHIP',
  },
  {
    id: 'providerStage',
    text: 'Which best describes your current stage?',
    options: [
      { label: 'Early-stage / rebuilding', value: 'EARLY' },
      { label: 'Steady caseload', value: 'STEADY' },
      { label: 'Fully booked / growing', value: 'GROWING' },
    ],
    trigger: (signal) => isProvider(signal) && signal.providerIntent === 'SET_MEMBERSHIP',
  },
  {
    id: 'publishResourceType',
    text: 'What do you want to publish?',
    options: [
      { label: 'Worksheet / template', value: 'WORKSHEET' },
      { label: 'Guide / toolkit', value: 'GUIDE' },
      { label: 'Course', value: 'COURSE' },
      { label: 'Audio/video resource', value: 'AUDIO_VIDEO' },
      { label: 'Other', value: 'OTHER', isCustom: true },
    ],
    trigger: (signal) => isProvider(signal) && signal.providerIntent === 'PUBLISH_RESOURCE',
  },
  {
    id: 'publishAudience',
    text: 'Who is it for?',
    options: [
      { label: 'Clients', value: 'CLIENTS' },
      { label: 'Other providers', value: 'PROVIDERS' },
      { label: 'Both', value: 'BOTH' },
    ],
    trigger: (signal) => isProvider(signal) && signal.providerIntent === 'PUBLISH_RESOURCE',
  },
  {
    id: 'publishPricing',
    text: 'Pricing?',
    options: [
      { label: 'Free', value: 'FREE' },
      { label: 'Paid', value: 'PAID' },
      { label: 'Not sure', value: 'NOT_SURE' },
    ],
    trigger: (signal) => isProvider(signal) && signal.providerIntent === 'PUBLISH_RESOURCE',
  },
  {
    id: 'publishPrice',
    text: 'Enter a price (USD)',
    inputType: 'text',
    placeholder: 'Example: 49',
    allowSkip: true,
    trigger: (signal) =>
      isProvider(signal) &&
      signal.providerIntent === 'PUBLISH_RESOURCE' &&
      signal.publishPricing === 'PAID',
  },
  {
    id: 'publishNeedsDisclaimer',
    text: 'Should Evo include compliance disclaimers?',
    options: [
      { label: 'Yes, include them', value: 'YES' },
      { label: 'No, skip for now', value: 'NO' },
    ],
    trigger: (signal) => isProvider(signal) && signal.providerIntent === 'PUBLISH_RESOURCE',
  },
  {
    id: 'troubleshootingArea',
    text: "What's not working?",
    options: [
      { label: 'Login / account', value: 'LOGIN_ACCOUNT' },
      { label: 'Profile not showing', value: 'PROFILE_NOT_SHOWING' },
      { label: 'Booking/availability', value: 'BOOKING_AVAILABILITY' },
      { label: 'Payments/payouts', value: 'PAYMENTS_PAYOUTS' },
      { label: 'Verification', value: 'VERIFICATION' },
      { label: 'Marketplace publishing', value: 'MARKETPLACE_PUBLISHING' },
      { label: 'Something else', value: 'OTHER' },
    ],
    trigger: (signal) => isProvider(signal) && signal.providerIntent === 'TROUBLESHOOT',
  },
  {
    id: 'troubleshootingError',
    text: 'If available, share the exact error text.',
    inputType: 'text',
    placeholder: 'Paste the error message (optional)',
    allowSkip: true,
    trigger: (signal) => isProvider(signal) && signal.providerIntent === 'TROUBLESHOOT',
  },
];

