import React from 'react';
import { SchoolBadge } from './SchoolBadge';
import { MapPin, Phone, Mail, Globe, Lock } from 'lucide-react';
import { GeneralInfo } from '../types/school';

interface FooterProps {
  onNavigate: (page: string) => void;
  general: GeneralInfo;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  general,
  onOpenAdmin,
}) => {
  const handleNav = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#072c17] text-stone-200 border-t-4 border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SchoolBadge size="md" />
              <div>
                <h3 className="font-poppins font-black text-lg text-white tracking-wide">
                  {general?.name || 'AL-NIIMA ACADEMY'}
                </h3>
                <p className="text-xs text-yellow-400 font-poppins font-semibold">
                  {general?.location || 'Dutse, Jigawa State'}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Providing standard and qualitative education with steadfast moral grounding. From early years through secondary and A’level studies, with dedicated boarding facilities for male and female students.
            </p>

            <div className="pt-2 border-t border-emerald-900/60">
              <p className="text-xs text-yellow-400 font-poppins font-medium">
                “{general.motto}”
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="font-poppins font-bold text-xs sm:text-sm text-white uppercase tracking-wider mb-4 border-b border-emerald-800 pb-2">
              Explore Our School
            </h4>
            <ul className="space-y-2 text-xs font-poppins">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-yellow-400 transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-yellow-400 transition-colors text-left"
                >
                  About Us & Core Ethos
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('gallery')}
                  className="hover:text-yellow-400 transition-colors text-left"
                >
                  School Gallery & Media
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('academics')}
                  className="hover:text-yellow-400 transition-colors text-left"
                >
                  Academics & Clubs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('sections')}
                  className="hover:text-yellow-400 transition-colors text-left"
                >
                  School Sections (Crèche to A’level)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('boarding')}
                  className="hover:text-yellow-400 transition-colors text-left"
                >
                  Boarding Facilities (Male & Female)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('facilities')}
                  className="hover:text-yellow-400 transition-colors text-left"
                >
                  School Facilities
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('admissions')}
                  className="hover:text-yellow-400 transition-colors text-left"
                >
                  Admissions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Admissions */}
          <div>
            <h4 className="font-poppins font-bold text-xs sm:text-sm text-white uppercase tracking-wider mb-4 border-b border-emerald-800 pb-2">
              Admissions
            </h4>
            <div className="space-y-3 text-xs text-stone-300">
              <p>
                Admissions are open for Crèche, Kindergarten, Nursery, Primary, JSS, SSS, and A’level programmes.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleNav('admissions')}
                  className="inline-block bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-poppins font-bold text-xs px-4 py-2.5 rounded-full transition-transform hover:scale-105"
                >
                  Enroll Today
                </button>
              </div>
            </div>
          </div>

          {/* Column 4: Contact School */}
          <div>
            <h4 className="font-poppins font-bold text-xs sm:text-sm text-white uppercase tracking-wider mb-4 border-b border-emerald-800 pb-2">
              Contact School
            </h4>
            <ul className="space-y-3 text-xs text-stone-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span>{general.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  {general.phoneNumbers.map((phone, idx) => (
                    <a
                      key={idx}
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="hover:text-yellow-400 transition-colors"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <a
                    href={`mailto:${general.email}`}
                    className="hover:text-yellow-400 transition-colors"
                  >
                    {general.email}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>{general.website}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar — Company name & email centered with clean text alignment */}
        <div className="mt-12 pt-8 border-t border-emerald-900/80 flex flex-col items-center justify-center text-center gap-3.5 text-xs text-stone-400 font-poppins">
          {/* School Copyright Line */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-stone-300 text-xs text-center">
            <span>© {new Date().getFullYear()} {general?.name || 'AL-NIIMA ACADEMY'}. All Rights Reserved.</span>
            <span className="hidden sm:inline text-emerald-700">•</span>
            <span className="text-[11px] text-stone-400">
              Dutse, Jigawa State, Nigeria
            </span>
          </div>

          {/* Centered Company Branding & Email Bar */}
          <div className="inline-flex flex-wrap items-center justify-center text-center gap-x-2.5 gap-y-1.5 px-5 py-2.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 shadow-xs text-xs sm:text-sm">
            <span className="text-stone-300">Powered by</span>
            <span className="text-yellow-400 font-bold tracking-wide">
              Elmuaz Technologies Ltd
            </span>
            <span className="text-emerald-600 hidden sm:inline">•</span>
            <a
              href="mailto:elmuaztechnologiesltd@gmail.com"
              className="text-stone-200 hover:text-yellow-300 font-medium underline underline-offset-4 decoration-yellow-400/40 hover:decoration-yellow-300 transition-colors"
            >
              elmuaztechnologiesltd@gmail.com
            </a>
            <span className="text-emerald-600 hidden md:inline">•</span>
            <a
              href="mailto:info@elmuaztech.com.ng"
              className="text-stone-400 hover:text-yellow-300 text-[11px] sm:text-xs transition-colors"
            >
              info@elmuaztech.com.ng
            </a>

            {/* Discreet admin portal button */}
            <button
              onClick={onOpenAdmin}
              title="Staff Portal / Administrative Login"
              aria-label="Staff Portal Login"
              className="p-1 rounded-full text-emerald-600 hover:text-yellow-400 hover:bg-emerald-900/60 transition-colors ml-1 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Verification / Build sync tag */}
          <div className="text-[10px] text-stone-300/80 tracking-wider">
            <span>Build 2026.10 • Live System Updated</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
