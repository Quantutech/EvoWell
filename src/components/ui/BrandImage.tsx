import React, { useEffect, useState } from 'react';

interface BrandImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
  aspectRatio?: number | string;
  wrapperClassName?: string;
}

const BrandImage: React.FC<BrandImageProps> = ({
  src,
  fallbackSrc,
  aspectRatio,
  wrapperClassName,
  onError,
  ...props
}) => {
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    setResolvedSrc(src);
  }, [src]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && resolvedSrc !== fallbackSrc) {
      setResolvedSrc(fallbackSrc);
    }
    onError?.(event);
  };

  const image = <img {...props} src={resolvedSrc} onError={handleError} />;

  if (aspectRatio === undefined) {
    return image;
  }

  return (
    <div className={wrapperClassName} style={{ aspectRatio }}>
      {image}
    </div>
  );
};

export default BrandImage;

