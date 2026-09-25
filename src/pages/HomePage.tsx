import React, { useState } from 'react';
import { SchoolBadge } from '../components/SchoolBadge';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { ScrollReveal } from '../components/ScrollReveal';
import {
  GraduationCap,
  BookOpen,
  Compass,
  Home as HomeIcon,
  Shield,
  Zap,
  Droplets,
  Utensils,
  Award,
  Users,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  MapPin,
  Heart,
  Target,
  Phone,
  Mail,
  Clock,
  Send,
  Building,
  Atom,
  Languages,
  Calculator,
  Laptop,
  Camera,
  Layers,
  FileText,
  AlertCircle,
  X,
  Play,
  Video,
  Film,
  Eye,
} from 'lucide-react';
import { SchoolData, GalleryItem, VideoItem } from '../types/school';
import { api } from '../services/api';

interface HomePageProps {
  data: SchoolData;
  galleryItems?: GalleryItem[];
  videos?: VideoItem[];
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  data,
  galleryItems = [],
  videos = [],
  onNavigate,
}) => {
  const { general, hero, missionVision, sections, boarding, facilities, ethosAndValues, academics, clubs, admissions } = data;

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Detail Modal State (Academics / Gallery / Admissions)
  const [activeModal, setActiveModal] = useState<'academics' | 'gallery' | 'admissions' | null>(null);
  const [academicTab, setAcademicTab] = useState<'jss' | 'sss' | 'alevel' | 'clubs'>('jss');
  const [galleryFilter, setGalleryFilter] = useState<string>('All');
  const [mediaTypeTab, setMediaTypeTab] = useState<'all' | 'videos' | 'photos'>('all');
  const [selectedVideoModal, setSelectedVideoModal] = useState<VideoItem | null>(null);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<GalleryItem | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactError(null);
    setContactSuccess(false);

    try {
      await api.submitContact(contactForm);
      setContactSuccess(true);
      setContactForm({
        name: '',
        phone: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
      });
    } catch (err: any) {
      setContactError(err.message || 'Unable to submit message. Please try again.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const galleryCategories = ['All', 'Campus', 'Academics', 'Boarding', 'Events', 'Sports'];
  const filteredGallery = galleryFilter === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === galleryFilter);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ============================================================== */}
      {/* 1. HERO SECTION (id="home") */}
      {/* ============================================================== */}
      <section
        id="home"
        className="relative scroll-mt-20 overflow-hidden bg-[#093c20] text-white pt-3 pb-6 sm:pt-5 sm:pb-8 md:pt-6 md:pb-10 border-b-4 border-yellow-400"
      >
        {/* Real School Campus Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{
            backgroundImage: `url('/assets/images/hero-bg.jpg')`,
          }}
        />
        {/* Rich Green Gradient Overlay for Maximum Readability and Professional School Branding */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#051f10]/88 via-[#093c20]/82 to-[#051f10]/92" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-2.5 sm:space-y-3.5 md:space-y-4 animate-fade-in">
          {/* Official School Logo at top of WELCOME TO with prominent larger size and clean distinct spacing */}
          <div className="flex justify-center mb-3 sm:mb-4 md:mb-4.5 animate-fade-in-down">
            <div
              className="relative group cursor-pointer"
              onClick={() => onNavigate('about')}
              title="Al-Niima Academy Official Emblem"
            >
              <div className="absolute -inset-2 bg-yellow-400/40 rounded-full blur-sm group-hover:bg-yellow-400/70 transition-all duration-500 animate-pulse-glow" />
              <SchoolBadge
                size="hero"
                className="relative shadow-2xl border-4 border-yellow-400 bg-white p-1 hover:scale-105 transition-transform duration-300 animate-float"
              />
            </div>
          </div>

          {/* Main Title in Poppins Font: WELCOME TO at top, school name below in a single straight line */}
          <div className="space-y-1 sm:space-y-1.5 animate-fade-in-up">
            <p className="font-poppins font-black text-xs sm:text-base md:text-lg lg:text-xl text-white tracking-widest uppercase drop-shadow-md">
              WELCOME TO
            </p>
            <h1 className="font-poppins font-black text-2xl min-[380px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-yellow-400 tracking-tight leading-tight uppercase drop-shadow-lg whitespace-nowrap transition-transform duration-300 hover:scale-[1.01]">
              AL-NIIMA ACADEMY
            </h1>
          </div>

          {/* Subtitle */}
          <p className="font-poppins text-stone-100 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-sm animate-fade-in-up">
            A center of excellence in Dutse, Jigawa State, dedicated to raising confident, intelligent, and morally sound future leaders.
          </p>

          {/* Pill Action Buttons */}
          <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 animate-fade-in-up">
            <button
              onClick={() => onNavigate('admissions')}
              className="bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-poppins font-bold text-xs sm:text-sm md:text-base px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-yellow-400/30 hover:shadow-xl active:scale-95 cursor-pointer"
            >
              Enroll Today
            </button>

            <button
              onClick={() => onNavigate('about')}
              className="border-2 border-white hover:bg-white/10 hover:border-yellow-300 hover:text-yellow-300 text-white font-poppins font-semibold text-xs sm:text-sm md:text-base px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. ABOUT SECTION (id="about") — Mission, Vision & 13 Core Values */}
      {/* ============================================================== */}
      <section id="about" className="scroll-mt-20 sm:scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <ScrollReveal animation="fade-up" delay={50}>
            <div className="bg-white border-2 border-emerald-900/10 hover:border-emerald-700/50 rounded-2xl p-8 sm:p-10 shadow-xs hover-lift transition-all relative overflow-hidden flex flex-col justify-between group h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#093c20] text-yellow-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#093c20] group-hover:text-emerald-800 transition-colors">
                  Our Mission
                </h2>
                <blockquote className="border-l-4 border-yellow-400 pl-4 py-1 italic font-poppins text-base sm:text-lg text-emerald-900 font-medium">
                  “{missionVision.mission}”
                </blockquote>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  We are committed to delivering standard education and solid moral values to prepare every child for leadership.
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-400">Moral & Intellectual Foundation</span>
                <ChevronRight className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          </ScrollReveal>

          {/* Vision Card */}
          <ScrollReveal animation="fade-up" delay={150}>
            <div className="bg-white border-2 border-emerald-900/10 hover:border-emerald-700/50 rounded-2xl p-8 sm:p-10 shadow-xs hover-lift transition-all relative overflow-hidden flex flex-col justify-between group h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#093c20] text-yellow-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300">
                  <Compass className="w-6 h-6" />
                </div>
                <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#093c20] group-hover:text-emerald-800 transition-colors">
                  Our Vision
                </h2>
                <blockquote className="border-l-4 border-yellow-400 pl-4 py-1 italic font-poppins text-base sm:text-lg text-emerald-900 font-medium">
                  “{missionVision.vision}”
                </blockquote>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  Developing capable children ready to integrate into society and meet worldwide educational challenges.
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-400">Global Perspective & Excellence</span>
                <ChevronRight className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* 13 Core School Values */}
        <div>
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="font-poppins text-xs font-bold text-[#093c20] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
                Our Moral Foundation
              </span>
              <h3 className="font-poppins font-bold text-2xl sm:text-4xl text-[#093c20]">
                The 13 Core School Values
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-stone-600">
                Drawn verbatim from the school handbook to shape disciplined learning, integrity, and world-class leadership.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {ethosAndValues.map((val, idx) => (
              <ScrollReveal key={idx} animation="fade-up" delay={(idx % 4) * 50}>
                <div className="bg-white border border-stone-200 rounded-xl p-5 hover:border-[#093c20] shadow-2xs hover:shadow-md hover-lift transition-all space-y-2 group h-full">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#093c20] text-xs font-bold flex items-center justify-center shrink-0 group-hover:bg-[#093c20] group-hover:text-yellow-400 transition-colors">
                      {idx + 1}
                    </span>
                    <h4 className="font-poppins font-bold text-sm sm:text-base text-[#093c20] group-hover:text-emerald-800 transition-colors">
                      {val.title}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {val.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. SECTIONS (id="sections") — Educational Levels */}
      {/* ============================================================== */}
      <section id="sections" className="scroll-mt-20 sm:scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="font-poppins text-xs font-bold text-[#093c20] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
              Educational Levels
            </span>
            <h2 className="font-poppins font-bold text-2xl sm:text-4xl text-[#093c20]">
              Complete School Structure
            </h2>
            <p className="font-poppins text-xs sm:text-sm text-stone-600">
              Al-Niima Academy is not just a primary school. We provide a full continuum of learning from early childhood through secondary and A’level studies.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((sec, idx) => (
            <ScrollReveal key={sec.id} animation="fade-up" delay={idx * 50}>
              <div className="bg-white border border-stone-200 hover:border-[#093c20] rounded-2xl p-6 shadow-xs hover:shadow-lg hover-lift transition-all flex flex-col justify-between group h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded border border-yellow-200 uppercase tracking-wide">
                      {sec.category}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      {sec.ageRange}
                    </span>
                  </div>

                  <h3 className="font-poppins font-bold text-xl text-[#093c20] group-hover:text-emerald-800 transition-colors">
                    {sec.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {sec.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (sec.id === 'boarding') {
                        onNavigate('boarding');
                      } else {
                        onNavigate('admissions');
                      }
                    }}
                    className="font-poppins inline-flex items-center gap-1 text-xs font-bold text-[#093c20] hover:text-emerald-700 transition-colors cursor-pointer group-hover:translate-x-1 duration-200"
                  >
                    <span>Enroll in {sec.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-yellow-500" />
                  </button>
                  <span className="text-[10px] text-stone-400">Dutse Academy</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. GALLERY & MEDIA SECTION (id="gallery") — RIGHT AFTER SECTIONS */}
      {/* ============================================================== */}
      <section id="gallery" className="scroll-mt-20 sm:scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="font-poppins text-xs font-bold text-[#093c20] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
                Visual Records & Media
              </span>
              <h2 className="font-poppins font-bold text-2xl sm:text-4xl text-[#093c20] mt-2">
                Moments at Al-Niima Academy
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
                Explore official video recordings and authentic photographic highlights of academic excellence, discipline, student life, and campus events.
              </p>
            </div>

            <button
              onClick={() => setActiveModal('gallery')}
              className="font-poppins inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#093c20] hover:text-emerald-700 whitespace-nowrap self-start sm:self-auto transition-colors cursor-pointer group bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200"
            >
              <span>View Full Album & Media</span>
              <Film className="w-4 h-4 text-yellow-600 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Media Category Tabs: All, Videos, Photos */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setMediaTypeTab('all')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mediaTypeTab === 'all'
                    ? 'bg-[#093c20] text-yellow-400 shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Media ({galleryItems.length + videos.length})</span>
              </button>

              <button
                onClick={() => setMediaTypeTab('videos')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mediaTypeTab === 'videos'
                    ? 'bg-[#093c20] text-yellow-400 shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-yellow-500" />
                <span>School Videos ({videos.length})</span>
              </button>

              <button
                onClick={() => setMediaTypeTab('photos')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mediaTypeTab === 'photos'
                    ? 'bg-[#093c20] text-yellow-400 shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photographs ({galleryItems.length})</span>
              </button>
            </div>

            {/* Subcategories for photos */}
            {mediaTypeTab === 'photos' && galleryItems.length > 0 && (
              <div className="flex flex-wrap gap-1.5 text-xs">
                {galleryCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGalleryFilter(cat)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                      galleryFilter === cat
                        ? 'bg-yellow-400 text-stone-950 shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Media Grid Display */}
        {(() => {
          const showVideos = mediaTypeTab === 'all' || mediaTypeTab === 'videos';
          const showPhotos = mediaTypeTab === 'all' || mediaTypeTab === 'photos';
          const displayedPhotos = mediaTypeTab === 'photos' ? filteredGallery : galleryItems;

          const hasContent =
            (showVideos && videos.length > 0) || (showPhotos && displayedPhotos.length > 0);

          if (!hasContent) {
            return (
              <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#093c20] flex items-center justify-center mx-auto">
                  {mediaTypeTab === 'videos' ? (
                    <Video className="w-6 h-6" />
                  ) : (
                    <Camera className="w-6 h-6" />
                  )}
                </div>
                <h3 className="font-poppins font-bold text-base text-stone-800">
                  {mediaTypeTab === 'videos'
                    ? 'No School Videos Published Yet'
                    : 'Campus Photographs Coming Soon'}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  {mediaTypeTab === 'videos'
                    ? 'Official school recordings and event videos will appear here once uploaded from the administration dashboard.'
                    : 'Photographs will appear here once uploaded and published from the administration dashboard.'}
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-8">
              {/* VIDEOS SECTION (when in 'all' or 'videos') */}
              {showVideos && videos.length > 0 && (
                <div className="space-y-4">
                  {mediaTypeTab === 'all' && (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#093c20] uppercase tracking-wider">
                      <Video className="w-4 h-4 text-yellow-600" />
                      <span>Official School Videos ({videos.length})</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((vid, idx) => (
                      <ScrollReveal key={vid.id || idx} animation="fade-up" delay={idx * 60}>
                        <div
                          onClick={() => setSelectedVideoModal(vid)}
                          className="bg-white border border-stone-200 hover:border-[#093c20] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between h-full"
                        >
                          <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                            {vid.thumbnail ? (
                              <img
                                src={vid.thumbnail}
                                alt={vid.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-stone-900 to-[#093c20] flex items-center justify-center">
                                <Video className="w-12 h-12 text-yellow-400/40" />
                              </div>
                            )}

                            {/* Centered Play Button Overlay */}
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-yellow-400 text-stone-950 flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-yellow-300 transition-all duration-300">
                                <Play className="w-6 h-6 fill-stone-950 ml-1" />
                              </div>
                            </div>

                            {/* Video Badge */}
                            <div className="absolute top-2.5 left-2.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                                <Video className="w-3 h-3 text-yellow-400" />
                                <span>Official Video</span>
                              </span>
                            </div>

                            {/* Compression/Size Info Badge */}
                            {vid.fileSize && (
                              <div className="absolute bottom-2.5 right-2.5">
                                <span className="text-[10px] font-medium text-stone-200 bg-black/75 px-2 py-0.5 rounded backdrop-blur-xs">
                                  {(vid.fileSize / (1024 * 1024)).toFixed(1)} MB
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-poppins font-bold text-sm sm:text-base text-[#093c20] group-hover:text-emerald-700 transition-colors line-clamp-1">
                                {vid.title}
                              </h4>
                              {vid.description && (
                                <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                                  {vid.description}
                                </p>
                              )}
                            </div>

                            <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                              <span className="font-medium text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                <Play className="w-3 h-3 fill-emerald-800" />
                                <span>Click to Play Recording</span>
                              </span>
                              <span>Al-Niima Dutse</span>
                            </div>
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}

              {/* PHOTOGRAPHS SECTION (when in 'all' or 'photos') */}
              {showPhotos && displayedPhotos.length > 0 && (
                <div className="space-y-4">
                  {mediaTypeTab === 'all' && (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#093c20] uppercase tracking-wider pt-2">
                      <Camera className="w-4 h-4 text-yellow-600" />
                      <span>School Photographs ({displayedPhotos.length})</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {displayedPhotos.slice(0, 8).map((item, idx) => (
                      <ScrollReveal key={item.id || idx} animation="fade-up" delay={idx * 50}>
                        <div
                          onClick={() => setSelectedPhotoModal(item)}
                          className="bg-white border border-stone-200 hover:border-[#093c20] rounded-xl overflow-hidden shadow-2xs hover:shadow-lg transition-all group cursor-pointer h-full flex flex-col justify-between"
                        >
                          <div className="relative aspect-video bg-stone-100 overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                              <span className="text-white text-xs font-semibold flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-yellow-400" />
                                <span>Preview Photo</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5 space-y-1">
                            <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wide bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                              {item.category}
                            </span>
                            <h4 className="font-poppins font-bold text-xs sm:text-sm text-[#093c20] group-hover:text-emerald-800 transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-[11px] text-stone-500 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* ============================================================== */}
      {/* 5. ACADEMICS SECTION (id="academics") */}
      {/* ============================================================== */}
      <section id="academics" className="scroll-mt-20 sm:scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="font-poppins text-xs font-bold text-[#093c20] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
              Scholastic Rigor & Curriculum
            </span>
            <h2 className="font-poppins font-bold text-2xl sm:text-4xl text-[#093c20]">
              Academic Programs & Curriculum
            </h2>
            <p className="font-poppins text-xs sm:text-sm text-stone-600">
              Integrating standard national curricula with international best practices, digital literacy, languages, and moral ethics across all school tiers.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* JSS Highlights */}
          <ScrollReveal animation="fade-up" delay={50}>
            <div className="bg-white border border-stone-200 hover:border-[#093c20] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-lg text-[#093c20]">
                    Junior Secondary (JSS 1-3)
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    14 core and pre-vocational subjects designed to provide broad-based knowledge in sciences, arts, ICT, languages, and business foundations.
                  </p>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span>Maths, English, Basic Science & Tech</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span>Hausa, Arabic & Islamic Studies</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span>Computer Studies & Business Basics</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-stone-100">
                <button
                  onClick={() => {
                    setAcademicTab('jss');
                    setActiveModal('academics');
                  }}
                  className="font-poppins inline-flex items-center gap-1.5 text-xs font-bold text-[#093c20] hover:text-emerald-700 transition-colors cursor-pointer group-hover:translate-x-1 duration-200"
                >
                  <span>View All 14 JSS Subjects</span>
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-500" />
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* SSS Streams */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="bg-white border border-stone-200 hover:border-[#093c20] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Atom className="w-5 h-5 text-[#093c20]" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-lg text-[#093c20]">
                    Senior Secondary (SSS 1-3)
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    Targeted specialization across Science, Commercial, and Arts streams rigorously preparing students for WAEC, NECO, and JAMB exams.
                  </p>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span>Pure Sciences: Physics, Chem, Bio, Further Maths</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span>Commercial: Accounting, Commerce, Economics</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span>Arts: Literature, Government, History, Arabic</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-stone-100">
                <button
                  onClick={() => {
                    setAcademicTab('sss');
                    setActiveModal('academics');
                  }}
                  className="font-poppins inline-flex items-center gap-1.5 text-xs font-bold text-[#093c20] hover:text-emerald-700 transition-colors cursor-pointer group-hover:translate-x-1 duration-200"
                >
                  <span>Explore SSS Streams & Exam Prep</span>
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-500" />
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* A-Level & Student Clubs */}
          <ScrollReveal animation="fade-up" delay={150}>
            <div className="bg-white border border-stone-200 hover:border-[#093c20] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-lg text-[#093c20]">
                    A-Level & Co-Curricular Clubs
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    Accelerated university entry programs (Cambridge/IJMB) alongside rich student organizations fostering leadership and creativity.
                  </p>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span>Cambridge & IJMB Advanced Programs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span>JET Club (Junior Engineers, Tech & Scientists)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span>Press & Debating Club, Red Cross Society</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-stone-100">
                <button
                  onClick={() => {
                    setAcademicTab('clubs');
                    setActiveModal('academics');
                  }}
                  className="font-poppins inline-flex items-center gap-1.5 text-xs font-bold text-[#093c20] hover:text-emerald-700 transition-colors cursor-pointer group-hover:translate-x-1 duration-200"
                >
                  <span>Discover Student Clubs</span>
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-500" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="text-center">
          <button
            onClick={() => setActiveModal('academics')}
            className="font-poppins inline-flex items-center gap-2 bg-[#093c20] hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-full shadow transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Explore Full Academic Curriculum & Clubs</span>
            <ArrowRight className="w-4 h-4 text-yellow-400" />
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. BOARDING SECTION (id="boarding") */}
      {/* ============================================================== */}
      <section id="boarding" className="scroll-mt-20 sm:scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal animation="zoom-in">
          <div className="bg-[#093c20] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border-b-4 border-yellow-400 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="relative max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-950 px-3.5 py-1 rounded-full text-xs font-semibold text-yellow-400 border border-yellow-400/30">
                <HomeIcon className="w-3.5 h-3.5 text-yellow-400" />
                <span>Male & Female Residential Hostels</span>
              </div>

              <h2 className="font-poppins font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight">
                A Safe, Disciplined Boarding Environment
              </h2>

              <p className="text-xs sm:text-base text-stone-200 leading-relaxed max-w-2xl font-poppins">
                Al-Niima Academy provides strictly segregated residential quarters for male and female students with round-the-clock security, clean running water, and wholesome meals prepared by school caterers.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Separate Male & Female Hostels</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Clean Running Water</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>24/7 Security Personnel</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Wholesome Daily Meals</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Supervised Prep Sessions</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Caring House Parents</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('admissions')}
                  className="bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-poppins font-bold text-xs sm:text-sm px-7 py-3 rounded-full transition-transform hover:scale-105 active:scale-95 shadow cursor-pointer"
                >
                  Apply for Boarding
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="border-2 border-white hover:bg-white/10 text-white font-poppins font-semibold text-xs sm:text-sm px-7 py-3 rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Schedule Hostel Tour
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ============================================================== */}
      {/* 6. FACILITIES SECTION (id="facilities") */}
      {/* ============================================================== */}
      <section id="facilities" className="scroll-mt-20 sm:scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-poppins text-xs font-bold text-[#093c20] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
                Campus Infrastructure
              </span>
              <h2 className="font-poppins font-bold text-2xl sm:text-4xl text-[#093c20] mt-2">
                Verified School Facilities
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Purpose-built amenities documented in the Al-Niima Academy official handbook.
              </p>
            </div>

            <button
              onClick={() => onNavigate('contact')}
              className="font-poppins inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#093c20] hover:text-emerald-700 whitespace-nowrap self-start sm:self-auto transition-colors cursor-pointer group"
            >
              <span>Visit Campus in Person</span>
              <ArrowRight className="w-4 h-4 text-yellow-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.slice(0, 4).map((fac, idx) => (
            <ScrollReveal key={idx} animation="fade-up" delay={idx * 60}>
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-lg hover-lift transition-all flex flex-col justify-between group h-full">
                <div>
                  <ImagePlaceholder label={fac.name} category={fac.category} aspect="video" />
                  <div className="p-4 space-y-1">
                    <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">
                      {fac.category}
                    </span>
                    <h3 className="font-poppins font-bold text-base text-[#093c20] group-hover:text-emerald-800 transition-colors">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {fac.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-1 border-t border-stone-100 text-[11px] text-stone-400">
                  Al-Niima Academy, Dutse
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. ADMISSIONS SECTION (id="admissions") */}
      {/* ============================================================== */}
      <section id="admissions" className="scroll-mt-20 sm:scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal animation="zoom-in">
          <div className="bg-[#093c20] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-xl border-b-4 border-yellow-400 hover:shadow-2xl transition-shadow duration-300">
            <div className="mx-auto flex justify-center animate-fade-in">
              <SchoolBadge size="xl" className="shadow-lg border-4 border-yellow-400 animate-float" />
            </div>

            <div className="max-w-2xl mx-auto space-y-2">
              <span className="font-poppins text-xs font-bold text-yellow-400 uppercase tracking-widest bg-emerald-950 px-3.5 py-1 rounded-full border border-yellow-400/30 inline-block">
                Admission In Progress
              </span>
              <h2 className="font-poppins font-black text-2xl sm:text-4xl text-white">
                Enroll Your Child at <span className="text-yellow-400">Al-Niima Academy</span>
              </h2>
              <p className="font-poppins text-xs sm:text-sm text-stone-200 leading-relaxed">
                Standard Education & Morals for World-Class Leadership. Applications are open for Crèche, Kindergarten, Nursery, Primary, JSS, SSS, and A’level studies with Day and Boarding options.
              </p>
            </div>

            {/* 4 Simple Steps */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-3xl mx-auto pt-2">
              <div className="bg-emerald-950/60 border border-yellow-400/20 p-3.5 rounded-xl">
                <span className="text-yellow-400 font-bold text-xs">Step 1</span>
                <p className="text-xs text-stone-200 font-medium mt-1">Visit Campus or Contact Us</p>
              </div>
              <div className="bg-emerald-950/60 border border-yellow-400/20 p-3.5 rounded-xl">
                <span className="text-yellow-400 font-bold text-xs">Step 2</span>
                <p className="text-xs text-stone-200 font-medium mt-1">Submit Required Documents</p>
              </div>
              <div className="bg-emerald-950/60 border border-yellow-400/20 p-3.5 rounded-xl">
                <span className="text-yellow-400 font-bold text-xs">Step 3</span>
                <p className="text-xs text-stone-200 font-medium mt-1">Assessment & Interview</p>
              </div>
              <div className="bg-emerald-950/60 border border-yellow-400/20 p-3.5 rounded-xl">
                <span className="text-yellow-400 font-bold text-xs">Step 4</span>
                <p className="text-xs text-stone-200 font-medium mt-1">Offer & Registration</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={() => setActiveModal('admissions')}
                className="bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-poppins font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Enroll Today / View Guide
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="border-2 border-white hover:bg-white/10 text-white font-poppins font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Contact Admissions Desk
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ============================================================== */}
      {/* 9. CONTACT SECTION (id="contact") */}
      {/* ============================================================== */}
      <section id="contact" className="scroll-mt-20 sm:scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="font-poppins text-xs font-bold text-[#093c20] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
              Reach Out To Us
            </span>
            <h2 className="font-poppins font-bold text-2xl sm:text-4xl text-[#093c20]">
              Campus Location & Inquiries
            </h2>
            <p className="font-poppins text-xs sm:text-sm text-stone-600">
              Have questions regarding admissions, boarding facilities, or visiting our campus? Contact our administrative office directly.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 space-y-4">
            <ScrollReveal animation="fade-up" delay={50}>
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="font-poppins font-bold text-lg text-[#093c20] border-b border-stone-100 pb-3">
                  School Contact Information
                </h3>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#093c20] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#093c20]" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">Campus Address</p>
                      <p className="text-stone-600 leading-relaxed mt-0.5">
                        {general.address || 'Behind Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse, Jigawa State'}
                      </p>
                    </div>
                  </div>

                  {/* Phone Lines */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">Telephone Lines</p>
                      <div className="space-y-1 mt-0.5">
                        {(general.phoneNumbers && general.phoneNumbers.length > 0
                          ? general.phoneNumbers
                          : ['+234 803 703 6447', '+234 803 408 8878']
                        ).map((num, i) => (
                          <p key={i}>
                            <a
                              href={`tel:${num.replace(/\s+/g, '')}`}
                              className="text-[#093c20] hover:underline font-semibold"
                            >
                              {num}
                            </a>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">Official Email</p>
                      <p className="text-stone-600 mt-0.5">
                        <a
                          href={`mailto:${general.email || 'info@alniimaacademy.edu.ng'}`}
                          className="text-[#093c20] hover:underline font-medium"
                        >
                          {general.email || 'info@alniimaacademy.edu.ng'}
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">Visiting & Office Hours</p>
                      <p className="text-stone-600 mt-0.5">
                        Monday – Friday: 7:30 AM – 4:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                <h3 className="font-poppins font-bold text-lg sm:text-xl text-[#093c20] mb-2">
                  Send a Direct Inquiry
                </h3>
                <p className="text-xs text-stone-500 mb-6 font-poppins">
                  Fill in your details below and our school admissions desk will respond promptly.
                </p>

                {contactSuccess && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold">Thank you for contacting Al-Niima Academy!</p>
                      <p className="text-emerald-800 mt-0.5">
                        Your inquiry has been received. Our administrative team will reach out to you shortly.
                      </p>
                    </div>
                  </div>
                )}

                {contactError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold">Submission error</p>
                      <p className="text-red-700 mt-0.5">{contactError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Ibrahim Mohammed"
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#093c20] focus:ring-1 focus:ring-[#093c20]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="e.g. 08031234567"
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#093c20] focus:ring-1 focus:ring-[#093c20]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="e.g. parent@example.com"
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#093c20] focus:ring-1 focus:ring-[#093c20]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Inquiry Subject
                      </label>
                      <select
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#093c20] focus:ring-1 focus:ring-[#093c20] bg-white"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Day Student Admission">Day Student Admission</option>
                        <option value="Boarding Admission">Boarding Admission</option>
                        <option value="School Fees & Requirements">School Fees & Requirements</option>
                        <option value="A'Level Studies">A’Level Studies</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Message / Question *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Please let us know how we can assist you..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#093c20] focus:ring-1 focus:ring-[#093c20]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full bg-[#093c20] hover:bg-emerald-900 text-yellow-400 font-poppins font-bold text-xs sm:text-sm py-3 rounded-lg shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingContact ? (
                      <span>Sending message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-yellow-400" />
                        <span>Send Message to Admissions</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* DETAIL MODAL: ACADEMICS CURRICULUM OVERVIEW */}
      {/* ============================================================== */}
      {activeModal === 'academics' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded border border-yellow-200 uppercase tracking-wide">
                  Academic Curriculum Overview
                </span>
                <h3 className="font-poppins font-bold text-2xl text-[#093c20] mt-1">
                  Al-Niima Academy Curricula & Clubs
                </h3>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
                {[
                  { id: 'jss', label: 'Junior Secondary (14 Subjects)' },
                  { id: 'sss', label: 'Senior Secondary (Streams)' },
                  { id: 'alevel', label: 'A’Level Studies' },
                  { id: 'clubs', label: 'Student Clubs & Societies' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setAcademicTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      academicTab === t.id
                        ? 'bg-[#093c20] text-yellow-400 shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {academicTab === 'jss' && (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    The Junior Secondary School at Al-Niima Academy implements a comprehensive Nigerian National curriculum enriched with Islamic moral guidance, Arabic, and early digital literacy:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {academics.jssSubjects.map((sub, i) => (
                      <div key={i} className="p-3 rounded-lg border border-stone-200 bg-stone-50">
                        <p className="font-bold text-xs text-[#093c20]">{sub.name}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">{sub.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {academicTab === 'sss' && (
                <div className="space-y-4 text-xs sm:text-sm text-stone-700">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <h4 className="font-bold text-[#093c20] text-sm">Three Specialized Streams</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {academics.sssInformation}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-stone-200">
                      <p className="font-bold text-xs text-[#093c20]">Science Track</p>
                      <p className="text-[11px] text-stone-500 mt-1">Physics, Chemistry, Biology, Further Mathematics, Technical Drawing, Agricultural Science.</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-stone-200">
                      <p className="font-bold text-xs text-[#093c20]">Commercial Track</p>
                      <p className="text-[11px] text-stone-500 mt-1">Financial Accounting, Commerce, Economics, Book Keeping, Office Practice.</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-stone-200">
                      <p className="font-bold text-xs text-[#093c20]">Arts & Humanities Track</p>
                      <p className="text-[11px] text-stone-500 mt-1">Literature in English, Government, Islamic Studies, Hausa, Arabic, History.</p>
                    </div>
                  </div>
                </div>
              )}

              {academicTab === 'alevel' && (
                <div className="space-y-4 text-xs sm:text-sm text-stone-700">
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <h4 className="font-bold text-purple-900 text-sm">Advanced Level & University Preparation</h4>
                    <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                      {academics.aLevelInformation}
                    </p>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Designed for secondary school graduates seeking direct entry admission into 200 level in Nigerian and overseas universities.
                  </p>
                </div>
              )}

              {academicTab === 'clubs' && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-600">
                    Students are required to join at least one club to build leadership, scientific inquiry, and cultural literacy:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clubs.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg border border-stone-200 bg-stone-50">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-[#093c20]">{c.name}</p>
                          <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                            {c.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="bg-[#093c20] text-white text-xs font-bold px-6 py-2.5 rounded-lg cursor-pointer hover:bg-emerald-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DETAIL MODAL: FULL GALLERY & MEDIA VIEW */}
      {/* ============================================================== */}
      {activeModal === 'gallery' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded border border-yellow-200 uppercase tracking-wide">
                  School Media & Records
                </span>
                <h3 className="font-poppins font-bold text-2xl text-[#093c20] mt-1">
                  Al-Niima Academy Photo & Video Archive
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Official photographs and video recordings of school activities, academic lectures, and sports.
                </p>
              </div>

              {/* Categorization Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setMediaTypeTab('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      mediaTypeTab === 'all'
                        ? 'bg-[#093c20] text-yellow-400'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    All Media ({galleryItems.length + videos.length})
                  </button>
                  <button
                    onClick={() => setMediaTypeTab('videos')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      mediaTypeTab === 'videos'
                        ? 'bg-[#093c20] text-yellow-400'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-yellow-500" />
                    <span>Videos ({videos.length})</span>
                  </button>
                  <button
                    onClick={() => setMediaTypeTab('photos')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      mediaTypeTab === 'photos'
                        ? 'bg-[#093c20] text-yellow-400'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photos ({galleryItems.length})</span>
                  </button>
                </div>

                {mediaTypeTab === 'photos' && galleryItems.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-xs">
                    {galleryCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setGalleryFilter(cat)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          galleryFilter === cat
                            ? 'bg-yellow-400 text-stone-950 font-bold'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Gallery Items Grid */}
              <div className="space-y-6">
                {/* Videos in Modal */}
                {(mediaTypeTab === 'all' || mediaTypeTab === 'videos') && videos.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#093c20] uppercase tracking-wide">
                      <Video className="w-4 h-4 text-yellow-600" />
                      <span>School Video Recordings ({videos.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {videos.map((vid) => (
                        <div
                          key={vid.id}
                          onClick={() => setSelectedVideoModal(vid)}
                          className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                            {vid.thumbnail ? (
                              <img
                                src={vid.thumbnail}
                                alt={vid.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                              />
                            ) : (
                              <div className="w-full h-full bg-stone-900 flex items-center justify-center">
                                <Video className="w-10 h-10 text-stone-600" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-yellow-400 text-stone-950 flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-black/75 px-2 py-0.5 rounded">
                              Official Video
                            </span>
                          </div>
                          <div className="p-3">
                            <h4 className="font-poppins font-bold text-xs sm:text-sm text-[#093c20] group-hover:text-emerald-700 transition-colors line-clamp-1">
                              {vid.title}
                            </h4>
                            {vid.description && (
                              <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                                {vid.description}
                              </p>
                            )}
                            <div className="pt-2 mt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                              <span>Al-Niima Academy</span>
                              <span className="text-emerald-800 font-semibold flex items-center gap-1">
                                <Play className="w-2.5 h-2.5 fill-emerald-800" /> Play
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos in Modal */}
                {(mediaTypeTab === 'all' || mediaTypeTab === 'photos') && (
                  <div className="space-y-3">
                    {mediaTypeTab === 'all' && galleryItems.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#093c20] uppercase tracking-wide">
                        <Camera className="w-4 h-4 text-yellow-600" />
                        <span>Campus Photographs ({filteredGallery.length})</span>
                      </div>
                    )}
                    {filteredGallery.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredGallery.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedPhotoModal(item)}
                            className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="aspect-video bg-stone-200 overflow-hidden">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-3">
                              <span className="text-[10px] font-bold text-yellow-700 uppercase">
                                {item.category}
                              </span>
                              <p className="font-bold text-xs text-[#093c20] mt-0.5">{item.title}</p>
                              {item.description && (
                                <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      mediaTypeTab === 'photos' && (
                        <div className="py-10 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-stone-200">
                          No photographs uploaded yet. Photographs published from the dashboard will appear here.
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Empty check when both are 0 */}
                {videos.length === 0 && galleryItems.length === 0 && (
                  <div className="py-12 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-stone-200">
                    No school media published yet. Photographs and videos published from the dashboard will appear here.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="bg-[#093c20] text-white text-xs font-bold px-6 py-2.5 rounded-lg cursor-pointer hover:bg-emerald-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DETAIL MODAL: ADMISSIONS REQUIREMENTS GUIDE */}
      {/* ============================================================== */}
      {activeModal === 'admissions' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded border border-yellow-200 uppercase tracking-wide">
                  Admissions Guide
                </span>
                <h3 className="font-poppins font-bold text-2xl text-[#093c20] mt-1">
                  How to Enroll at Al-Niima Academy
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <h4 className="font-bold text-amber-900 text-sm">Required Application Documents</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-amber-800">
                    {admissions.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                {admissions.notes && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <h4 className="font-bold text-[#093c20] text-sm">Important Admissions Notice</h4>
                    <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                      {admissions.notes}
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-sm">Application Procedure</h4>
                  <ol className="list-decimal pl-5 mt-2 space-y-1.5 text-xs text-stone-600">
                    {admissions.steps.map((st) => (
                      <li key={st.step}>
                        <strong className="text-stone-800">{st.title}: </strong>
                        <span>{st.desc}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <a
                  href="tel:+2348038382557"
                  className="font-poppins inline-flex items-center gap-1.5 text-xs font-bold text-[#093c20] hover:underline"
                >
                  <Phone className="w-4 h-4 text-yellow-500" />
                  <span>Call Admissions: +234 803 838 2557</span>
                </a>

                <button
                  onClick={() => {
                    setActiveModal(null);
                    onNavigate('contact');
                  }}
                  className="bg-yellow-400 hover:bg-yellow-300 text-stone-950 text-xs font-bold px-6 py-2.5 rounded-lg cursor-pointer"
                >
                  Inquire Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIDEO PLAYER MODAL */}
      {/* ============================================================== */}
      {selectedVideoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedVideoModal(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-950 border border-yellow-400/40 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#093c20] text-white border-b border-yellow-400/30">
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-stone-950 font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Play className="w-3 h-3 fill-stone-950" />
                  <span>Official Video</span>
                </span>
                <h3 className="font-poppins font-bold text-sm sm:text-base text-white truncate max-w-md">
                  {selectedVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVideoModal(null)}
                className="p-1.5 rounded-full hover:bg-emerald-900 text-stone-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close video player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Container */}
            <div className="aspect-video bg-black flex items-center justify-center relative">
              <video
                src={selectedVideoModal.url}
                poster={selectedVideoModal.thumbnail}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info Footer */}
            <div className="p-4 sm:p-5 bg-stone-950 text-white space-y-2">
              <h4 className="font-poppins font-bold text-base sm:text-lg text-yellow-400">
                {selectedVideoModal.title}
              </h4>
              {selectedVideoModal.description && (
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                  {selectedVideoModal.description}
                </p>
              )}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400 border-t border-stone-800">
                <span>Al-Niima Academy • Dutse, Jigawa State</span>
                {selectedVideoModal.fileSize && (
                  <span className="bg-stone-800 px-2 py-0.5 rounded text-[11px] text-stone-300 font-mono">
                    Size: {(selectedVideoModal.fileSize / (1024 * 1024)).toFixed(1)} MB (80-90% Optimized)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHOTO LIGHTBOX MODAL */}
      {/* ============================================================== */}
      {selectedPhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[75vh] bg-stone-950 flex items-center justify-center">
              <img
                src={selectedPhotoModal.imageUrl}
                alt={selectedPhotoModal.title}
                className="max-h-[75vh] w-auto object-contain mx-auto"
              />
            </div>
            <div className="p-4 sm:p-6 space-y-1 bg-white">
              <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded border border-yellow-200 uppercase">
                {selectedPhotoModal.category}
              </span>
              <h3 className="font-poppins font-bold text-lg text-[#093c20]">
                {selectedPhotoModal.title}
              </h3>
              {selectedPhotoModal.description && (
                <p className="text-xs sm:text-sm text-stone-600">
                  {selectedPhotoModal.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
