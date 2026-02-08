import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserRole } from '@/types';
import { useAuth } from '@/App';
import { Button } from '@/components/ui';
import { Heading, Text } from '@/components/typography';
import EvoIcon from './EvoIcon';
import { QUESTIONS } from './questions';
import {
  ClientIntent,
  EvoSafetyFlag,
  Question,
  UserSignal,
} from './types';
import { detectSafetyFlags, resolveSafetyCopy } from './intentRouter';
import { logEvoEvent } from './logging';

interface ConversationFlowProps {
  onComplete: (signal: UserSignal) => void;
  onClose: () => void;
}

const UNSURE_TOPIC_TO_SUPPORT: Record<string, string[]> = {
  ANXIETY_STRESS: ['THERAPY', 'STRESS_BURNOUT'],
  LOW_MOOD: ['THERAPY'],
  RELATIONSHIP_CONFLICT: ['COUPLES', 'THERAPY'],
  FOCUS_ADHD: ['THERAPY', 'COACHING'],
  SLEEP: ['SLEEP', 'THERAPY'],
  BODY_PAIN: ['MOVEMENT', 'COACHING'],
  NUTRITION: ['NUTRITION'],
};

function mapRoleToContext(role?: UserRole): UserSignal['roleContext'] | undefined {
  if (!role) return undefined;
  if (role === UserRole.CLIENT) return 'CLIENT';
  if (role === UserRole.PROVIDER) return 'PROVIDER';
  if (role === UserRole.ADMIN) return 'ADMIN';
  return undefined;
}

function uniqueFlags(existing: EvoSafetyFlag[] | undefined, incoming: EvoSafetyFlag[]): EvoSafetyFlag[] {
  const merged = new Set<EvoSafetyFlag>([...(existing || []), ...incoming]);
  return Array.from(merged);
}

function findNextQuestionIndex(startIndex: number, signal: Partial<UserSignal>): number {
  for (let index = startIndex + 1; index < QUESTIONS.length; index += 1) {
    const question = QUESTIONS[index];
    if (!question.trigger || question.trigger(signal)) {
      return index;
    }
  }
  return -1;
}

function findQuestionIndexById(id: keyof UserSignal): number {
  return QUESTIONS.findIndex((question) => question.id === id);
}

function toClientIntent(value: string): ClientIntent | undefined {
  if (value === 'FIND_PROVIDER' || value === 'UNSURE' || value === 'EXPLORE_RESOURCES' || value === 'ACCOUNT_HELP' || value === 'CRISIS') {
    return value;
  }
  return undefined;
}

