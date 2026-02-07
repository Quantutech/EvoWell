import React, { useState, useEffect } from 'react';
import { wishlistService } from '@/services/wishlist.service';
import { useAuth, useNavigation } from '@/App';
import { UserRole } from '@/types';
import { iconPaths } from '@/components/ui/iconPaths';

interface WishlistButtonProps {
  providerId: string;
  initialIsSaved?: boolean;
  className?: string;
  onToggle?: (newState: boolean) => void;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  providerId,
  initialIsSaved = false,
  className = '',
  onToggle
}) => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with initial prop if it changes (e.g. after search fetch)
  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    e.preventDefault();

    if (!user) {
      // Guest: trigger auth
      navigate('#/login');
      return;
    }

    if (user.role === UserRole.PROVIDER) {
      // Provider: Read-only
      return;
    }

    // Client/Admin
    const previousState = isSaved;
    setIsSaved(!previousState); // Optimistic
    setIsLoading(true);

    try {
      const { isSaved: newState } = await wishlistService.toggleWishlist(providerId);
      setIsSaved(newState);
      if (onToggle) onToggle(newState);
    } catch (error) {
      console.error('Failed to toggle wishlist', error);
      setIsSaved(previousState); // Revert
      // Ideally show toast here
    } finally {
      setIsLoading(false);
    }
  };

  const isProvider = user?.role === UserRole.PROVIDER;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isProvider}
      className={`
        relative p-2 rounded-full transition-all duration-200 z-20
        ${isSaved ? 'text-brand-500 bg-brand-50 hover:bg-brand-100' : 'text-slate-400 bg-white/80 hover:bg-white hover:text-brand-400'}
        ${isProvider ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isProvider ? "Only clients can save providers" : (isSaved ? "Remove from Saved" : "Save Provider")}
      aria-label={isSaved ? "Remove from Saved" : "Save Provider"}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconPaths.heart} />
      </svg>
    </button>
  );
};
