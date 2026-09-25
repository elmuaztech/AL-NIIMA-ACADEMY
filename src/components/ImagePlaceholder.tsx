import React from 'react';
import { SchoolBadge } from './SchoolBadge';
import { Image as ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  label: string;
  category?: string;
  className?: string;
  aspect?: 'video' | 'square' | 'wide' | 'tall';
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  label,
  category,
  className = '',
  aspect = 'video',
}) => {
  const aspectClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
    tall: 'aspect-[4/5]',
  }[aspect];

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white flex flex-col items-center justify-center p-6 text-center shadow-inner ${aspectClass} ${className}`}
    >
      {/* Pattern texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm">
        <SchoolBadge size="lg" className="mb-3 shadow-md" />
        
        {category && (
          <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-amber-400/30 mb-1.5">
            {category}
          </span>
        )}

        <h4 className="font-serif font-semibold text-lg text-emerald-50 leading-snug">
          {label}
        </h4>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-200/80 bg-emerald-900/60 px-3 py-1 rounded border border-emerald-700/50">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Official School Photo Record</span>
        </div>
      </div>
    </div>
  );
};