const ConversationFlow: React.FC<ConversationFlowProps> = ({ onComplete, onClose }) => {
  const { user } = useAuth();
  const inferredRoleContext = useMemo(() => mapRoleToContext(user?.role), [user?.role]);

  const [signal, setSignal] = useState<Partial<UserSignal>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [showQuestion, setShowQuestion] = useState(false);
  const [safetyCopy, setSafetyCopy] = useState<string | null>(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seededSignal: Partial<UserSignal> = {};
    if (inferredRoleContext) {
      seededSignal.roleContext = inferredRoleContext;
    }

    const nextIndex = findNextQuestionIndex(-1, seededSignal);
    setSignal(seededSignal);
    setCurrentQuestionIndex(nextIndex === -1 ? 0 : nextIndex);
    setSelectedOptions([]);
    setCustomInput('');
    setSafetyCopy(null);
    setIsCrisis(false);
    setShowEmergencyOptions(false);

    const timer = setTimeout(() => setShowQuestion(true), 240);
    return () => clearTimeout(timer);
  }, [inferredRoleContext]);

  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [currentQuestionIndex, showQuestion, isCrisis]);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  const completeFlow = (finalSignal: Partial<UserSignal>) => {
    const normalizedSignal: UserSignal = {
      ...finalSignal,
      supportNeeds:
        finalSignal.supportNeeds && finalSignal.supportNeeds.length > 0
          ? finalSignal.supportNeeds
          : finalSignal.unsureTopic
            ? UNSURE_TOPIC_TO_SUPPORT[finalSignal.unsureTopic] || ['THERAPY']
            : finalSignal.supportNeeds,
    };

    logEvoEvent({
      type: 'intent',
      role: normalizedSignal.roleContext,
      intent:
        normalizedSignal.clientIntent ||
        normalizedSignal.providerIntent ||
        normalizedSignal.browsingIntent,
      success: true,
    });

    onComplete(normalizedSignal);
  };

  const goToNext = (updatedSignal: Partial<UserSignal>) => {
    const nextIndex = findNextQuestionIndex(currentQuestionIndex, updatedSignal);
    if (nextIndex === -1) {
      completeFlow(updatedSignal);
      return;
    }

    setShowQuestion(false);
    setTimeout(() => {
      setSignal(updatedSignal);
      setCurrentQuestionIndex(nextIndex);
      setSelectedOptions([]);
      setCustomInput('');
      setShowQuestion(true);
    }, 220);
  };

  const applySafetyChecks = (draftSignal: Partial<UserSignal>, text?: string): boolean => {
    const flags = detectSafetyFlags(text);
    if (flags.length === 0) {
      return false;
    }

    const mergedFlags = uniqueFlags(draftSignal.safetyFlags, flags);
    draftSignal.safetyFlags = mergedFlags;

    logEvoEvent({
      type: 'safety',
      role: draftSignal.roleContext,
      intent:
        draftSignal.clientIntent ||
        draftSignal.providerIntent ||
        draftSignal.browsingIntent,
      reason: flags.join(','),
      success: true,
    });

    if (flags.includes('CRISIS')) {
      setIsCrisis(true);
      setShowEmergencyOptions(false);
      setSignal(draftSignal);
      return true;
    }

    const copy = resolveSafetyCopy(flags);
    if (copy) setSafetyCopy(copy);

    return false;
  };

  const setValueAndAdvance = (question: Question, value: string | string[], maybeTextForSafety?: string) => {
    const updatedSignal: Partial<UserSignal> = {
      ...signal,
      [question.id]: value,
    };

    if (question.id === 'clientIntent') {
      const intent = toClientIntent(String(value));
      if (intent) updatedSignal.clientIntent = intent;
      if (intent === 'CRISIS') {
        updatedSignal.safetyFlags = uniqueFlags(updatedSignal.safetyFlags, ['CRISIS']);
        setSignal(updatedSignal);
        setIsCrisis(true);
        return;
      }
    }

    if (question.id === 'urgencyState' && value === 'URGENT') {
      updatedSignal.safetyFlags = uniqueFlags(updatedSignal.safetyFlags, ['CRISIS']);
      updatedSignal.urgencyState = 'URGENT';
      setSignal(updatedSignal);
      setIsCrisis(true);
      return;
    }

    const shouldHalt = applySafetyChecks(updatedSignal, maybeTextForSafety);
    if (shouldHalt) return;

    goToNext(updatedSignal);
  };

  const handleSingleSelect = (question: Question, value: string, isCustomOption: boolean) => {
    if (isCustomOption) {
      setSelectedOptions([value]);
      return;
    }

    setTimeout(() => {
      setValueAndAdvance(question, value);
    }, 140);
  };

  const handleMultiToggle = (value: string) => {
    setSelectedOptions((previous) =>
      previous.includes(value) ? previous.filter((entry) => entry !== value) : [...previous, value],
    );
  };

  const handleContinue = () => {
    if (!currentQuestion) return;

    if (currentQuestion.inputType === 'text') {
      const text = customInput.trim();
      if (!text && !currentQuestion.allowSkip) return;
      setValueAndAdvance(currentQuestion, text, text);
      return;
    }

    if (currentQuestion.multiSelect) {
      let values = selectedOptions;
      const selectedCustom = currentQuestion.options?.find(
        (option) => option.isCustom && selectedOptions.includes(option.value),
      );
      if (selectedCustom && customInput.trim()) {
        values = selectedOptions.map((entry) => (entry === selectedCustom.value ? customInput.trim() : entry));
      }
      setValueAndAdvance(currentQuestion, values, customInput.trim());
      return;
    }

    const selectedCustom = currentQuestion.options?.find(
      (option) => option.isCustom && selectedOptions.includes(option.value),
    );
    if (selectedCustom) {
      const value = customInput.trim() || selectedCustom.value;
      setValueAndAdvance(currentQuestion, value, customInput.trim());
    }
  };

  const handleSkip = () => {
    if (!currentQuestion) return;
    const nextIndex = findNextQuestionIndex(currentQuestionIndex, signal);
    if (nextIndex === -1) {
      completeFlow(signal);
      return;
    }
    setShowQuestion(false);
    setTimeout(() => {
      setCurrentQuestionIndex(nextIndex);
      setSelectedOptions([]);
      setCustomInput('');
      setShowQuestion(true);
    }, 180);
  };

  const handleSafeNow = () => {
    const resumedSignal: Partial<UserSignal> = {
      ...signal,
      roleContext: 'CLIENT',
      clientIntent: 'FIND_PROVIDER',
      urgencyState: 'URGENT',
      sortPreference: 'SOONEST',
      safetyFlags: uniqueFlags(signal.safetyFlags, ['CRISIS']),
    };

    const resumeIndex = findQuestionIndexById('supportNeeds');
    setSignal(resumedSignal);
    setIsCrisis(false);
    setShowEmergencyOptions(false);
    setSafetyCopy(null);

    if (resumeIndex === -1) {
      completeFlow(resumedSignal);
      return;
    }

    setCurrentQuestionIndex(resumeIndex);
    setSelectedOptions([]);
    setCustomInput('');
    setShowQuestion(true);
  };

  if (!currentQuestion) {
    return null;
  }

  if (isCrisis) {
    return (
      <div className="flex flex-col h-full p-8 items-center text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <Heading level={2} className="mb-4">Immediate Safety Support</Heading>
        <Text className="mb-5 max-w-lg">
          I&apos;m really sorry you&apos;re dealing with this. I can&apos;t help with emergencies. If
          you&apos;re in immediate danger or thinking about harming yourself, call your local emergency
          number now (in the US, call or text 988 for the Suicide &amp; Crisis Lifeline). If you can,
          reach out to someone you trust and stay with them.
        </Text>

        <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Button onClick={() => setShowEmergencyOptions((prev) => !prev)} variant="secondary">
            Show emergency options
          </Button>
          <Button onClick={handleSafeNow}>I&apos;m safe right now</Button>
        </div>

        {showEmergencyOptions && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-left w-full max-w-xl space-y-2">
            <p className="text-sm text-red-800 font-semibold">Emergency options</p>
            <p className="text-sm text-slate-700">
              Local emergency services: call your local emergency number.
            </p>
            <p className="text-sm text-slate-700">
              US Suicide &amp; Crisis Lifeline: call or text <a href="tel:988" className="text-brand-600 font-bold">988</a>.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-8 text-slate-500 font-medium hover:text-slate-700 transition-colors"
        >
          Close Evo
        </button>
      </div>
    );
  }

  const showCustomInput =
    currentQuestion.inputType === 'text' ||
    !!currentQuestion.options?.some(
      (option) => option.isCustom && selectedOptions.includes(option.value),
    );

  const canContinue =
    currentQuestion.inputType === 'text'
      ? currentQuestion.allowSkip || customInput.trim().length > 0
      : currentQuestion.multiSelect
        ? selectedOptions.length > 0
        : showCustomInput
          ? customInput.trim().length > 0
          : false;

  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
        <div className="h-full bg-brand-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="min-h-full flex flex-col items-center justify-center py-20 px-6 md:px-10">
          <div className={`w-full max-w-2xl transition-all duration-500 ${showQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="mb-5 text-center">
              <EvoIcon size="sm" className="mx-auto mb-4 opacity-80" />
              <Text className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold mb-3">
                Evo Navigation Assistant
              </Text>
              <Heading level={2} className="text-2xl md:text-3xl font-medium text-slate-900 leading-tight">
                {currentQuestion.text}
              </Heading>
            </div>

            {safetyCopy && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {safetyCopy}
              </div>
            )}

            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div className={`grid gap-3 ${currentQuestion.options.length > 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.multiSelect
                    ? selectedOptions.includes(option.value)
                    : selectedOptions.includes(option.value) || signal[currentQuestion.id] === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() =>
                        currentQuestion.multiSelect
                          ? handleMultiToggle(option.value)
                          : handleSingleSelect(currentQuestion, option.value, !!option.isCustom)
                      }
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-md'
                          : 'border-slate-100 bg-white text-slate-700 hover:border-brand-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-medium text-base">{option.label}</span>
                      {isSelected && (
                        <span className="text-brand-500">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {showCustomInput && (
              <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  value={customInput}
                  onChange={(event) => setCustomInput(event.target.value)}
                  placeholder={currentQuestion.placeholder || 'Type your response...'}
                  className="w-full p-4 rounded-xl border-2 border-brand-200 focus:border-brand-500 focus:outline-none bg-white text-base"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2">
                  Try not to share sensitive personal health details in chat. Evo is for navigation and matching.
                </p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                onClick={handleSkip}
                disabled={!currentQuestion.allowSkip}
                className="text-slate-400 font-medium hover:text-slate-600 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Skip
              </button>

              {(currentQuestion.inputType === 'text' || currentQuestion.multiSelect || showCustomInput) && (
                <Button onClick={handleContinue} disabled={!canContinue}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default ConversationFlow;

