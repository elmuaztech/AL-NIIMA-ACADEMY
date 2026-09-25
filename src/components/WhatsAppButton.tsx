import React, { useState } from 'react';
import { MessageCircle, Phone, ExternalLink, X } from 'lucide-react';

interface WhatsAppButtonProps {
  primaryPhone?: string;
  secondaryPhone?: string;
  defaultMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  primaryPhone = '08038382557',
  secondaryPhone = '08021358445',
  defaultMessage = 'Hello Al-Niima Academy, I would like to inquire about admissions and school programs.',
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize Nigerian phone numbers to international WhatsApp format (+234...)
  const formatForWhatsApp = (phone: string): string => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      return `234${cleaned.slice(1)}`;
    }
    if (cleaned.startsWith('234')) {
      return cleaned;
    }
    return `234${cleaned}`;
  };

  const primaryWaNumber = formatForWhatsApp(primaryPhone);
  const secondaryWaNumber = formatForWhatsApp(secondaryPhone);

  const getWhatsAppUrl = (number: string): string => {
    return `https://wa.me/${number}?text=${encodeURIComponent(defaultMessage)}`;
  };

  const handleDirectClick = () => {
    window.open(getWhatsAppUrl(primaryWaNumber), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative inline-flex items-center justify-center w-12 h-12">
      {/* Expanded Multi-Number Selection Dialog */}
      {showOptions && (
        <div
          role="dialog"
          aria-label="WhatsApp Contacts"
          className="absolute bottom-14 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Al-Niima WhatsApp Desk
              </p>
            </div>
            <button
              onClick={() => setShowOptions(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
              aria-label="Close contacts"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 mt-3">
            <a
              href={getWhatsAppUrl(primaryWaNumber)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowOptions(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 text-gray-800 transition-colors group/item border border-transparent hover:border-emerald-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">Admissions Office</div>
                  <div className="text-[11px] text-gray-500 font-mono">+234 {primaryPhone.replace(/^0/, '')}</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[#25D366] transition-colors" />
            </a>

            {secondaryPhone && (
              <a
                href={getWhatsAppUrl(secondaryWaNumber)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowOptions(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 text-gray-800 transition-colors group/item border border-transparent hover:border-emerald-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">Administration Desk</div>
                    <div className="text-[11px] text-gray-500 font-mono">+234 {secondaryPhone.replace(/^0/, '')}</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[#25D366] transition-colors" />
              </a>
            )}
          </div>

          <div className="mt-3 pt-2 text-[10px] text-gray-400 text-center border-t border-gray-100">
            Typical reply time: Under 15 minutes during school hours
          </div>
        </div>
      )}

      {/* Hover Tooltip (visible on desktop hover unless dialog is open) */}
      {!showOptions && isHovered && (
        <div className="absolute right-full bottom-1/2 translate-y-1/2 mr-3 pointer-events-none hidden md:flex items-center z-50">
          <div className="bg-gray-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap flex items-center space-x-2 animate-in fade-in slide-in-from-right-2 duration-150">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
            <span>Chat on WhatsApp (+234 {primaryPhone.replace(/^0/, '')})</span>
          </div>
          <div className="w-2 h-2 bg-gray-900 rotate-45 -ml-1" />
        </div>
      )}

      {/* Main WhatsApp Button (Exact same size: w-12 h-12 = 48px) */}
      <button
        type="button"
        onClick={handleDirectClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg hover:shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        aria-label="Open WhatsApp chat with Al-Niima Academy admissions"
        title="Chat with Al-Niima Academy on WhatsApp"
      >
        {/* Subtle Outer Radar Wave Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />

        {/* Official WhatsApp SVG Vector Icon */}
        <svg
          className="w-6 h-6 fill-current relative z-10 transition-transform duration-200 hover:scale-110 drop-shadow-sm"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.04 2C6.51 2 2.015 6.495 2.015 12.025c0 1.768.46 3.494 1.334 5.01L2 22l5.12-1.343a10.007 10.007 0 0 0 4.92 1.288h.004c5.529 0 10.024-4.495 10.025-10.025A10.015 10.015 0 0 0 12.04 2zm0 18.33h-.003a8.318 8.318 0 0 1-4.24-1.164l-.304-.18-3.153.827.842-3.074-.198-.315a8.313 8.313 0 0 1-1.273-4.399c0-4.59 3.734-8.324 8.327-8.324a8.29 8.29 0 0 1 5.888 2.438 8.29 8.29 0 0 1 2.435 5.889c0 4.591-3.734 8.326-8.324 8.326zM17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.779.98-.954 1.18-.175.2-.351.225-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.085-.175-.3-.019-.462.132-.612.136-.135.301-.351.452-.527.15-.175.2-.3.301-.501.1-.2.05-.376-.025-.526-.075-.15-.678-1.634-.928-2.238-.244-.588-.493-.509-.678-.518-.175-.009-.376-.009-.577-.009-.2 0-.527.075-.802.376s-1.053 1.028-1.053 2.508c0 1.48 1.078 2.909 1.229 3.109.15.2 2.122 3.24 5.141 4.542.718.31 1.278.495 1.716.634.721.229 1.378.196 1.9.119.581-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.577-.35z" />
        </svg>

        {/* Quick status badge */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full p-0.5 shadow-xs border border-emerald-500">
          <span className="block w-full h-full rounded-full bg-emerald-500 animate-pulse" />
        </span>
      </button>
    </div>
  );
};
