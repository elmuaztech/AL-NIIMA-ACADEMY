import React from 'react';
import { SchoolSection } from '../types/school';
import {
  Baby,
  Smile,
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  Home,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface SectionsPageProps {
  sections: SchoolSection[];
  onNavigate: (page: string) => void;
}

export const SectionsPage: React.FC<SectionsPageProps> = ({
  sections,
  onNavigate,
}) => {
  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'creche':
        return <Baby className="w-6 h-6 text-amber-500" />;
      case 'kindergarten':
        return <Smile className="w-6 h-6 text-amber-500" />;
      case 'nursery':
        return <Sparkles className="w-6 h-6 text-amber-500" />;
      case 'primary':
        return <BookOpen className="w-6 h-6 text-amber-500" />;
      case 'jss':
        return <GraduationCap className="w-6 h-6 text-amber-500" />;
      case 'sss':
        return <Award className="w-6 h-6 text-amber-500" />;
      case 'alevel':
        return <GraduationCap className="w-6 h-6 text-amber-500" />;
      case 'boarding':
        return <Home className="w-6 h-6 text-amber-500" />;
      default:
        return <BookOpen className="w-6 h-6 text-amber-500" />;
    }
  };

  // Group sections by category
  const categories = [
    { title: 'Early Years Foundation', items: sections.filter((s) => s.category === 'Early Years') },
    { title: 'Primary School Education', items: sections.filter((s) => s.category === 'Primary School') },
    { title: 'Secondary School Education', items: sections.filter((s) => s.category === 'Secondary School') },
    { title: 'Advanced Studies & Boarding', items: sections.filter((s) => s.category === 'Advanced Studies' || s.category === 'Boarding') },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#093c20] text-white rounded-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden border-b-4 border-yellow-400 shadow-md">
          <div className="relative max-w-4xl space-y-3">
            <span className="text-xs uppercase font-poppins font-bold tracking-widest text-yellow-400 bg-[#062c17] px-3 py-1 rounded-full border border-yellow-400/30 inline-block">
              Academic Structure
            </span>
            <h1 className="font-poppins font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
              School Sections
            </h1>
            <p className="font-poppins text-stone-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Al-Niima Academy provides a complete continuum of learning from early formative years through secondary and A’level education, with separate male and female boarding facilities.
            </p>
          </div>
        </div>
      </section>

      {/* Sections Grouped */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {categories.map((group, gIdx) => (
          <div key={gIdx} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-emerald-950">
                {group.title}
              </h2>
              <div className="h-0.5 flex-1 bg-stone-100"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.items.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-white border border-stone-200 hover:border-emerald-800/50 rounded-xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-lg bg-[#093c20] text-yellow-400 flex items-center justify-center shadow-xs">
                        {getSectionIcon(sec.id)}
                      </div>
                      <span className="text-[11px] font-bold text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded border border-yellow-200 uppercase tracking-wide">
                        {sec.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-poppins font-bold text-xl text-[#093c20] mt-0.5">
                        {sec.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {sec.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between">
                    {sec.id === 'boarding' ? (
                      <button
                        onClick={() => onNavigate('boarding')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                      >
                        <span>View Boarding Hostels</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : sec.id === 'jss' || sec.id === 'sss' || sec.id === 'alevel' ? (
                      <button
                        onClick={() => onNavigate('academics')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                      >
                        <span>Explore Subjects & Clubs</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate('admissions')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                      >
                        <span>Admission Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <span className="text-[11px] text-stone-400">Al-Niima Academy</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Boarding Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-emerald-900 text-white rounded-xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border-t-4 border-amber-400">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
              Interested in Day or Boarding Enrollment?
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 max-w-xl">
              Al-Niima Academy accommodates both day pupils and boarders. Separate hostels for male and female students are managed with 24/7 security and clean water.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => onNavigate('boarding')}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded border border-emerald-600 transition-colors"
            >
              Boarding Facilities
            </button>
            <button
              onClick={() => onNavigate('admissions')}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded transition-colors"
            >
              Apply for Admission
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
