import { EvoSafetyFlag } from './types';

const CRISIS_KEYWORDS = [
  'suicide',
  'self-harm',
  'self harm',
  'kill myself',
  'overdose',
  "can't breathe",
  'cannot breathe',
  'chest pain',
  'abuse',
  'assault',
  'emergency',
];

const MEDICAL_ADVICE_KEYWORDS = [
  'what do i have',
  'diagnose',
  'diagnosis',
  'treatment plan',
  'should i take',
  'side effects',
  'dose',
  'dosage',
  'medication',
  'medicine',
  'prescribe',
];

const LEGAL_FINANCIAL_KEYWORDS = [
  'legal advice',
  'sue',
  'lawsuit',
  'tax',
  'investment advice',
  'financial guarantee',
];

function hasKeywordMatch(input: string, keywords: string[]): boolean {
  return keywords.some((keyword) => input.includes(keyword));
}

export function detectSafetyFlags(message: string | undefined): EvoSafetyFlag[] {
  if (!message?.trim()) return [];
  const normalized = message.toLowerCase();
  const flags = new Set<EvoSafetyFlag>();

  if (hasKeywordMatch(normalized, CRISIS_KEYWORDS)) {
    flags.add('CRISIS');
  }

  if (
    hasKeywordMatch(normalized, MEDICAL_ADVICE_KEYWORDS) ||
    normalized.includes('what do i have')
  ) {
    flags.add('MEDICAL_ADVICE');
  }

  if (
    normalized.includes('dose') ||
    normalized.includes('dosage') ||
    normalized.includes('medication') ||
    normalized.includes('side effect')
  ) {
    flags.add('MEDICATION');
  }

  if (hasKeywordMatch(normalized, LEGAL_FINANCIAL_KEYWORDS)) {
    flags.add('LEGAL_FINANCIAL');
  }

  return Array.from(flags);
}

export function isCrisisMessage(message: string | undefined): boolean {
  return detectSafetyFlags(message).includes('CRISIS');
}

export function resolveSafetyCopy(flags: EvoSafetyFlag[]): string | null {
  if (flags.includes('CRISIS')) return null;
  if (flags.includes('MEDICATION')) {
    return "I can't advise on medications or dosing. For medication questions, it's safest to ask a licensed clinician or pharmacist. I can help you find an appropriate provider.";
  }
  if (flags.includes('MEDICAL_ADVICE')) {
    return "I can't provide medical advice, diagnose, or recommend treatment. I can help you find the right kind of provider or resources on EvoWell.";
  }
  if (flags.includes('LEGAL_FINANCIAL')) {
    return 'I can share general guidance, but I can’t provide legal or financial advice as certainty. For decisions, consult a licensed professional.';
  }
  return null;
}

