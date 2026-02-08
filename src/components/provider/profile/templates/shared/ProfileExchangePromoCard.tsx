import React from 'react';
import { Icon } from '@/components/ui';
import { iconPaths } from '@/components/ui/iconPaths';

interface ProfileExchangePromoCardProps {
  onBrowseExchange: () => void;
  className?: string;
  iconClassName?: string;
  linkClassName?: string;
}

const ProfileExchangePromoCard: React.FC<ProfileExchangePromoCardProps> = ({
  onBrowseExchange,
  className = '',
  iconClassName = 'bg-brand-600 text-white',
  linkClassName = 'text-brand-700',
}) => (
  <button
    type="button"
    onClick={onBrowseExchange}
    className={`w-full rounded-3xl border border-brand-100 bg-brand-50 p-5 text-left transition-all hover:border-brand-200 hover:bg-brand-100/70 ${className}`}
  >
    <div className="flex items-start gap-3">
      <span className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}>
        <Icon path={iconPaths.folder} size={18} />
      </span>
      <div>
        <h3 className="text-sm font-black text-slate-900">Explore clinical tools & resources</h3>
        <p className="mt-1 text-xs text-slate-600">
          Browse worksheets, guides, and templates from verified providers-designed for real use.
        </p>
        <span className={`mt-3 inline-flex items-center text-xs font-black uppercase tracking-wide ${linkClassName}`}>
          Browse Provider Exchange
        </span>
      </div>
    </div>
  </button>
);

export default ProfileExchangePromoCard;
