import React, { useState } from 'react';

interface SchoolBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
}

export const SchoolBadge: React.FC<SchoolBadgeProps> = ({
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
    hero: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
  };

  if (!imageError) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-full bg-white border-2 border-yellow-400 shadow-sm overflow-hidden shrink-0 select-none ${sizeMap[size]} ${className}`}
        aria-label="Al-Niima Academy Official Logo"
      >
        <img
          src="/assets/logo.jpg"
          alt="Al-Niima Academy Logo"
          onError={() => setImageError(true)}
          className="w-full h-full object-contain p-0.5"
        />
      </div>
    );
  }

  // Fallback badge if image path cannot be resolved
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-[#093c20] border-2 border-yellow-400 shadow-sm text-yellow-400 select-none font-poppins font-black shrink-0 ${sizeMap[size]} ${className}`}
      aria-label="Al-Niima Academy Emblem"
    >
      <span className="text-xs uppercase tracking-tighter">ALN</span>
    </div>
  );
};
