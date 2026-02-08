import React from 'react';
import { Icon } from '@/components/ui';
import { iconPaths } from '@/components/ui/iconPaths';

interface ProfileStickyActionsProps {
  onBook: () => void;
  onSave: () => void;
  onChatWithEvo: () => void;
  primaryButtonClassName?: string;
}

const ProfileStickyActions: React.FC<ProfileStickyActionsProps> = ({
  onBook,
  onSave,
  onChatWithEvo,
  primaryButtonClassName = 'bg-slate-900 text-white',
}) => {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur">
        <button
          type="button"
          onClick={onBook}
          className={`flex-1 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide ${primaryButtonClassName}`}
        >
          Book appointment
        </button>
        <button
          type="button"
          onClick={onSave}
          className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700"
          aria-label="Save provider"
        >
          <Icon path={iconPaths.heart} size={18} />
        </button>
        <button
          type="button"
          onClick={onChatWithEvo}
          className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700"
          aria-label="Chat with Evo"
        >
          <Icon path={iconPaths.chat} size={18} />
        </button>
      </div>
    </div>
  );
};

export default ProfileStickyActions;
