import React, { useState } from 'react';
import { FacilityItem } from '../types/school';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import {
  Trophy,
  BookOpen,
  FlaskConical,
  Building2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface FacilitiesPageProps {
  facilities: FacilityItem[];
  onNavigate: (page: string) => void;
}

export const FacilitiesPage: React.FC<FacilitiesPageProps> = ({
  facilities,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Dynamically collect unique categories from current facilities
  const defaultCategoryList = ['All', 'Sports & Recreation', 'Academic Learning', 'Science & Practical', 'Administrative'];
  const allCategories = ['All', ...Array.from(new Set(facilities.map(f => f.category?.trim()).filter(Boolean)))];
  const displayCategories = allCategories.length > 1 ? allCategories : defaultCategoryList;

  const filteredFacilities =
    selectedCategory === 'All'
      ? facilities
      : facilities.filter((f) => {
          if (selectedCategory === 'Academic Learning') {
            return f.category === 'Academic Learning' || f.category === 'Technology';
          }
          return f.category?.toLowerCase() === selectedCategory.toLowerCase();
        });

  return (
    <div className="space-y-16 py-8">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#093c20] text-white rounded-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden border-b-4 border-yellow-400 shadow-md">
          <div className="relative max-w-4xl space-y-3">
            <span className="text-xs uppercase font-poppins font-bold tracking-widest text-yellow-400 bg-[#062c17] px-3 py-1 rounded-full border border-yellow-400/30 inline-block">
              Campus Infrastructure
            </span>
            <h1 className="font-poppins font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
              School Facilities
            </h1>
            <p className="font-poppins text-stone-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Al-Niima Academy provides standard, purpose-built educational facilities designed to nurture the intellect, character, and physical health of every student in Dutse, Jigawa State.
            </p>
          </div>
        </div>
      </section>

      {/* Facilities Overview Filter & Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#093c20]">
              School Facilities ({facilities.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Documented campus learning, science, sports, and administrative facilities.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {displayCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-emerald-800 text-white font-semibold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((fac, idx) => (
            <div
              key={idx}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Visual placeholder or real image */}
                {fac.imageUrl ? (
                  <img
                    src={fac.imageUrl}
                    alt={fac.name}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <ImagePlaceholder
                    label={fac.name}
                    category={fac.category}
                    aspect="video"
                  />
                )}

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {fac.category}
                    </span>
                    <span className="text-[11px] text-stone-400">Facility #{idx + 1}</span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-emerald-950">
                    {fac.name}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {fac.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4 pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
                <span>Al-Niima Academy, Dutse</span>
                <span className="text-emerald-700 font-medium">Verified Facility</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Real Photos Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-stone-100 border border-stone-300 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif font-bold text-base text-stone-900">
              School Photography Notice
            </h4>
            <p className="text-xs text-stone-600 max-w-xl">
              Al-Niima Academy values transparency. We do not display generic or stock photos. Official photographs of our sports courts, laboratories, and classrooms are uploaded directly by school administrators in the School Gallery.
            </p>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded transition-colors whitespace-nowrap"
          >
            Visit School Gallery
          </button>
        </div>
      </section>
    </div>
  );
};
