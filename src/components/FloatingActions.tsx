import React from 'react';
import { WhatsAppButton } from './WhatsAppButton';

interface FloatingActionsProps {
  primaryPhone?: string;
  secondaryPhone?: string;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  primaryPhone = '08038382557',
  secondaryPhone = '08021358445',
}) => {
  return (
    <div
      className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-[80] flex flex-col items-center pointer-events-none select-none"
      aria-label="Floating Actions"
    >
      {/* Real WhatsApp Button */}
      <div className="pointer-events-auto flex items-center justify-center w-12 h-12">
        <WhatsAppButton
          primaryPhone={primaryPhone}
          secondaryPhone={secondaryPhone}
          defaultMessage="Hello Al-Niima Academy, I would like to inquire about admissions and school programs."
        />
      </div>
    </div>
  );
};
