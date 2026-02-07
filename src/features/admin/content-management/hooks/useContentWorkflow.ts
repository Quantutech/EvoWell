import { useState } from 'react';
import { ContentStatus, CONTENT_WORKFLOW } from '../types/workflow.types';
import { useToast } from '@/contexts/ToastContext';

export const useContentWorkflow = (initialStatus: ContentStatus) => {
  const [status, setStatus] = useState<ContentStatus>(initialStatus);
  const { addToast } = useToast();

  const transitionTo = async (nextStatus: ContentStatus) => {
    const currentState = CONTENT_WORKFLOW[status];
    
    if (!currentState.nextPossibleStates.includes(nextStatus)) {
      addToast('error', `Invalid transition from ${status} to ${nextStatus}`);
      return;
    }

    try {
      // API call would go here
      // await api.updateContentStatus(contentId, nextStatus);
      setStatus(nextStatus);
      addToast('success', `Content status updated to ${nextStatus}`);
    } catch (e) {
      addToast('error', 'Failed to update content status');
    }
  };

  return {
    status,
    currentState: CONTENT_WORKFLOW[status],
    transitionTo,
    possibleTransitions: CONTENT_WORKFLOW[status].nextPossibleStates
  };
};
