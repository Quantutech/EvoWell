import { Question } from './types';

export const QUESTIONS: Question[] = [
  // QUESTION 0: User Role Identification
  {
    id: 'user_role',
    text: "First things first, what brings you to the EvoWell ecosystem?",
    options: [
      { label: 'Client', value: 'Client' },
      { label: 'Provider', value: 'Provider' },
      { label: 'Partner', value: 'Partner' },
      { label: 'Investor', value: 'Investor' }
    ]
  },

  // LAYER 1 (Clients Only)
  {
    id: 'primary_concern',
    text: "Let's start with the big picture. What’s on your mind today?",
    options: [
      { label: 'Stress & Overwhelm', value: 'Stress' },
      { label: 'Anxiety or Worry', value: 'Anxiety' },
      { label: 'Burnout & Fatigue', value: 'Burnout' },
      { label: 'Relationship Dynamics', value: 'Relationships' },
      { label: 'Personal Growth', value: 'Personal growth' },
      { label: 'Leadership Challenges', value: 'Leadership' },
      { label: 'Just feeling off', value: 'Not sure' },
      { label: 'Something else', value: 'Other', isCustom: true }
    ],
    multiSelect: true,
    trigger: (s) => s.user_role === 'Client' && s.intensity_level !== 'crisis'
  },
  {
    id: 'intensity_level',
    text: "And how heavy does this feel right now?",
    options: [
      { label: 'Manageable', value: 'low' },
      { label: 'Moderate impact', value: 'moderate' },
      { label: 'Significant impact', value: 'significant' },
      { label: "I'm in crisis", value: 'crisis' }
    ],
    trigger: (s) => s.user_role === 'Client'
  },
  {
    id: 'duration',
    text: "Has this been lingering for a while, or is it a new development?",
    options: [
      { label: 'Just recently', value: 'recent' },
      { label: 'A few weeks', value: 'weeks' },
      { label: 'Several months', value: 'months' },
      { label: 'A long time', value: 'long_time' }
    ],
    trigger: (s) => s.user_role === 'Client' && s.intensity_level !== 'crisis'
  },
  {
    id: 'support_goal',
    text: "How do you prefer to tackle challenges?",
    options: [
      { label: 'Talking it through', value: 'talk' },
      { label: 'Practical tools & strategy', value: 'tools' },
      { label: 'Deep self-exploration', value: 'insight' },
      { label: 'I\'m open to suggestions', value: 'unsure' }
    ],
    trigger: (s) => s.user_role === 'Client' && s.intensity_level !== 'crisis'
  },
  {
    id: 'prior_support',
    text: "Have you worked with a therapist or coach before?",
    options: [
      { label: 'Yes, I have', value: 'yes' },
      { label: 'No, this is new', value: 'no' },
      { label: 'Prefer not to say', value: 'undisclosed' }
    ],
    trigger: (s) => s.user_role === 'Client' && s.intensity_level !== 'crisis'
  },

  // LAYER 2 (Clients Only)
  {
    id: 'language',
    text: "Is there a specific language you'd be most comfortable using?",
    options: [
      { label: 'English', value: 'English' },
      { label: 'Spanish', value: 'Spanish' },
      { label: 'French', value: 'French' },
      { label: 'German', value: 'German' },
    ],
    multiSelect: true,
    trigger: (s) => s.user_role === 'Client' && s.intensity_level !== 'crisis'
  },
  {
    id: 'preferred_specialties',
    text: "Are there specific nuances you'd like your provider to understand?",
    options: [
        { label: 'Anxiety', value: 'Anxiety' },
        { label: 'Trauma history', value: 'Trauma' },
        { label: 'Burnout recovery', value: 'Burnout' },
        { label: 'Executive leadership', value: 'Leadership' },
        { label: 'Family systems', value: 'Relationships' },
        { label: 'Emotional regulation', value: 'Emotional regulation' },
        { label: 'Other', value: 'Other', isCustom: true }
    ],
    trigger: (s) => s.user_role === 'Client' && s.intensity_level !== 'crisis' && (s.primary_concern === 'Not sure' || (s.primary_concern?.includes('Other') ?? false))
  },
  {
    id: 'preferred_modalities',
    text: "Do you have a preferred therapeutic style?",
    options: [
      { label: 'Structured (CBT)', value: 'cbt' },
      { label: 'Body-focused (Somatic)', value: 'somatic' },
      { label: 'Reflective (Psychodynamic)', value: 'psychodynamic' },
      { label: 'Not sure', value: 'unsure' }
    ],
    trigger: (s) => s.user_role === 'Client' && s.intensity_level !== 'crisis' && s.prior_support === 'yes'
  },
  {
    id: 'session_format',
    text: "How would you like to meet?",
    options: [
      { label: 'Video / Online', value: 'online' },
      { label: 'In-person', value: 'in_person' },
      { label: 'Open to either', value: 'either' }
    ],
    trigger: (s) => s.user_role === 'Client' && s.intensity_level !== 'crisis'
  },
  {
    id: 'budget_sensitivity',
    text: "Last question: Is budget a primary factor in your decision?",
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'Somewhat', value: 'somewhat' },
      { label: 'Not a concern', value: 'no' }
    ],
    trigger: (s) => s.user_role === 'Client' && s.intensity_level !== 'crisis'
  }
];
