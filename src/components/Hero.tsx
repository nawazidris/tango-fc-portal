import React, { useState, useEffect } from "react";
import { Trophy, CalendarClock, Shield } from "lucide-react";

interface HeroProps {
  tangoRank: number;
  tangoPoints: number;
  onViewRoster: () => void;
  onViewMatches: () => void;
}

export default function Hero({ tangoRank, tangoPoints, onViewRoster, onViewMatches }: HeroProps) {
  // Target: Saturday, June 20, 2026 at 15:00 (Local Time)
  const targetTime = new Date("2026-06-20T15:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#03152d] via-[#051a37] to-[#010c1c] border-b border-white/10 px-6 py-12 md:py-16 md:px-12">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/10 blur-[90px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Brand Area */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-yellow-500/10 border border-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.08)] backdrop-blur-md mb-6 hover:border-amber-400/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] transition-all duration-300 group/badge cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 group-hover/badge:scale-110 transition-transform duration-300" />
            <span className="text-amber-400 text-[10.5px] font-black uppercase tracking-widest font-mono">
              MOSSL League Champions 2025/26
            </span>
            <span className="text-amber-500/60 font-mono text-[9px] border-l border-amber-500/20 pl-2 hidden sm:inline">
              ROAD TO NATIONALS
            </span>
          </div>

          <h2 className="text-white text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-5">
            Masvingo's <br />
            <span className="text-blue-500 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Finest Club</span>
          </h2>

          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mb-8">
            Tango Football Club — built on character, discipline, and community unity. Founded in 2015 at Rujeko Stadium — PaMuonde, we strike for local talent development and unmatched championship legacy.
          </p>

          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <button
              onClick={onViewRoster}
              className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-md shadow-blue-500/15 hover:translate-y-[-2px] active:scale-98"
            >
              Meet the Squad
            </button>
            <button
              onClick={onViewMatches}
              className="flex-1 sm:flex-initial bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 hover:translate-y-[-2px]"
            >
              View Fixtures
            </button>
          </div>
        </div>

        {/* Right Dashboard Quick Card */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Status widgets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center transition-all hover:bg-white/8">
              <span className="text-gray-400 text-xxs font-bold uppercase tracking-wider block mb-1">
                Tango FC Position
              </span>
              <strong className="text-white text-3xl font-black font-sans leading-none block">
                {tangoRank === 1 ? "1st" : tangoRank === 2 ? "2nd" : tangoRank === 3 ? "3rd" : `${tangoRank}th`}
              </strong>
              <span className="text-blue-400 text-xxs font-semibold mt-1.5 block">
                MOSSL 2026 Rankings
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center transition-all hover:bg-white/8">
              <span className="text-gray-400 text-xxs font-bold uppercase tracking-wider block mb-1">
                Total Score Ratio
              </span>
              <strong className="text-white text-3xl font-black font-sans leading-none block text-shadow-sm shadow-blue-500/20">
                {tangoPoints}
              </strong>
              <span className="text-emerald-400 text-xxs font-semibold mt-1.5 block">
                Active League Points
              </span>
            </div>
          </div>

          {/* countdown live-timer */}
          <div className="bg-[#0b1929]/75 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-2 self-start mb-3 text-amber-500 font-semibold text-xs tracking-wider uppercase">
                <CalendarClock className="w-4 h-4 text-amber-500" />
                Live Match Countdown
              </div>
              <p className="text-left w-full text-white text-sm font-bold leading-tight mb-4">
                vs ZINWA Runde <span className="text-gray-400 text-xs font-medium">— Saturday 15:00</span>
              </p>

              <div className="flex justify-between w-full max-w-sm gap-2">
                {[
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hrs" },
                  { value: timeLeft.minutes, label: "Mins" },
                  { value: timeLeft.seconds, label: "Secs" },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 bg-[#07111f] border border-white/5 rounded-xl p-3.5 text-center min-w-[64px]">
                    <span className="text-white text-2xl font-black font-mono block leading-none antialiased">
                      {String(item.value).padStart(2, "0")}
                    </span>
                    <span className="text-gray-400 text-xxs block mt-1 font-semibold uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
