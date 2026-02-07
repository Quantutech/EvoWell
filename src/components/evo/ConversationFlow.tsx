import React, { useState, useEffect, useRef } from 'react';
import { UserSignal, Question } from './types';
import { QUESTIONS } from './questions';
import { Button } from '@/components/ui';
import { Heading, Text } from '@/components/typography';
import EvoIcon from './EvoIcon';

interface ConversationFlowProps {
  onComplete: (signal: UserSignal) => void;
  onClose: () => void;
}

const ConversationFlow: React.FC<ConversationFlowProps> = ({ onComplete, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [signal, setSignal] = useState<Partial<UserSignal>>({});
  const [showQuestion, setShowQuestion] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  const [customInput, setCustomInput] = useState('');
  
  // To handle multi-select temporary state
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Initial animation
  useEffect(() => {
    const timer = setTimeout(() => setShowQuestion(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom when question changes
  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentQuestionIndex, showQuestion]);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  const handleNext = () => {
    // Determine next question index based on triggers
    let nextIndex = currentQuestionIndex + 1;
    while (nextIndex < QUESTIONS.length) {
      const q = QUESTIONS[nextIndex];
      if (!q.trigger || q.trigger(signal)) {
        break;
      }
      nextIndex++;
    }

    if (nextIndex >= QUESTIONS.length) {
      onComplete(signal as UserSignal);
    } else {
      setShowQuestion(false);
      setTimeout(() => {
        setCurrentQuestionIndex(nextIndex);
        setSelectedOptions([]);
        setCustomInput('');
        setShowQuestion(true);
      }, 400);
    }
  };

  const handleSelect = (value: string) => {
    if (value === 'crisis') {
        setSignal(prev => ({ ...prev, intensity_level: 'crisis' }));
        setIsCrisis(true);
        return;
    }

    if (currentQuestion.multiSelect) {
        if (selectedOptions.includes(value)) {
            setSelectedOptions(prev => prev.filter(v => v !== value));
        } else {
            setSelectedOptions(prev => [...prev, value]);
        }
    } else {
        // Single select immediately proceeds (with a slight delay for visual feedback)
        setSignal(prev => ({ ...prev, [currentQuestion.id]: value }));
        // Hack for custom input
        if (value === 'Other') {
             // Logic handled in render
        } else {
             // Immediate next for single select
             setTimeout(() => {
                // Determine next question... (need to update signal first which is async-ish)
                // Actually safer to call handleNext manually or via effect, but let's do it here with updated object
                const newSignal = { ...signal, [currentQuestion.id]: value };
                let nextIndex = currentQuestionIndex + 1;
                while (nextIndex < QUESTIONS.length) {
                    const q = QUESTIONS[nextIndex];
                    if (!q.trigger || q.trigger(newSignal)) break;
                    nextIndex++;
                }

                if (nextIndex >= QUESTIONS.length) {
                    onComplete(newSignal as UserSignal);
                } else {
                    setShowQuestion(false);
                    setTimeout(() => {
                        setCurrentQuestionIndex(nextIndex);
                        setSelectedOptions([]);
                        setCustomInput('');
                        setShowQuestion(true);
                    }, 400);
                }
             }, 300);
        }
    }
  };

  const handleMultiSubmit = () => {
    let finalValue: any = selectedOptions;
    if (currentQuestion.id === 'primary_concern' && selectedOptions.includes('Other') && customInput) {
        finalValue = [...selectedOptions.filter(o => o !== 'Other'), customInput];
    }
    
    // For single select with custom input
    if (!currentQuestion.multiSelect && customInput) {
        finalValue = customInput;
    } else if (!currentQuestion.multiSelect && selectedOptions.includes('Other')) {
         // Custom input was empty?
         finalValue = 'Other';
    }

    setSignal(prev => ({ ...prev, [currentQuestion.id]: finalValue }));
    handleNext();
  };

  const handleSkip = () => {
    handleNext(); // Just proceed without saving to signal
  };

  if (isCrisis) {
    return (
        <div className="flex flex-col h-full p-8 items-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <Heading level={2} className="mb-4">Immediate Support Available</Heading>
            <Text className="mb-8 max-w-md">
                It sounds like things are really tough right now. Please know that you don't have to go through this alone.
            </Text>
            
            <div className="bg-slate-50 p-6 rounded-2xl w-full max-w-md border border-slate-200 mb-8 text-left">
                <Heading level={4} className="mb-2">Crisis Resources</Heading>
                <ul className="space-y-3">
                    <li className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Emergency Services</span>
                        <a href="tel:911" className="text-brand-600 font-bold hover:underline">911</a>
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Crisis Lifeline</span>
                        <a href="tel:988" className="text-brand-600 font-bold hover:underline">988</a>
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Crisis Text Line</span>
                        <span className="text-brand-600 font-bold">Text HOME to 741741</span>
                    </li>
                </ul>
            </div>
            
            <Button onClick={onClose} variant="ghost">Close</Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
       {/* Header with Progress */}
       <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
          <div 
            className="h-full bg-brand-500 transition-all duration-500 ease-out" 
            style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
          />
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="min-h-full flex flex-col items-center justify-center py-24 px-6 md:px-10">
            {/* Animated Container */}
            <div className={`w-full max-w-lg transition-all duration-500 ${showQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              
              {/* Question Text */}
              <div className="mb-8 text-center">
                  {/* Small Evo Icon above question for branding */}
                  <EvoIcon size="sm" className="mx-auto mb-4 opacity-80" />
                  <Heading level={2} className="text-2xl md:text-3xl font-medium text-slate-900 leading-tight">
                    {currentQuestion.text}
                  </Heading>
              </div>

              {/* Options */}
              <div className={`grid gap-3 ${currentQuestion.options.length > 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {currentQuestion.options.map((option) => {
                      const isSelected = currentQuestion.multiSelect 
                         ? selectedOptions.includes(option.value)
                         : (signal[currentQuestion.id as keyof UserSignal] === option.value); // Optimistic check won't work perfectly for single select due to immediate transition, but fine.
                      
                      return (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                                ${isSelected 
                                    ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-md' 
                                    : 'border-slate-100 bg-white text-slate-700 hover:border-brand-200 hover:bg-slate-50'
                                }
                            `}
                        >
                            <span className="font-medium text-lg">{option.label}</span>
                            {isSelected && (
                                <span className="text-brand-500 animate-in zoom-in duration-200">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                </span>
                            )}
                        </button>
                      );
                  })}

                  {/* Custom Input Field logic */}
                  {(selectedOptions.includes('Other') || (currentQuestion.options.some(o => o.isCustom) && !currentQuestion.multiSelect && signal[currentQuestion.id as keyof UserSignal] === 'Other')) && (
                       <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                           <input
                              type="text"
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                              placeholder="Please specify..."
                              className="w-full p-4 rounded-xl border-2 border-brand-200 focus:border-brand-500 focus:outline-none bg-white text-lg"
                              autoFocus
                           />
                       </div>
                  )}
              </div>

              {/* Action Bar (Next/Skip) */}
              <div className="mt-8 flex items-center justify-between">
                  <button 
                    onClick={handleSkip}
                    className="text-slate-400 font-medium hover:text-slate-600 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50"
                  >
                    Skip
                  </button>

                  {(currentQuestion.multiSelect || (customInput && selectedOptions.includes('Other'))) && (
                      <Button 
                        onClick={handleMultiSubmit}
                        disabled={selectedOptions.length === 0 && !customInput}
                        className="animate-in fade-in duration-300"
                        rightIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                      >
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
