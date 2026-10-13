import React from 'react';
import { SchoolBadge } from '../components/SchoolBadge';
import {
  Compass,
  Target,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Users2,
  BookOpen,
} from 'lucide-react';
import { SchoolData } from '../types/school';

interface AboutPageProps {
  data: SchoolData;
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ data, onNavigate }) => {
  const { general, missionVision, ethosAndValues } = data;

  return (
    <div className="space-y-16 sm:space-y-20 py-8">
      {/* Page Title & Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#093c20] text-white rounded-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden border-b-4 border-yellow-400 shadow-md">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative max-w-4xl space-y-4">
            <span className="text-xs uppercase font-poppins font-bold tracking-widest text-yellow-400 bg-[#062c17] px-3 py-1 rounded-full border border-yellow-400/30 inline-block">
              About Al-Niima Academy
            </span>
            <h1 className="font-poppins font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
              About <span className="text-yellow-400 whitespace-nowrap">Al-Niima Academy</span>
            </h1>
            <p className="font-poppins text-yellow-400 text-xs sm:text-sm font-semibold">
              “{general.motto}”
            </p>
            <p className="text-stone-200 text-xs sm:text-sm leading-relaxed max-w-2xl font-poppins">
              Located behind Godiya Miyetti Housing Estate, Jigawar Tsada in Dutse, Jigawa State, Al-Niima Academy delivers standard education and sound morals to prepare boys and girls for responsible leadership.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="bg-white border-2 border-[#093c20]/10 hover:border-[#093c20]/40 rounded-2xl p-8 shadow-xs hover-lift transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#093c20] text-yellow-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#093c20] group-hover:text-emerald-800 transition-colors">
                Our Mission
              </h2>
              <blockquote className="border-l-4 border-yellow-400 pl-4 py-1 italic font-poppins text-base sm:text-lg text-[#093c20] font-medium">
                “{missionVision.mission}”
              </blockquote>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                Providing high standards of learning and moral guidance for every student.
              </p>
            </div>
          </div>

          {/* Vision Card */}
          <div className="bg-white border-2 border-[#093c20]/10 hover:border-[#093c20]/40 rounded-2xl p-8 shadow-xs hover-lift transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#093c20] text-yellow-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#093c20] group-hover:text-emerald-800 transition-colors">
                Our Vision
              </h2>
              <blockquote className="border-l-4 border-yellow-400 pl-4 py-1 italic font-poppins text-base sm:text-lg text-[#093c20] font-medium">
                “{missionVision.vision}”
              </blockquote>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                Raising children capable of integrating into society and meeting worldwide challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ETHOS AND VALUES (ALL 13 DOCUMENTED VALUES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
            School Ethos & Moral Code
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-950">
            Our Core School Values
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            The Al-Niima Academy admission handbook outlines thirteen guiding principles that shape student discipline, teacher interaction, and classroom culture every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {ethosAndValues.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs hover:border-emerald-800 hover:shadow-md hover-lift transition-all group flex flex-col justify-start min-w-0 break-words overflow-hidden"
            >
              <div className="flex items-start gap-3 mb-2 min-w-0">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#093c20] group-hover:text-yellow-400 transition-colors">
                  {idx + 1}
                </span>
                <h3 className="font-poppins font-bold text-base text-emerald-950 group-hover:text-emerald-800 transition-colors leading-snug break-words min-w-0">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed break-words mt-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center bg-white border border-stone-200 rounded-xl p-8 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-emerald-950">
            Would you like to visit our Dutse Academy?
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
            Parents and guardians are warmly invited to visit our administrative office behind Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse, during official school hours.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('contact')}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs sm:text-sm px-6 py-2.5 rounded transition-colors"
            >
              Get In Touch With The School
            </button>
            <button
              onClick={() => onNavigate('admissions')}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm px-6 py-2.5 rounded transition-colors"
            >
              Apply for Admission
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
