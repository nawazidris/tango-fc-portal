import React from "react";
import { TechnicalMember } from "../types";
import { Users, Calendar, Sparkles } from "lucide-react";

interface TechnicalTeamProps {
  technicalTeam: TechnicalMember[];
}

export default function TechnicalTeamView({ technicalTeam }: TechnicalTeamProps) {
  // Sort members into columns based on requested indices
  //ceo: index 0
  //directors/coordinators: 1, 2
  //captains / leaders: 3
  //assistant coaches: 4, 5
  //logistics / scouts: 6, 7

  const ceo = technicalTeam.filter(m => m.role.toLowerCase() === "ceo");
  const directors = technicalTeam.filter(m => m.role.toLowerCase() === "director" || m.role.toLowerCase() === "team manager");
  const leaders = technicalTeam.filter(m => m.role.toLowerCase() === "captain");
  const coaches = technicalTeam.filter(m => m.role.toLowerCase() === "coach" || m.role.toLowerCase() === "assistant coach");
  const operations = technicalTeam.filter(m => m.role.toLowerCase() === "logistics manager" || m.role.toLowerCase() === "head of recruitment");

  return (
    <div className="space-y-8 px-4 md:px-0 max-w-6xl mx-auto py-8">
      
      {/* Header and descriptions */}
      <div className="border-b border-white/5 pb-5">
        <h2 className="text-white text-2xl font-black tracking-tight flex items-center gap-1.5">
          <Users className="w-5 h-5 text-blue-500" />
          Technical staff &amp; Administration
        </h2>
        <p className="text-gray-400 text-xs">Meet the leadership behind the scenes guiding Tango FC to local and championship glory</p>
      </div>

      {/* Hierarchical Board */}
      <div className="space-y-12">
        
        {/* Tier 1: CEO Exclusive Highlight card */}
        <div className="flex justify-center">
          {ceo.map(member => (
            <div key={member.id} className="relative w-full max-w-md bg-gradient-to-r from-amber-500/10 via-amber-900/5 to-[#0b1929] border border-amber-500/30 rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300">
              <span className="absolute top-4 right-4 bg-amber-500 text-[#07111f] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-3 h-3 fill-[#07111f]" />
                Director General
              </span>
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full border-2 border-amber-500 overflow-hidden shadow-lg shadow-amber-500/10">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-lg">{member.name}</h3>
                  <span className="text-amber-500 text-xxs font-extrabold tracking-widest uppercase mt-1 inline-block">{member.role}</span>
                  <p className="text-gray-400 text-xs font-semibold mt-1">{member.title}</p>
                </div>
                <p className="text-gray-400 text-xs italic leading-relaxed pt-3 border-t border-white/5 w-full">
                  "{member.description}"
                </p>
                <span className="text-gray-500 text-xxs flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  {member.experience} Active Experience
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tier 2: Football Directors and Team Managers */}
        <div className="space-y-3">
          <h4 className="text-white text-[10px] sm:text-xxs font-extrabold uppercase tracking-widest text-center text-gray-500 mb-4 animate-fadeIn">Football Board Operations</h4>
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-3 sm:gap-6 max-w-4xl mx-auto">
            {directors.map(member => (
              <div key={member.id} className="bg-[#0b1929] border border-white/10 hover:border-blue-500/20 rounded-xl p-3 sm:p-5 text-center shadow-md hover:translate-y-[-2px] transition-all duration-200">
                <div className="flex flex-col items-center gap-2 sm:gap-3.5">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-white/10 overflow-hidden">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-[11px] sm:text-sm leading-tight">{member.name}</h3>
                    <span className="text-blue-500 text-[9px] sm:text-xxs font-bold tracking-wider uppercase mt-0.5 inline-block">{member.role}</span>
                    <p className="text-gray-400 text-[8px] sm:text-xxs mt-0.5 leading-none">{member.title}</p>
                  </div>
                  <p className="text-gray-400 text-[9px] sm:text-xxs italic leading-relaxed pt-2 border-t border-white/5 w-full line-clamp-3">
                    "{member.description}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3: Core Coaching and Tactician structures */}
        <div className="space-y-3">
          <h4 className="text-white text-[10px] sm:text-xxs font-extrabold uppercase tracking-widest text-center text-gray-500 mb-4">Field coaching Staff</h4>
          
          {/* Captain leading from front */}
          <div className="flex justify-center mb-4">
            {leaders.map(member => (
              <div key={member.id} className="w-full max-w-xs sm:max-w-sm bg-[#0b1929] border border-blue-500/30 rounded-xl p-3.5 sm:p-5 text-center shadow-lg relative">
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                  Leader
                </span>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-blue-500 overflow-hidden shadow-md shadow-blue-500/10">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-xs sm:text-sm text-blue-400 leading-tight">{member.name}</h3>
                    <span className="text-gray-300 text-[9px] sm:text-xxs font-bold tracking-wider uppercase inline-block mt-0.5">{member.role}</span>
                    <p className="text-gray-400 text-[8px] sm:text-xxs mt-0.5 leading-none">{member.title}</p>
                  </div>
                  <p className="text-gray-400 text-[9px] sm:text-xxs italic leading-relaxed pt-2 border-t border-white/5 w-full">
                    "{member.description}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Assistant Coaches Row as side-by-side grid */}
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-3 sm:gap-6 max-w-4xl mx-auto">
            {coaches.map(member => (
              <div key={member.id} className="bg-[#0b1929] border border-white/10 hover:border-white/20 rounded-xl p-3 sm:p-5 text-center shadow-md hover:translate-y-[-2px] transition-all duration-200">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="w-12 h-12 sm:w-18 sm:h-18 rounded-full border border-white/10 overflow-hidden">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[11px] sm:text-xs leading-tight">{member.name}</h3>
                    <span className="text-emerald-400 text-[9px] sm:text-xxs font-bold tracking-wider uppercase mt-0.5 inline-block">{member.role}</span>
                    <p className="text-gray-400 text-[8px] sm:text-xxs mt-0.5 leading-none">{member.title}</p>
                  </div>
                  <p className="text-gray-400 text-[9px] sm:text-xxs italic leading-relaxed pt-2 border-t border-white/5 w-full line-clamp-3">
                    "{member.description}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 4: Operations, Logistics and Scouts */}
        <div className="space-y-3">
          <h4 className="text-white text-[10px] sm:text-xxs font-extrabold uppercase tracking-widest text-center text-gray-500 mb-4 animate-fadeIn">Operations &amp; Scouting</h4>
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-3 sm:gap-6 max-w-4xl mx-auto">
            {operations.map(member => (
              <div key={member.id} className="bg-[#0b1929] border border-white/10 hover:border-white/20 rounded-xl p-3 sm:p-5 text-center shadow-md hover:translate-y-[-2px] transition-all duration-200">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="w-12 h-12 sm:w-18 sm:h-18 rounded-full border border-white/10 overflow-hidden">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[11px] sm:text-xs leading-tight">{member.name}</h3>
                    <span className="text-amber-500 text-[9px] sm:text-xxs font-bold tracking-wider uppercase mt-0.5 inline-block">{member.role}</span>
                    <p className="text-gray-400 text-[8px] sm:text-xxs mt-0.5 leading-none">{member.title}</p>
                  </div>
                  <p className="text-gray-400 text-[9px] sm:text-xxs italic leading-relaxed pt-2 border-t border-white/5 w-full line-clamp-3">
                    "{member.description}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
