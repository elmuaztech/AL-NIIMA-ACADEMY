import React from 'react';
import { WhatsAppButton } from './WhatsAppButton';
import { AiAssistantWidget } from './AiAssistantWidget';

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
      className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-[80] flex flex-col items-center gap-2.5 pointer-events-none select-none"
      aria-label="Floating Actions"
    >
      {/* 1. Al-Niima AI Assistant (Reduced size, perfectly aligned on vertical center axis) */}
      <div className="pointer-events-auto flex items-center justify-center w-12 h-12">
        <AiAssistantWidget schoolPhone={primaryPhone} />
      </div>

      {/* 2. Real WhatsApp Button (Identical size & position, perfectly aligned) */}
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
