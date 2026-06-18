import React from "react";
import { ClubHistory } from "../types";
import { Shield, Trophy, Bookmark, Sparkles, MapPin } from "lucide-react";

interface ClubHistoryProps {
  history: ClubHistory;
}

export default function ClubHistoryView({ history }: ClubHistoryProps) {
  if (!history || !history.philosophy) {
    return <div className="py-12 text-center text-gray-500 italic">No history data available.</div>;
  }

  return (
    <div className="space-y-10 px-4 md:px-0 max-w-6xl mx-auto py-8">
      
      {/* Header sections */}
      <div className="border-b border-white/5 pb-5">
        <h2 className="text-white text-2xl font-black tracking-tight flex items-center gap-1.5">
          <Shield className="w-5 h-5 text-blue-500" />
          Club Heritage &amp; Archives
        </h2>
        <p className="text-gray-400 text-xs">Our founding achievements, core philosophy, and legendary timelines</p>
      </div>

      {/* Official Team Photo Banner */}
      <div className="relative w-full h-[220px] md:h-[320px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0b1929] transition-all">
        <img 
          src="/images/tango1111.jpg" 
          alt="Tango FC Official Team Photo" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide the wrapper if user has not yet dropped tango1111.jpg in the images folder
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.style.display = 'none';
            }
          }}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07111f]/90 via-[#07111f]/40 to-transparent p-5 md:p-6 flex flex-col justify-end text-left h-full">
          <div>
            <span className="text-amber-500 text-[9px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded w-fit mb-2 inline-block">
              Historical Squad Showcase
            </span>
            <h3 className="text-white text-base md:text-xl font-black tracking-tight">
              Tango FC Official Champions Photo
            </h3>
            <p className="text-gray-300 text-xxs sm:text-xs mt-1 max-w-2xl leading-relaxed">
              Capturing the unity of Rujeko Stadium — PaMuonde, and the foundational local champions driving development across Masvingo.
            </p>
          </div>
        </div>
      </div>

      {/* Main double column layouts (Details + Pillars) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Card: General Club Details (col-span-5) */}
        <div className="lg:col-span-5 bg-[#0b1929] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col items-center text-center pb-4 border-b border-white/5">
            <div className="w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-3xl font-black mb-3">
              TFC
            </div>
            <h3 className="text-white font-extrabold text-base tracking-tight">{history.club || "Tango Football Club"}</h3>
            <p className="text-blue-400 text-xxs font-bold uppercase tracking-wider mt-1">Est. {history.foundedYear}</p>
          </div>

          <div className="space-y-3.5 text-xs">
            <p className="text-gray-400 leading-relaxed text-justify">
              {history.description}
            </p>

            <div className="pt-3 border-t border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold uppercase tracking-wide">Stadium Ground</span>
                <strong className="text-white font-bold flex items-center gap-1 shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  {history.stadium}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold uppercase tracking-wide">Ground Capacity</span>
                <strong className="text-white font-extrabold">{history.capacity} Fans</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold uppercase tracking-wide">Founder Executive</span>
                <strong className="text-gray-300 font-semibold">{history.founder}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Philosophy Pillars (col-span-7) */}
        <div className="lg:col-span-7 bg-[#0b1929] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-white font-black text-sm uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              {history.philosophy.title}
            </h3>
            <p className="text-gray-400 text-xxs mt-0.5">{history.philosophy.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {history.philosophy.pillars.map((pil, i) => (
              <div key={i} className="bg-[#07111f] border border-white/5 rounded-xl p-4.5 text-center flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-[13px] mx-auto mb-3">
                    {i + 1}
                  </div>
                  <h4 className="text-white font-bold text-xs">{pil.name}</h4>
                  <p className="text-gray-400 text-xxs mt-2 leading-relaxed">{pil.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Trophies achievements */}
      <div className="space-y-4">
        <h4 className="text-white text-xxs font-extrabold uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1.5 text-gray-400">
          <Trophy className="w-4 h-4 text-amber-500 fill-amber-500/10" />
          Major Trophy Achievements
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {history.achievements.map((ach, idx) => (
            <div key={idx} className="bg-[#0b1929] border border-white/10 hover:border-amber-500/20 rounded-2xl p-5 shadow-md transition-all duration-200">
              <span className="bg-amber-500/10 border border-amber-500/25 p-1 px-3.5 rounded-full text-amber-500 text-[10px] font-mono font-bold uppercase tracking-wider block w-fit mb-3">
                {ach.year}
              </span>
              <h4 className="text-white font-extrabold text-sm">{ach.title}</h4>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">{ach.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones Vertical timeline */}
      <div className="space-y-4">
        <h4 className="text-white text-xxs font-extrabold uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1.5 text-gray-400">
          <Bookmark className="w-4 h-4 text-blue-500" />
          Key Club Milestones
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {history.milestones.map((mil, idx) => (
            <div key={idx} className="bg-[#0b1929] border border-white/5 hover:border-blue-500/20 rounded-xl p-4.5 shadow flex flex-col justify-between">
              <div>
                <span className="text-blue-400 font-mono font-black text-sm tracking-wide block pb-1.5 border-b border-white/5 mb-2.5">
                  {mil.year}
                </span>
                <p className="text-gray-400 text-xs leading-relaxed">{mil.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
