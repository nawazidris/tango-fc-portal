import React, { useState } from "react";
import { Match, MatchEvent, Player } from "../types";
import { Trophy, CalendarRange, MapPin, AlarmClock, Star, Award, ShieldAlert, CircleDot } from "lucide-react";

interface MatchesViewProps {
  matches: Match[];
  players: Player[];
  playerVotes?: Record<number, number>;
  onVote?: (playerId: number) => Promise<void>;
}

export default function MatchesView({ 
  matches, 
  players = [], 
  playerVotes = {}, 
  onVote 
}: MatchesViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedMatchCenter, setSelectedMatchCenter] = useState<Match | null>(null);
  const [votedMatchIds, setVotedMatchIds] = useState<Record<number, boolean>>({});
  const [selectedMVPPlayerId, setSelectedMVPPlayerId] = useState<string>("");
  const [isSubmitVoting, setIsSubmitVoting] = useState(false);

  const filters = ["All", "Upcoming", "Completed"];

  // Name lookup helper for player nicknames
  const getPlayerNameShort = (fullName: string) => {
    if (!fullName) return "";
    const matched = players.find(
      (p) =>
        p.name.toLowerCase().trim() === fullName.toLowerCase().trim() ||
        (p.nickname && p.nickname.toLowerCase().trim() === fullName.toLowerCase().trim())
    );
    return matched && matched.nickname ? matched.nickname : fullName;
  };

  // Sort chronologically ascending
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const filteredMatches = sortedMatches.filter((match) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Upcoming") return match.status === "upcoming";
    if (activeFilter === "Completed") return match.status === "completed";
    return true;
  });

  const getResultClass = (match: Match) => {
    if (match.status !== "completed") return "border-l-3 border-gray-500 bg-[#0b1929]/40";
    const hs = match.homeScore || 0;
    const as = match.awayScore || 0;
    const isTangoHome = match.homeTeam.includes("Tango");
    const isTangoAway = match.awayTeam.includes("Tango");

    if (hs === as) return "border-l-3 border-amber-500 bg-amber-500/[0.02]";
    if (isTangoHome) {
      return hs > as 
        ? "border-l-3 border-emerald-500 bg-emerald-500/[0.02]" 
        : "border-l-3 border-red-500 bg-red-500/[0.02]";
    } else if (isTangoAway) {
      return as > hs 
        ? "border-l-3 border-emerald-500 bg-emerald-500/[0.02]" 
        : "border-l-3 border-red-500 bg-red-500/[0.02]";
    }
    return hs > as 
      ? "border-l-3 border-emerald-500 bg-emerald-500/[0.02]" 
      : "border-l-3 border-red-500 bg-red-500/[0.02]";
  };

  const getResultOverlay = (match: Match) => {
    if (match.status !== "completed") return { r: "Upcoming", cls: "bg-blue-600/10 text-blue-400 border-blue-500/20" };
    const hs = match.homeScore || 0;
    const as = match.awayScore || 0;
    const isTangoHome = match.homeTeam.includes("Tango");
    const isTangoAway = match.awayTeam.includes("Tango");

    if (hs === as) return { r: "Draw", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    if (isTangoHome) {
      return hs > as 
        ? { r: "Win", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" } 
        : { r: "Loss", cls: "bg-red-500/10 text-red-400 border-red-500/25" };
    } else if (isTangoAway) {
      return as > hs 
        ? { r: "Win", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" } 
        : { r: "Loss", cls: "bg-red-500/10 text-red-400 border-red-500/25" };
    }
    return hs > as 
      ? { r: "Win", cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" } 
      : { r: "Loss", cls: "bg-red-400/10 text-red-400 border-red-400/20" };
  };

  return (
    <div className="space-y-6 px-4 md:px-0 max-w-6xl mx-auto py-8">
      
      {/* Search Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-white text-2xl font-black tracking-tight flex items-center gap-1.5">
            <CalendarRange className="w-5 h-5 text-blue-500" />
            Fixtures &amp; Results
          </h2>
          <p className="text-gray-400 text-xs text-left">MOSSL 2026 Season Schedule, Scores, and Match Center updates</p>
        </div>

        {/* Filter navigation */}
        <div className="flex bg-[#0b1929] border border-white/10 rounded-xl p-1 self-start sm:self-auto gap-0.5">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all duration-150 whitespace-nowrap ${
                activeFilter === filter
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List layout of matches cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => {
            const isCompleted = match.status === "completed";
            const borderCls = getResultClass(match);
            const overlay = getResultOverlay(match);

            return (
              <div
                key={match.id}
                onClick={() => isCompleted && setSelectedMatchCenter(match)}
                className={`border border-white/5 rounded-2xl p-4.5 transition-all duration-200 shadow-md ${
                  isCompleted ? "cursor-pointer hover:border-blue-500/30 hover:scale-[1.005] hover:shadow-lg" : ""
                } ${borderCls}`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between text-xxs text-gray-400 mb-3 ml-0.5">
                  <span className="font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-blue-500" />
                    {match.competition || "League"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px] border ${overlay.cls}`}>
                    {overlay.r}
                  </span>
                </div>

                {/* Scoreline */}
                <div className="flex items-start justify-between text-center gap-4 py-2 border-y border-white/5 my-2">
                  
                  {/* Home Team Name & Goalscorers inline */}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className={`font-black text-xs md:text-sm uppercase tracking-tight truncate ${match.homeTeam.includes("Tango") ? "text-blue-400 font-extrabold" : "text-white"}`}>
                      {match.homeTeam}
                    </h3>
                    {isCompleted && match.events && (
                      <div className="mt-2 space-y-1">
                        {match.events.filter(e => e.type === "goal" && e.team === "home").map((e, idx) => {
                          const scorer = getPlayerNameShort(e.player);
                          const asst = e.assist ? getPlayerNameShort(e.assist) : null;
                          return (
                            <div key={idx} className="text-[10px] text-gray-400 flex items-center gap-1 flex-wrap">
                              <span className="text-emerald-500">⚽</span>
                              <span className="font-bold text-gray-300">{scorer}</span>
                              {e.minute && <span className="text-gray-500">({e.minute}')</span>}
                              {asst && (
                                <span className="text-amber-500/90 text-[9.5px] font-semibold flex items-center gap-0.5 ml-1 bg-amber-500/5 px-1 rounded">
                                  <span>👟</span>
                                  <span>{asst}</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mid Score Display */}
                  <div className="flex-shrink-0 min-w-[70px] pt-1">
                    {isCompleted ? (
                      <span className="bg-white/5 border border-white/5 rounded-xl px-2.5 py-1 font-mono font-black text-base text-white shadow-sm">
                        {match.homeScore} - {match.awayScore}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px] bg-white/5 border border-white/5 px-2 py-1 rounded-xl">
                        {match.time}
                      </span>
                    )}
                  </div>

                  {/* Away Team Name & Goalscorers inline */}
                  <div className="flex-1 text-right min-w-0">
                    <h3 className={`font-black text-xs md:text-sm uppercase tracking-tight truncate ${match.awayTeam.includes("Tango") ? "text-blue-400 font-extrabold" : "text-white"}`}>
                      {match.awayTeam}
                    </h3>
                    {isCompleted && match.events && (
                      <div className="mt-2 space-y-1 flex flex-col items-end">
                        {match.events.filter(e => e.type === "goal" && e.team === "away").map((e, idx) => {
                          const scorer = getPlayerNameShort(e.player);
                          const asst = e.assist ? getPlayerNameShort(e.assist) : null;
                          return (
                            <div key={idx} className="text-[10px] text-gray-400 flex items-center justify-end gap-1 flex-wrap text-right w-full">
                              <span className="text-emerald-500">⚽</span>
                              <span className="font-bold text-gray-300">{scorer}</span>
                              {e.minute && <span className="text-gray-500">({e.minute}')</span>}
                              {asst && (
                                <span className="text-amber-500/90 text-[9.5px] font-semibold flex items-center gap-0.5 ml-1 bg-amber-500/5 px-1 rounded">
                                  <span>👟</span>
                                  <span>{asst}</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

                {/* Player of the Match Spotlight card banner */}
                {isCompleted && match.playerOfTheMatch && (
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                    <span className="flex items-center gap-1 font-bold text-amber-500 uppercase tracking-wider text-[8px] md:text-[9px]">
                      <Star className="w-3.5 h-3.5 fill-amber-500/10 text-amber-500" />
                      Player of the Match
                    </span>
                    <span className="font-extrabold text-white bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded shadow-sm text-[9px] md:text-[10px]">
                      {getPlayerNameShort(match.playerOfTheMatch)}
                    </span>
                  </div>
                )}

                {/* Date & location footer */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 text-[10px] text-gray-400 font-medium ml-0.5">
                  <span className="flex items-center gap-1 font-semibold">
                    <AlarmClock className="w-3.5 h-3.5 text-blue-400" />
                    {new Date(match.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1 font-semibold truncate max-w-[170px]">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {match.venue}
                  </span>
                </div>

                {isCompleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMatchCenter(match);
                    }}
                    className="mt-3 w-full bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-500 py-1.5 rounded-xl text-xxs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5 animate-pulse" />
                    Vote for Match MVP
                  </button>
                )}

              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-gray-500 bg-[#0b1929] border border-white/5 rounded-2xl">
            <ShieldAlert className="w-10 h-10 text-gray-600 mx-auto mb-2.5" />
            <p className="text-xs">No matching fixtures found for your selection.</p>
          </div>
        )}
      </div>

      {/* Match Center Modal popup overlays */}
      {selectedMatchCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#0b1929] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Close trigger button */}
            <button
              onClick={() => setSelectedMatchCenter(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/35 w-8 h-8 rounded-full flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors z-10"
            >
              <XIcon className="w-4 h-4" />
            </button>

            {/* Score info headers */}
            <div className="bg-[#07111f] p-6 border-b border-white/5 text-center">
              <span className="inline-block text-xxs font-extrabold uppercase bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full tracking-wider mb-4">
                {selectedMatchCenter.competition || "League"} Tournament Log
              </span>

              <div className="flex items-center justify-between gap-4 max-w-sm mx-auto my-2">
                <div className="flex-1 text-right min-w-0">
                  <h3 className={`font-black text-base uppercase leading-tight truncate ${selectedMatchCenter.homeTeam.includes("Tango") ? "text-blue-400" : "text-white"}`}>
                    {selectedMatchCenter.homeTeam}
                  </h3>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-emerald-400 rounded-2xl text-2xl font-black font-mono shadow-[0_0_15px_rgba(16,185,129,0.15)] flex-shrink-0">
                  {selectedMatchCenter.homeScore} - {selectedMatchCenter.awayScore}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className={`font-black text-base uppercase leading-tight truncate ${selectedMatchCenter.awayTeam.includes("Tango") ? "text-blue-400" : "text-white"}`}>
                    {selectedMatchCenter.awayTeam}
                  </h3>
                </div>
              </div>

              <p className="text-gray-400 text-xxs mt-3 tracking-wide flex items-center justify-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                {selectedMatchCenter.venue}
                <span className="text-white/10 font-normal">|</span>
                {new Date(selectedMatchCenter.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>

            {/* Live Center match stats logger */}
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-white text-xxs font-extrabold uppercase tracking-widest border-b border-white/5 pb-2 mb-3.5 flex items-center gap-1.5 text-gray-400">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Match Highlights center
                </h4>

                <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                  {selectedMatchCenter.events && selectedMatchCenter.events.length > 0 ? (
                    selectedMatchCenter.events.map((ev, i) => {
                      const isHome = ev.team === "home";
                      const aligns = isHome ? "justify-start text-left" : "justify-end text-right";
                      
                      let badgeCls = "bg-[#07111f] text-gray-400 border-white/5";
                      let eventLabel = "Sub";
                      if (ev.type === "goal") {
                        badgeCls = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                        eventLabel = "Goal ⚽";
                      } else if (ev.type === "yellow_card") {
                        badgeCls = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                        eventLabel = "Yellow 🟨";
                      } else if (ev.type === "red_card") {
                        badgeCls = "bg-red-500/10 text-red-500 border-red-500/20";
                        eventLabel = "Red 🟥";
                      }

                      return (
                        <div key={i} className={`flex items-center gap-3 p-2 border border-white/5 rounded-xl bg-white/[0.01] ${aligns}`}>
                          {isHome && (
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] uppercase font-bold border ${badgeCls}`}>
                              {eventLabel}
                            </span>
                          )}
                          <div className="text-xs text-left">
                            <strong className="text-white font-bold">{getPlayerNameShort(ev.player)}</strong>
                            {ev.minute && <span className="text-gray-400 font-semibold font-mono"> ({ev.minute}')</span>}
                            {ev.assist && (
                              <p className="text-xxs text-blue-400 mt-0.5 font-semibold">Assist: {getPlayerNameShort(ev.assist)}</p>
                            )}
                          </div>
                          {!isHome && (
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] uppercase font-bold border ${badgeCls}`}>
                              {eventLabel}
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-gray-500 italic text-xs">No match highlights logged for this match.</div>
                  )}
                </div>
              </div>

              {/* Player of the Match Spotlight Section */}
              {(() => {
                const potmName = selectedMatchCenter.playerOfTheMatch;
                const potmPlayer = potmName ? players.find(p => p.name.toLowerCase().trim() === potmName.toLowerCase().trim() || p.nickname?.toLowerCase().trim() === potmName.toLowerCase().trim()) : null;

                if (potmName) {
                  return (
                    <div className="bg-gradient-to-r from-amber-600/10 via-[#0a1524] to-indigo-900/10 border border-amber-500/30 rounded-2xl p-4.5 flex items-center justify-between text-left gap-4 shadow-lg">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative flex-shrink-0">
                          {potmPlayer ? (
                            <img src={potmPlayer.playerImage} alt={potmPlayer.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-lg shadow-amber-500/10" />
                          ) : (
                            <div className="w-12 h-12 rounded-full border border-amber-500/30 bg-amber-500/5 flex items-center justify-center text-amber-500 font-black text-sm">
                              ★
                            </div>
                          )}
                          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[#07111f] font-black font-mono text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0b1929] shadow">
                            {potmPlayer && potmPlayer.number ? `#${potmPlayer.number}` : "★"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#d97706] bg-[#d97706]/10 px-1.5 py-0.5 rounded">
                            Official POTM
                          </span>
                          <h4 className="text-white text-xs sm:text-sm font-black mt-1 leading-tight truncate">
                            {potmPlayer ? potmPlayer.name : potmName}
                          </h4>
                          <p className="text-gray-400 text-[10px] mt-0.5 leading-none">
                            {potmPlayer ? `${potmPlayer.position} • Tango FC` : "Standout Match Performer"}
                          </p>
                        </div>
                      </div>
                      <div className="bg-amber-500/15 border border-amber-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold text-amber-400 flex-shrink-0 uppercase tracking-wider">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        MVP Performer
                      </div>
                    </div>
                  );
                }

                // Fallback guess logic
                const guessedPlayer = selectedMatchCenter.events.find(e => e.type === "goal")?.player || "Edrice Mujeyi";
                const guessedPotmPlayer = players.find(p => p.name.toLowerCase().trim() === guessedPlayer.toLowerCase().trim() || p.nickname?.toLowerCase().trim() === guessedPlayer.toLowerCase().trim());

                return (
                  <div className="bg-gradient-to-r from-blue-900/15 via-[#07111f] to-indigo-900/15 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between text-left gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        {guessedPotmPlayer ? (
                          <img src={guessedPotmPlayer.playerImage} alt={guessedPotmPlayer.name} className="w-12 h-12 rounded-full object-cover border border-blue-500/30" />
                        ) : (
                          <div className="w-12 h-12 rounded-full border border-blue-500/30 bg-blue-500/5 flex items-center justify-center text-blue-500 font-bold text-xs">
                            MOTM
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white text-xs font-black flex items-center gap-1 leading-none mb-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400/10" />
                          Player of the Match (Estimated)
                        </h4>
                        <span className="text-gray-300 text-xxs font-extrabold max-w-sm block mt-1">
                          {guessedPotmPlayer ? guessedPotmPlayer.name : guessedPlayer}
                        </span>
                        <p className="text-gray-500 text-[8px] sm:text-[9px] leading-relaxed mt-0.5 max-w-sm">
                          {selectedMatchCenter.events.some(e => e.type === "goal") 
                            ? "Estimated by default goalscorers statistical indicator."
                            : "Estimated by statistical field play logs."
                          }
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-600/15 border border-blue-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold text-blue-400 flex-shrink-0 uppercase tracking-wider">
                      <CircleDot className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      Estimated
                    </div>
                  </div>
                );
              })()}

              {/* Interactive Fan MVP Balloting */}
              <div className="bg-[#07111f] border border-white/5 rounded-2xl p-4.5 space-y-3.5 mt-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <h4 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="text-amber-400 w-4 h-4 animate-bounce" />
                    Fan MVP Ballot
                  </h4>
                  <span className="text-gray-400 text-[10px] font-mono">
                    MASVINGO FAN REWARD
                  </span>
                </div>

                {votedMatchIds[selectedMatchCenter.id] ? (
                  <div className="text-center py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-[#07111f] font-black text-sm">
                      ✓
                    </div>
                    <h5 className="text-white text-xs font-black">MVP Vote Standardized &amp; Recorded!</h5>
                    <p className="text-gray-400 text-[10px] px-6 leading-relaxed">
                      Your vote has been added to the cumulative Player of the Month standings. Thank you for supporting grassroots football!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300 text-xxs leading-relaxed">
                      Cast your official fan vote for this match's outstanding performer. Votes help determine the Tango FC Player of the Month award!
                    </p>

                    {/* Quick Suggestions based on Match Events & POTM */}
                    {(() => {
                      // Let's gather suggestions (up to 3 unique players)
                      const suggestions: Player[] = [];
                      
                      // 1. First add the POTM if they exist and are a Tango player
                      const potmName = selectedMatchCenter.playerOfTheMatch;
                      if (potmName) {
                        const matchPotm = players.find(p => p.name.toLowerCase().trim() === potmName.toLowerCase().trim() || p.nickname?.toLowerCase().trim() === potmName.toLowerCase().trim());
                        if (matchPotm) suggestions.push(matchPotm);
                      }

                      // 2. Add goalscorers/assist players for Tango FC (Tango could be Home or Away)
                      const isTangoHome = selectedMatchCenter.homeTeam.toLowerCase().includes("tango");
                      const tangoTeamSide = isTangoHome ? "home" : "away";
                      
                      if (selectedMatchCenter.events) {
                        selectedMatchCenter.events.forEach(ev => {
                          if (ev.type === "goal" && ev.team === tangoTeamSide) {
                            const pMatch = players.find(p => p.name.toLowerCase().trim() === ev.player.toLowerCase().trim() || p.nickname?.toLowerCase().trim() === ev.player.toLowerCase().trim());
                            if (pMatch && !suggestions.some(s => s.id === pMatch.id)) {
                              suggestions.push(pMatch);
                            }
                          }
                        });
                      }

                      // 3. Keep filling until we have 3, using other players
                      if (suggestions.length < 3) {
                        const otherPlayers = players.filter(p => !suggestions.some(s => s.id === p.id));
                        const sortedOthers = [...otherPlayers].sort((a, b) => b.goals - a.goals);
                        for (let x = 0; suggestions.length < 3 && x < sortedOthers.length; x++) {
                          suggestions.push(sortedOthers[x]);
                        }
                      }

                      return (
                        <div className="space-y-3">
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block">
                            Top Match Candidates:
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {suggestions.map((cand) => {
                              const currVotes = playerVotes[cand.id] || 0;
                              return (
                                <button
                                  key={cand.id}
                                  type="button"
                                  onClick={async () => {
                                    if (!onVote) return;
                                    setIsSubmitVoting(true);
                                    await onVote(cand.id);
                                    setVotedMatchIds(prev => ({ ...prev, [selectedMatchCenter.id]: true }));
                                    setIsSubmitVoting(false);
                                  }}
                                  disabled={isSubmitVoting}
                                  className="bg-[#0b1929] hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 rounded-xl p-2.5 text-center transition-all duration-150 flex flex-col items-center justify-between gap-1 group border-white/5"
                                >
                                  <div className="relative">
                                    <img 
                                      src={cand.playerImage} 
                                      alt={cand.name} 
                                      className="w-9 h-9 rounded-full object-cover border border-white/10" 
                                      onError={(e) => {
                                        e.currentTarget.src = "https://placehold.co/100x100?text=Pic";
                                      }}
                                    />
                                    <span className="absolute -bottom-1 -right-1 bg-blue-500/90 text-white font-mono text-[8px] px-1 rounded-full scale-75">
                                      #{cand.number}
                                    </span>
                                  </div>
                                  <div className="min-w-0 w-full mt-1.5 text-center">
                                    <p className="text-white text-[10px] font-extrabold truncate group-hover:text-blue-400">
                                      {cand.nickname || cand.name.split(" ")[0]}
                                    </p>
                                    <span className="text-gray-500 text-[8px] uppercase tracking-wider block">
                                      {cand.position}
                                    </span>
                                  </div>
                                  <span className="mt-2 text-[9px] bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-400 group-hover:bg-blue-600 group-hover:text-white font-bold transition-all text-center w-full">
                                    ★ {currVotes} votes
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Alternative Squad Dropdown for other players */}
                          <div className="flex flex-col gap-1.5 pt-1.5">
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block">
                              Or write-in another squad member:
                            </span>
                            <div className="flex gap-2">
                              <select
                                value={selectedMVPPlayerId}
                                onChange={(e) => setSelectedMVPPlayerId(e.target.value)}
                                className="flex-1 bg-[#0b1929] border border-white/5 p-2 rounded-xl text-white text-[11px] outline-none cursor-pointer focus:border-blue-500/50"
                              >
                                <option value="">-- Choose Roster Player --</option>
                                {players
                                  .filter(p => !suggestions.some(s => s.id === p.id))
                                  .map(p => (
                                    <option key={p.id} value={p.id}>
                                      #{p.number} - {p.name} ({p.nickname ? `"${p.nickname}"` : p.position})
                                    </option>
                                  ))}
                              </select>
                              <button
                                type="button"
                                disabled={!selectedMVPPlayerId || isSubmitVoting || !onVote}
                                onClick={async () => {
                                  if (!selectedMVPPlayerId || !onVote) return;
                                  setIsSubmitVoting(true);
                                  await onVote(Number(selectedMVPPlayerId));
                                  setVotedMatchIds(prev => ({ ...prev, [selectedMatchCenter.id]: true }));
                                  setSelectedMVPPlayerId("");
                                  setIsSubmitVoting(false);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 disabled:text-gray-600 disabled:border-transparent text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors border border-emerald-500/10"
                              >
                                {isSubmitVoting ? "Casting..." : "Vote"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
