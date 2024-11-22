import React, { useState } from 'react';
import { Globe } from 'lucide-react';

interface FaviconProps {
  url: string;
  className?: string;
}

export const Favicon: React.FC<FaviconProps> = ({ url, className }) => {
  const [error, setError] = useState(false);
  const hostname = new URL(url).hostname;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  if (error) {
    return <Globe className={className} />;
  }

  return (
    <img
      src={faviconUrl}
      alt={`${hostname} favicon`}
      className={className}
      onError={() => setError(true)}
      width={16}
      height={16}
    />
  );
}; 