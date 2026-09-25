import React from 'react';
import { BoardingInfo } from '../types/school';
import {
  ShieldCheck,
  Droplets,
  Utensils,
  BookOpen,
  Home,
  CheckCircle2,
  Clock,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react';

interface BoardingPageProps {
  boarding: BoardingInfo;
  onNavigate: (page: string) => void;
}

export const BoardingPage: React.FC<BoardingPageProps> = ({
  boarding,
  onNavigate,
}) => {
  const getFeatureIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('separate') || lower.includes('hostel')) {
      return <Home className="w-5 h-5 text-yellow-500" />;
    }
    if (lower.includes('water')) {
      return <Droplets className="w-5 h-5 text-yellow-500" />;
    }
    if (lower.includes('security')) {
      return <ShieldCheck className="w-5 h-5 text-yellow-500" />;
    }
    if (lower.includes('cater') || lower.includes('meal')) {
      return <Utensils className="w-5 h-5 text-yellow-500" />;
    }
    if (lower.includes('prep') || lower.includes('study')) {
      return <BookOpen className="w-5 h-5 text-yellow-500" />;
    }
    if (lower.includes('welfare') || lower.includes('parent')) {
      return <HeartHandshake className="w-5 h-5 text-yellow-500" />;
    }
    return <CheckCircle2 className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div className="space-y-16 py-8">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#093c20] text-white rounded-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden border-b-4 border-yellow-400 shadow-md">
          <div className="relative max-w-4xl space-y-3">
            <span className="text-xs uppercase font-poppins font-bold tracking-widest text-yellow-400 bg-[#062c17] px-3 py-1 rounded-full border border-yellow-400/30 inline-block">
              Residential Life
            </span>
            <h1 className="font-poppins font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
              Boarding at <span className="text-yellow-400 whitespace-nowrap">Al-Niima Academy</span>
            </h1>
            <p className="font-poppins text-stone-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Al-Niima Academy provides a safe, disciplined, and nurturing boarding environment with separate hostels for male and female students.
            </p>
          </div>
        </div>
      </section>

      {/* Male & Female Hostels Announcement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Male Hostel Card */}
          <div className="bg-white border-2 border-emerald-900/10 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full font-poppins">
                <span>Male Boarding Section</span>
              </div>
              <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#093c20]">
                Male Students' Hostel
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                Dedicated residential facilities exclusively for male students. Under the supervision of experienced housemasters, boarders cultivate discipline, mutual brotherhood, and rigorous study routines.
              </p>
              <ul className="space-y-2 text-xs text-stone-700 pt-2 font-sans">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Strictly separate and supervised male quarters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Clean running water and hygienic sanitation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>24-hour guarded security and supervised evening prep</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Female Hostel Card */}
          <div className="bg-white border-2 border-emerald-900/10 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full font-poppins">
                <span>Female Boarding Section</span>
              </div>
              <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#093c20]">
                Female Students' Hostel
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                Strictly segregated residential quarters exclusively for female students. Supervised by caring and vigilant matrons, fostering modesty, academic brilliance, and sisterly support.
              </p>
              <ul className="space-y-2 text-xs text-stone-700 pt-2 font-sans">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Strictly separate and protected female quarters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Clean running water and hygienic sanitation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Controlled security perimeter and supervised evening prep</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENTED BOARDING PROVISIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-[#093c20] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block font-poppins">
            Boarding Provisions
          </span>
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#093c20]">
            Boarding Amenities
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-sans">
            As outlined in the Al-Niima Academy admission handbook, boarders are provided essential facilities for health, safety, and focused study.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boarding.features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs hover:border-[#093c20]/40 transition-colors flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-[#093c20] text-yellow-400 flex items-center justify-center shrink-0 shadow-2xs">
                {getFeatureIcon(feat.title)}
              </div>
              <div className="space-y-1">
                <h3 className="font-poppins font-bold text-base text-[#093c20]">
                  {feat.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  {feat.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PASTORAL CARE & DAILY LIFE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 sm:p-10 space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-[#093c20] uppercase tracking-widest font-poppins">
              Structured Routine
            </span>
            <h2 className="font-poppins font-bold text-2xl text-[#093c20]">
              Boarding Life & Character Building
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
              Living on campus at Al-Niima Academy teaches punctuality, cleanliness, teamwork, and moral responsibility. Boarders follow an organized timetable for classes, meals, study prep, recreation, and prayers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-700 font-sans">
            <div className="bg-white p-4 rounded-xl border border-emerald-200/60 space-y-1">
              <strong className="block text-[#093c20] font-bold font-poppins">Academic Prep</strong>
              <p className="text-stone-600">
                Supervised evening and morning prep sessions under teacher and warden guidance.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200/60 space-y-1">
              <strong className="block text-[#093c20] font-bold font-poppins">Hygienic Catering</strong>
              <p className="text-stone-600">
                Wholesome meals prepared daily complying with cleanliness and nutrition standards.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200/60 space-y-1">
              <strong className="block text-[#093c20] font-bold font-poppins">Moral Guidance</strong>
              <p className="text-stone-600">
                Encouraging good character, respect, self-reliance, and prayer observance.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('admissions')}
              className="inline-flex items-center gap-2 bg-[#093c20] hover:bg-emerald-900 text-white font-poppins font-semibold text-xs sm:text-sm px-6 py-3 rounded-full transition-transform hover:scale-105"
            >
              <span>Apply for Boarding Admission</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
