import React, { useState } from 'react';
import { AcademicsInfo, ClubItem } from '../types/school';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Atom,
  Languages,
  Calculator,
  Compass,
  Laptop,
  Scale,
  Palette,
  Briefcase,
  Layers,
} from 'lucide-react';

interface AcademicsPageProps {
  academics: AcademicsInfo;
  clubs: ClubItem[];
  onNavigate: (page: string) => void;
}

export const AcademicsPage: React.FC<AcademicsPageProps> = ({
  academics,
  clubs,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'jss' | 'sss' | 'alevel' | 'clubs'>('jss');
  const [selectedClubCategory, setSelectedClubCategory] = useState<string>('All');

  const clubCategories = ['All', ...Array.from(new Set(clubs.map((c) => c.category)))];

  const filteredClubs =
    selectedClubCategory === 'All'
      ? clubs
      : clubs.filter((c) => c.category === selectedClubCategory);

  const getSubjectIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('english') || lower.includes('hausa') || lower.includes('arabic')) {
      return <Languages className="w-5 h-5 text-amber-500" />;
    }
    if (lower.includes('mathematics')) {
      return <Calculator className="w-5 h-5 text-amber-500" />;
    }
    if (lower.includes('science')) {
      return <Atom className="w-5 h-5 text-amber-500" />;
    }
    if (lower.includes('digital') || lower.includes('technology')) {
      return <Laptop className="w-5 h-5 text-amber-500" />;
    }
    if (lower.includes('business')) {
      return <Briefcase className="w-5 h-5 text-amber-500" />;
    }
    if (lower.includes('art')) {
      return <Palette className="w-5 h-5 text-amber-500" />;
    }
    if (lower.includes('citizenship') || lower.includes('irk')) {
      return <Scale className="w-5 h-5 text-amber-500" />;
    }
    return <BookOpen className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="space-y-14 py-8">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#093c20] text-white rounded-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden border-b-4 border-yellow-400 shadow-md">
          <div className="relative max-w-4xl space-y-3">
            <span className="text-xs uppercase font-poppins font-bold tracking-widest text-yellow-400 bg-[#062c17] px-3 py-1 rounded-full border border-yellow-400/30 inline-block">
              Teaching & Learning
            </span>
            <h1 className="font-poppins font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
              Academics & Co-Curricular
            </h1>
            <p className="font-poppins text-stone-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
              At Al-Niima Academy, our curriculum imparts high academic standards grounded in morals from early years through secondary and A'level.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex border-b-2 border-stone-200 overflow-x-auto gap-2 pb-1 text-xs sm:text-sm font-poppins font-semibold">
          <button
            onClick={() => setActiveTab('jss')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'jss'
                ? 'bg-[#093c20] text-yellow-400 font-bold border-b-2 border-yellow-400'
                : 'text-stone-600 hover:text-[#093c20] hover:bg-emerald-50'
            }`}
          >
            Junior Secondary School (JSS Subjects)
          </button>
          <button
            onClick={() => setActiveTab('sss')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'sss'
                ? 'bg-[#093c20] text-yellow-400 font-bold border-b-2 border-yellow-400'
                : 'text-stone-600 hover:text-[#093c20] hover:bg-emerald-50'
            }`}
          >
            Senior Secondary School (SSS)
          </button>
          <button
            onClick={() => setActiveTab('alevel')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'alevel'
                ? 'bg-[#093c20] text-yellow-400 font-bold border-b-2 border-yellow-400'
                : 'text-stone-600 hover:text-[#093c20] hover:bg-emerald-50'
            }`}
          >
            A’level Programme
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'clubs'
                ? 'bg-emerald-800 text-white font-semibold'
                : 'text-stone-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            Clubs & Activities
          </button>
        </div>

        {/* Tab 1: JSS Curriculum */}
        {activeTab === 'jss' && (
          <div className="pt-8 space-y-6">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Documented Curriculum
              </span>
              <h2 className="font-serif font-bold text-2xl text-emerald-950">
                Junior Secondary School Subjects
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                As detailed in the school admission handbook, Al-Niima Academy offers a robust basic education syllabus covering sciences, languages, pre-vocational skills, creative arts, and digital technology.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {academics.jssSubjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs hover:border-emerald-800/40 transition-colors flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-md bg-emerald-900/10 text-emerald-900 flex items-center justify-center shrink-0">
                    {getSubjectIcon(sub.name)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-emerald-950">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-lg flex items-center justify-between flex-wrap gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-emerald-900">National Examination Preparation</span>
                <p className="text-stone-600">
                  Prepares candidates thoroughly for Basic Education Certificate Examinations (BECE/NECO).
                </p>
              </div>
              <button
                onClick={() => onNavigate('admissions')}
                className="bg-emerald-800 text-white font-medium px-4 py-2 rounded hover:bg-emerald-900 transition-colors shrink-0"
              >
                Apply for JSS Admission
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: SSS */}
        {activeTab === 'sss' && (
          <div className="pt-8 space-y-6">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Senior Secondary Level
              </span>
              <h2 className="font-serif font-bold text-2xl text-emerald-950">
                Senior Secondary School (SSS)
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {academics.sssInformation}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded bg-emerald-900 text-amber-300 flex items-center justify-center">
                  <Atom className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-emerald-950">
                  Science Stream
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Focusing on hands-on laboratory experience, scientific methodology, and analytical thinking in modern science laboratories.
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded bg-emerald-900 text-amber-300 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-emerald-950">
                  Commercial Stream
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Developing competencies in financial literacy, business principles, accounting practices, and economic development.
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded bg-emerald-900 text-amber-300 flex items-center justify-center">
                  <Languages className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-emerald-950">
                  Humanities & Arts Stream
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Cultivating rich expression in languages, literature, religious knowledge, history, and civic governance.
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-500 italic">
              Note: Specific subject combinations and examination schedules are coordinated by the school academic office and can be updated by the administrator.
            </p>
          </div>
        )}

        {/* Tab 3: A'level */}
        {activeTab === 'alevel' && (
          <div className="pt-8 space-y-6">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Pre-University Studies
              </span>
              <h2 className="font-serif font-bold text-2xl text-emerald-950">
                A’level Programme
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {academics.aLevelInformation}
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h3 className="font-serif font-bold text-lg text-emerald-950">
                Key Benefits of the Al-Niima A’level Pathway
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Rigorous pre-university academic coaching under qualified subject specialists.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Option of full boarding in separate male or female hostels with quiet prep hours.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Direct entry pathway preparation for tertiary admissions.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: Clubs & Activities */}
        {activeTab === 'clubs' && (
          <div className="pt-8 space-y-6">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Co-Curricular Development
              </span>
              <h2 className="font-serif font-bold text-2xl text-emerald-950">
                School Clubs & Societies
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                The school handbook documents 14 active clubs ensuring every child develops character, leadership, creativity, sportsmanship, and practical life skills.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 text-xs">
              {clubCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedClubCategory(cat)}
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    selectedClubCategory === cat
                      ? 'bg-emerald-800 text-white font-semibold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClubs.map((club, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs space-y-2 hover:border-emerald-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {club.category}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-emerald-950">
                    {club.name}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {club.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
