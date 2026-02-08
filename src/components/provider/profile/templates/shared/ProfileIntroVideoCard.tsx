import React from 'react';

interface ProfileIntroVideoCardProps {
  videoUrl?: string;
  className?: string;
}

const getVideoEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  const youtube = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  const vimeo = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
};

const ProfileIntroVideoCard: React.FC<ProfileIntroVideoCardProps> = ({ videoUrl, className = '' }) => {
  const embedUrl = videoUrl ? getVideoEmbedUrl(videoUrl) : null;

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h3 className="text-sm font-black text-slate-900">Intro Video</h3>
      <p className="mt-1 text-xs text-slate-500">
        A quick overview of approach, style, and what to expect.
      </p>

      {embedUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
          <iframe
            src={embedUrl}
            className="h-56 w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Provider introduction video"
          />
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <p className="text-sm font-bold text-slate-700">Intro video coming soon</p>
          <p className="mt-1 text-xs text-slate-500">
            This provider will add a short introduction video soon. In the meantime, review their bio and specialties below.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileIntroVideoCard;
