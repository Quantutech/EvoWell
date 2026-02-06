import React, { useState } from 'react';

interface ProfileImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  // Generate initials
  const initials = alt
    ? alt
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '??';

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-brand-100 text-brand-700 font-bold ${className}`}>
        {initials}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`object-cover ${className}`} 
      onError={() => setError(true)} 
    />
  );
};

export default ProfileImage;
