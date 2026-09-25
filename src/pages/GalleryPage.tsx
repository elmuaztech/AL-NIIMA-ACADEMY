import React, { useState } from 'react';
import { GalleryItem, VideoItem } from '../types/school';
import {
  Image as ImageIcon,
  Video,
  X,
  Play,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface GalleryPageProps {
  galleryItems: GalleryItem[];
  videos: VideoItem[];
  onNavigate: (page: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  galleryItems,
  videos,
  onNavigate,
}) => {
  const [activeMedia, setActiveMedia] = useState<'all' | 'photos' | 'videos'>(() => {
    if (galleryItems.length === 0 && videos.length > 0) return 'videos';
    return 'all';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const categories = [
    'All',
    'School Life',
    'Academics',
    'Sports',
    'Events',
    'Boarding',
    'Facilities',
    'Activities',
  ];

  const filteredPhotos =
    selectedCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-14 py-8">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#093c20] text-white rounded-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden border-b-4 border-yellow-400 shadow-md">
          <div className="relative max-w-4xl space-y-3">
            <span className="text-xs uppercase font-poppins font-bold tracking-widest text-yellow-400 bg-[#062c17] px-3 py-1 rounded-full border border-yellow-400/30 inline-block">
              Visual Records
            </span>
            <h1 className="font-poppins font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
              School Gallery & Media Archive
            </h1>
            <p className="font-poppins text-stone-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Official photographic and video records from Al-Niima Academy, Dutse. All media displayed here are managed and published by the school administration.
            </p>
          </div>
        </div>
      </section>

      {/* Media Type Switcher & Category Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveMedia('all')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeMedia === 'all'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Media ({galleryItems.length + videos.length})</span>
            </button>

            <button
              onClick={() => setActiveMedia('videos')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeMedia === 'videos'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Video className="w-4 h-4 text-yellow-500" />
              <span>School Videos ({videos.length})</span>
            </button>

            <button
              onClick={() => setActiveMedia('photos')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeMedia === 'photos'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Photographs ({galleryItems.length})</span>
            </button>
          </div>

          {(activeMedia === 'photos' || activeMedia === 'all') && galleryItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-900 text-white font-semibold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* VIDEOS IN 'ALL' OR 'VIDEOS' */}
        {(activeMedia === 'all' || activeMedia === 'videos') && videos.length > 0 && (
          <div className="space-y-4">
            {activeMedia === 'all' && (
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-950 uppercase tracking-wide">
                <Video className="w-4 h-4 text-yellow-600" />
                <span>School Video Recordings ({videos.length})</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((vid) => {
                const isUploaded =
                  vid.url.startsWith('/uploads/') || vid.url.match(/\.(mp4|webm|mov|mkv)$/i);

                return (
                  <div
                    key={vid.id}
                    className="bg-white border border-stone-200 hover:border-emerald-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                      {isUploaded ? (
                        <video
                          src={vid.url}
                          poster={vid.thumbnail}
                          controls
                          playsInline
                          className="w-full h-full object-contain bg-black"
                        />
                      ) : vid.thumbnail ? (
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Play className="w-10 h-10 text-amber-400 mx-auto mb-1" />
                          <span className="text-[11px] text-stone-300">Official Video</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-2 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-yellow-800 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 uppercase">
                          Official Video
                        </span>
                        {vid.fileSize && (
                          <span className="text-[11px] text-stone-400">
                            {(vid.fileSize / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-base text-emerald-950">
                        {vid.title}
                      </h4>
                      {vid.description && (
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {vid.description}
                        </p>
                      )}
                    </div>

                    <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span>Al-Niima Academy, Dutse</span>
                      <button
                        onClick={() => setSelectedVideo(vid)}
                        className="text-emerald-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-emerald-800" />
                        <span>Theater Mode</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIDEOS EMPTY STATE WHEN IN 'VIDEOS' ONLY */}
        {activeMedia === 'videos' && videos.length === 0 && (
          <div className="bg-white border-2 border-dashed border-stone-300 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              No school videos published yet.
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Official school video recordings, assembly presentations, and academic tours will appear here once published by the administration.
            </p>
          </div>
        )}

        {/* PHOTOS IN 'ALL' OR 'PHOTOS' */}
        {(activeMedia === 'all' || activeMedia === 'photos') && (
          <div className="space-y-4">
            {activeMedia === 'all' && galleryItems.length > 0 && (
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-950 uppercase tracking-wide pt-4">
                <ImageIcon className="w-4 h-4 text-yellow-600" />
                <span>School Photographs ({filteredPhotos.length})</span>
              </div>
            )}

            {filteredPhotos.length === 0 ? (
              activeMedia === 'photos' && (
                <div className="bg-white border-2 border-dashed border-stone-300 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4 my-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-stone-900">
                    School gallery coming soon.
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Real photographs of Al-Niima Academy, classrooms, sports fields, boarding hostels, and school activities will appear here once uploaded by the administration.
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded border border-amber-200">
                      <Info className="w-3.5 h-3.5" />
                      <span>No unverified or stock photography is displayed.</span>
                    </span>
                  </div>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPhotos.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedImage(item)}
                    className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold text-white bg-emerald-950/80 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-1">
                      <h4 className="font-serif font-bold text-sm text-emerald-950 group-hover:text-emerald-800 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-stone-600 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="px-4 pb-3 pt-1 border-t border-stone-100 text-[10px] text-stone-400 flex items-center justify-between">
                      <span>Al-Niima Academy</span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString('en-GB', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EMPTY CHECK WHEN IN 'ALL' AND BOTH ARE 0 */}
        {activeMedia === 'all' && videos.length === 0 && galleryItems.length === 0 && (
          <div className="bg-white border-2 border-dashed border-stone-300 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Media Archive Coming Soon
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Photographs and official video recordings from the school will appear here once published from the administration dashboard.
            </p>
          </div>
        )}
      </section>

      {/* Theater Mode Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-950 rounded-2xl overflow-hidden shadow-2xl border border-yellow-400/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-[#093c20] text-white">
              <span className="font-bold text-sm sm:text-base truncate max-w-md">
                {selectedVideo.title}
              </span>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 rounded-full hover:bg-emerald-900 text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={selectedVideo.url}
                poster={selectedVideo.thumbnail}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-stone-900 text-white space-y-1">
              <h4 className="font-bold text-yellow-400 text-sm sm:text-base">
                {selectedVideo.title}
              </h4>
              {selectedVideo.description && (
                <p className="text-xs text-stone-300">{selectedVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[75vh] bg-stone-950 flex items-center justify-center">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="max-h-[75vh] w-auto object-contain mx-auto"
              />
            </div>

            <div className="p-6 space-y-2 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                  {selectedImage.category}
                </span>
                <span className="text-xs text-stone-400">
                  {new Date(selectedImage.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl text-emerald-950">
                {selectedImage.title}
              </h3>
              {selectedImage.description && (
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {selectedImage.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
