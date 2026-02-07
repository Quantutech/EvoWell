import { useState, useRef } from 'react';
import { useToast } from '@/contexts/ToastContext';

export interface BulkActionConfig<T> {
  name: string;
  actionFn: (item: T) => Promise<void>;
  undoFn?: (item: T) => Promise<void>;
  onSuccess?: () => void;
}

export interface UseBulkActionsReturn<T> {
  isProcessing: boolean;
  progress: number;
  executeBulkAction: (items: T[], config: BulkActionConfig<T>) => Promise<void>;
  undoLastAction: () => Promise<void>;
  canUndo: boolean;
}

export function useBulkActions<T extends { id: string }>(): UseBulkActionsReturn<T> {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addToast } = useToast();
  
  const lastAction = useRef<{
    config: BulkActionConfig<T>;
    items: T[];
  } | null>(null);

  const executeBulkAction = async (
    items: T[],
    config: BulkActionConfig<T>
  ) => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < items.length; i++) {
      try {
        await config.actionFn(items[i]);
        successCount++;
      } catch (e) {
        console.error(`Bulk action failed for item ${items[i].id}:`, e);
        failCount++;
      }
      setProgress(Math.round(((i + 1) / items.length) * 100));
    }

    lastAction.current = { config, items };
    setIsProcessing(false);
    
    addToast('success', (
      <div className="flex flex-col gap-2">
        <p className="font-bold">Bulk {config.name} Completed</p>
        <p className="text-xs">{successCount} succeeded, {failCount} failed.</p>
        {config.undoFn && (
          <button 
            onClick={() => undoLastAction()}
            className="text-[10px] font-black uppercase tracking-widest text-white underline underline-offset-4"
          >
            Undo Last Action
          </button>
        )}
      </div>
    ) as any);

    if (config.onSuccess) config.onSuccess();
  };

  const undoLastAction = async () => {
    if (!lastAction.current || !lastAction.current.config.undoFn) return;
    
    const { config, items } = lastAction.current;
    setIsProcessing(true);
    setProgress(0);
    
    addToast('info', `Reverting bulk ${config.name}...`);

    for (let i = 0; i < items.length; i++) {
      try {
        await config.undoFn(items[i]);
      } catch (e) {
        console.error(`Undo failed for item ${items[i].id}:`, e);
      }
      setProgress(Math.round(((i + 1) / items.length) * 100));
    }

    setIsProcessing(false);
    lastAction.current = null;
    addToast('success', `Bulk ${config.name} reverted successfully.`);
    if (config.onSuccess) config.onSuccess();
  };

  return {
    isProcessing,
    progress,
    executeBulkAction,
    undoLastAction,
    canUndo: !!lastAction.current?.config.undoFn
  };
}
