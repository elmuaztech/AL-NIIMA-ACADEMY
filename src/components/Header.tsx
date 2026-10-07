import React, { useState } from 'react';
import { SchoolBadge } from './SchoolBadge';
import {
  Menu,
  X,
  Lock,
  LockOpen,
  ChevronRight,
} from 'lucide-react';
import { GeneralInfo } from '../types/school';

interface HeaderProps {
  currentPage: string;
  activeSection?: string;
  onNavigate: (page: string) => void;
  general: GeneralInfo;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  activeSection = 'home',
  onNavigate,
  general,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'about', label: 'ABOUT' },
    { id: 'sections', label: 'SECTIONS' },
    { id: 'gallery', label: 'GALLERY' },
    { id: 'academics', label: 'ACADEMICS' },
    { id: 'boarding', label: 'BOARDING' },
    { id: 'facilities', label: 'FACILITIES' },
    { id: 'admissions', label: 'ADMISSIONS' },
    { id: 'contact', label: 'CONTACT' },
  ];

  const isItemActive = (itemId: string) => {
    if (currentPage === 'home' || currentPage === '') {
      return (activeSection || 'home') === itemId;
    }
    return currentPage === itemId;
  };

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#093c20] text-white border-b-4 border-yellow-400 shadow-md">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & School Name — Completely in a single straight line on mobile & desktop */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-hidden min-w-0"
          >
            {/* School official logo badge */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center border-2 border-yellow-400 shadow-sm shrink-0 overflow-hidden group-hover:scale-105 transition-transform p-0.5">
              <img
                src="/assets/logo.jpg"
                alt="Al-Niima Academy Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* School Name stacked vertically (undone single straight line per request) */}
            <div className="flex flex-col text-left">
              <span className="font-poppins font-black text-sm sm:text-base md:text-xl text-white tracking-wide leading-tight">
                {general?.name ? general.name.replace(/ACADEMY.*/i, '').trim() || 'AL-NIIMA' : 'AL-NIIMA'}
              </span>
              <span className="font-poppins font-bold text-[10px] sm:text-xs text-yellow-400 tracking-wider uppercase leading-tight">
                ACADEMY • {general?.location ? general.location.split(',')[0].trim().toUpperCase() : 'DUTSE'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 font-poppins text-xs tracking-wider uppercase font-semibold">
            {navItems.map((item) => {
              const isActive = isItemActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`py-2 px-1 transition-all duration-200 relative group cursor-pointer ${
                    isActive
                      ? 'text-yellow-400 font-bold'
                      : 'text-stone-200 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  {/* Active Underline Indicator */}
                  {isActive ? (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.9)] animate-fade-in" />
                  ) : (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-yellow-400/60 rounded-full group-hover:w-full transition-all duration-200" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Area: Staff Lock Icon & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Discreet Lock Icon for Staff / Admin Login (Exactly as seen in reference image) */}
            <button
              onClick={() => handleNav('admin')}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentPage === 'admin'
                  ? 'text-yellow-400 bg-emerald-950 border border-yellow-400/40'
                  : 'text-yellow-400 hover:text-white hover:bg-emerald-900/60'
              }`}
              title={isAdminLoggedIn ? 'Staff Portal (Active)' : 'Staff / Admin Portal'}
              aria-label="Staff Portal"
            >
              {isAdminLoggedIn ? (
                <LockOpen className="w-5 h-5 text-yellow-400" />
              ) : (
                <Lock className="w-5 h-5 text-yellow-400" />
              )}
              {isAdminLoggedIn && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 hidden sm:inline">
                  Admin
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-emerald-900 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#072d18] border-t border-emerald-900 px-4 pt-3 pb-6 space-y-1 shadow-xl animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const isActive = isItemActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-poppins text-xs font-semibold tracking-wider text-left transition-all ${
                  isActive
                    ? 'bg-emerald-900/90 text-yellow-400 border-l-4 border-yellow-400 font-bold shadow-xs'
                    : 'text-stone-200 hover:bg-emerald-900/50 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-yellow-400 translate-x-1' : 'text-emerald-600'
                  }`}
                />
              </button>
            );
          })}

          <div className="pt-3 mt-2 border-t border-emerald-900/80 flex items-center justify-between">
            <button
              onClick={() => handleNav('admissions')}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-poppins font-bold text-xs py-2.5 rounded text-center shadow transition-colors"
            >
              ENROLL TODAY
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
