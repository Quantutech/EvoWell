
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerOptions {
  timeout: number; // milliseconds before idle
  onIdle: () => void;
  debounce?: number;
  events?: string[];
}

export function useIdleTimer({
  timeout,
  onIdle,
  debounce = 500,
  events = ['mousemove', 'keydown', 'wheel', 'touchstart', 'click', 'scroll']
}: UseIdleTimerOptions) {
  const [isIdle, setIsIdle] = useState(false);
  const [remaining, setRemaining] = useState(Math.ceil(timeout / 1000));
  const lastActiveRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);

  // Helper to get synchronized last active time from local storage (cross-tab support)
  const getLastActive = () => {
    const stored = localStorage.getItem('evowell_last_active');
    const local = lastActiveRef.current;
    if (stored) {
      const storedTime = parseInt(stored, 10);
      // Use the most recent time between local state and storage
      return Math.max(storedTime, local);
    }
    return local;
  };

  const handleEvent = useCallback(() => {
    if (isPaused.current) return;
    
    const now = Date.now();
    // Debounce updates to storage to avoid performance hits
    if (now - lastActiveRef.current > debounce) {
      lastActiveRef.current = now;
      localStorage.setItem('evowell_last_active', now.toString());
      setIsIdle(false);
    }
  }, [debounce]);

  const reset = useCallback(() => {
    const now = Date.now();
    lastActiveRef.current = now;
    localStorage.setItem('evowell_last_active', now.toString());
    setIsIdle(false);
    setRemaining(Math.ceil(timeout / 1000));
  }, [timeout]);

  const pause = useCallback(() => {
    isPaused.current = true;
  }, []);

  const resume = useCallback(() => {
    isPaused.current = false;
    // Reset on resume to avoid immediate logout if paused for long duration
    reset();
  }, [reset]);

  // Setup Event Listeners
  useEffect(() => {
    // Initial sync
    const stored = localStorage.getItem('evowell_last_active');
    if (!stored) {
      localStorage.setItem('evowell_last_active', Date.now().toString());
    }

    events.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    // Listen for storage events (other tabs updating activity)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'evowell_last_active' && e.newValue) {
        lastActiveRef.current = parseInt(e.newValue, 10);
        setIsIdle(false);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
      window.removeEventListener('storage', handleStorage);
    };
  }, [events, handleEvent]);

  // Timer Loop
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (isPaused.current) return;

      const lastActive = getLastActive();
      const now = Date.now();
      const elapsed = now - lastActive;
      const timeLeft = timeout - elapsed;

      setRemaining(Math.ceil(timeLeft / 1000));

      if (timeLeft <= 0) {
        if (!isIdle) {
          setIsIdle(true);
          onIdle();
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeout, onIdle, isIdle]);

  return {
    isIdle,
    remaining,
    reset,
    pause,
    resume
  };
}
