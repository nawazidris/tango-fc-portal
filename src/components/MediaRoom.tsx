import React, { useState, useRef } from "react";
import { GalleryItem, VideoItem } from "../types";
import { Image, Video, X, ChevronLeft, ChevronRight, Play, Eye } from "lucide-react";

interface MediaRoomProps {
  gallery: GalleryItem[];
  videos: VideoItem[];
}

export default function MediaRoom({ gallery, videos }: MediaRoomProps) {
  const [activeTab, setActiveTab] = useState<"pictures" | "videos">("pictures");
  const [activeMediaFilter, setActiveMediaFilter] = useState<string>("all");
  const [photoLightboxIndex, setPhotoLightboxIndex] = useState<number | null>(null);
  const [videoLightboxUrl, setVideoLightboxUrl] = useState<string | null>(null);

  // Gallery categories filters selection
  const filters = [
    { id: "all", label: "All Media" },
    { id: "newseason", label: "2026 Season" },
    { id: "matchday", label: "Matchday Grid" },
    { id: "champions", label: "Celebrations Log" },
  ];

  const filteredPhotos = gallery.filter(
    (item) => activeMediaFilter === "all" || item.category === activeMediaFilter
  );

  const filteredVideos = videos.filter(
    (video) => activeMediaFilter === "all" || video.category === activeMediaFilter
  );

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoLightboxIndex === null) return;
    const newIdx = photoLightboxIndex === 0 ? filteredPhotos.length - 1 : photoLightboxIndex - 1;
    setPhotoLightboxIndex(newIdx);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoLightboxIndex === null) return;
    const newIdx = photoLightboxIndex === filteredPhotos.length - 1 ? 0 : photoLightboxIndex + 1;
    setPhotoLightboxIndex(newIdx);
  };

  // Video hover preview triggers
  const handleMouseEnterVideo = (e: React.MouseEvent<HTMLVideoElement>) => {
    const videoNode = e.currentTarget;
    videoNode.play().catch(() => {});
  };

  const handleMouseLeaveVideo = (e: React.MouseEvent<HTMLVideoElement>) => {
    const videoNode = e.currentTarget;
    videoNode.pause();
    videoNode.currentTime = 0;
  };

  return (
    <div className="space-y-6 px-4 md:px-0 max-w-6xl mx-auto py-8">
      
      {/* Header and descriptions */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-white text-2xl font-black tracking-tight flex items-center gap-1.5">
          <Image className="w-5 h-5 text-blue-500" />
          Media &amp; Video Room
        </h2>
        <p className="text-gray-400 text-xs mt-1">Capturing intense matchday action, trophy celebrations, and behind-the-scenes footage</p>
      </div>

      {/* Selector hub - placing the filters contextually under each tab section */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Sub tabs picker: Pictures / Videos */}
        <div className="flex bg-[#0b1929]/50 border border-white/10 p-1 rounded-xl w-60 flex-shrink-0">
          <button
            onClick={() => setActiveTab("pictures")}
            className={`flex-1 py-1.5 rounded-lg text-xxs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 ${
              activeTab === "pictures"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            Pictures
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 ${
              activeTab === "videos"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Videos
          </button>
        </div>

        {/* Filter Navigation Category */}
        <div className="flex bg-[#0b1929] border border-white/10 rounded-xl p-1 gap-0.5 max-w-full overflow-x-auto scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveMediaFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-150 whitespace-nowrap ${
                activeMediaFilter === f.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Video Highlights Room */}
      {activeTab === "videos" && (
        <div className="space-y-4">
          <h4 className="text-white text-xxs font-extrabold uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1.5 text-gray-400">
            <Video className="w-3.5 h-3.5 text-blue-500" />
            Video highlights room
          </h4>

          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setVideoLightboxUrl(video.url)}
                  className="group bg-[#0b1929] border border-white/10 hover:border-blue-500/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 relative animate-fadeIn"
                >
                  <div className="relative aspect-video bg-[#07111f] overflow-hidden flex items-center justify-center">
                    {/* Video Hover triggers */}
                    <video
                      src={video.url}
                      preload="metadata"
                      muted
                      loop
                      playsInline
                      onMouseEnter={handleMouseEnterVideo}
                      onMouseLeave={handleMouseLeaveVideo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center pointer-events-none group-hover:bg-black/10 transition-colors z-10">
                      <div className="w-11 h-11 rounded-full bg-white/95 text-[#07111f] flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
                        <Play className="w-4 h-4 fill-[#07111f] translate-x-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-3 left-3 bg-[#07111f]/65 border border-white/10 p-1 px-3.5 rounded-full text-blue-400 text-[9px] font-bold uppercase tracking-wider z-20">
                      Clip Highlights
                    </span>
                  </div>
                  <div className="p-4 bg-white/[0.01]">
                    <h4 className="text-white font-black text-xs group-hover:text-blue-400 transition-colors leading-relaxed line-clamp-1">{video.title}</h4>
                    <p className="text-gray-500 text-[10px] mt-1 font-semibold uppercase font-sans">Hover to quick-preview Log</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500 text-xs bg-[#0b1929] border border-white/5 rounded-2xl">
              No video highlights match this filter category.
            </div>
          )}
        </div>
      )}

      {/* 2. Photo gallery */}
      {activeTab === "pictures" && (
        <div className="space-y-4">
          <h4 className="text-white text-xxs font-extrabold uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1.5 text-gray-400">
            <Image className="w-3.5 h-3.5 text-blue-500" />
            Photo Gallery Grid
          </h4>

          {filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => setPhotoLightboxIndex(index)}
                  className="group bg-[#0b1929] border border-white/10 hover:border-blue-500/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 relative aspect-square animate-fadeIn"
                >
                  <div className="absolute inset-0 bg-[#07111f] overflow-hidden flex items-center justify-center">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-104"
                    />
                  </div>

                  {/* Hover captions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 z-10">
                    <span className="text-blue-400 text-xxs font-bold uppercase tracking-wide mb-1 leading-none">{photo.category}</span>
                    <p className="text-white font-extrabold text-[11px] leading-snug line-clamp-2">{photo.title}</p>
                    <span className="text-xxs text-gray-400 mt-2.5 flex items-center gap-1 leading-none">
                      <Eye className="w-3.5 h-3.5" /> View Photo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500 text-xs bg-[#0b1929] border border-white/5 rounded-2xl">
              No gallery pictures match this filter category.
            </div>
          )}
        </div>
      )}

      {/* Photo Lightbox swiper view */}
      {photoLightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setPhotoLightboxIndex(null)}
        >
          <button
            onClick={() => setPhotoLightboxIndex(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={handlePrevPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/5 w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all font-bold z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            className="relative max-w-3xl max-h-[80vh] flex flex-col items-center gap-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredPhotos[photoLightboxIndex].url}
              alt={filteredPhotos[photoLightboxIndex].title}
              className="max-w-full max-h-[70vh] rounded-xl object-contain border border-white/10"
            />
            <div className="text-center max-w-md px-4 mt-2">
              <span className="bg-blue-600/15 border border-blue-500/20 text-blue-400 rounded-full text-xxs font-bold uppercase px-3 py-0.5 tracking-wider">
                {filteredPhotos[photoLightboxIndex].category}
              </span>
              <h4 className="text-white font-bold text-sm leading-snug mt-2">{filteredPhotos[photoLightboxIndex].title}</h4>
            </div>
          </div>

          <button
            onClick={handleNextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/5 w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all font-bold z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Video Lightbox Player frame */}
      {videoLightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setVideoLightboxUrl(null)}
        >
          <button
            onClick={() => setVideoLightboxUrl(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="relative w-full max-w-3xl bg-[#07111f] rounded-2xl overflow-hidden border border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={videoLightboxUrl}
              controls
              autoPlay
              className="w-full aspect-video outline-none shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}
