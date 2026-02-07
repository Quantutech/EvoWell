import React, { useState, useEffect } from 'react';
import { ProviderProfile, UserRole } from '../../types';
import { endorsementService } from '../../services/endorsement.service';
import { useAuth } from '../../App';
import { EndorseModal } from './EndorseModal';
import Button from '../ui/Button';

interface EndorseButtonProps {
  provider: ProviderProfile;
  onSuccess?: () => void;
}

/**
 * EndorseButton - Context-aware button for eligible users to endorse providers.
 * Visible only to providers and admins, excluding the provider themselves.
 */
export const EndorseButton: React.FC<EndorseButtonProps> = ({ provider, onSuccess }) => {
  const { user } = useAuth();
  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkEndorsement = async () => {
      if (user && provider.id) {
        try {
          const result = await endorsementService.hasEndorsed(provider.id, user.id);
          setHasEndorsed(result);
        } catch (error) {
          console.error('Error checking endorsement status:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkEndorsement();
  }, [user, provider.id]);

  // Design constraints:
  // - Public users don't see the button at all
  // - Providers never see an endorse button on their own profile
  if (!user) return null;
  if (user.role !== UserRole.PROVIDER && user.role !== UserRole.ADMIN) return null;
  if (user.id === provider.userId) return null; 

  const handleConfirm = async (reason?: any) => {
    try {
      await endorsementService.createEndorsement(provider.id, reason);
      setHasEndorsed(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to create endorsement:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <div className="h-12 w-40 bg-slate-800 animate-pulse rounded-full" />;
  }

  if (hasEndorsed) {
    return (
      <div className="relative group">
        <Button 
          variant="secondary" 
          disabled 
          className="rounded-full opacity-60 cursor-not-allowed h-12 px-8 border-slate-700 bg-slate-800/50 text-slate-400"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Endorsed
        </Button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-slate-200 text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700 shadow-xl">
          Endorsements cannot be undone
        </div>
      </div>
    );
  }

  return (
    <>
      <Button 
        variant="secondary" 
        onClick={() => setIsModalOpen(true)}
        className="rounded-full h-12 px-8 border-teal-500/50 text-teal-400 hover:border-teal-500 hover:bg-teal-500/10 hover:text-teal-300 shadow-lg shadow-teal-500/5"
        leftIcon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        }
      >
        Endorse Provider
      </Button>

      <EndorseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirm}
        provider={provider}
      />
    </>
  );
};
