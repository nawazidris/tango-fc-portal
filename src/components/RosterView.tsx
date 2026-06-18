import React, { useState } from "react";
import { Player } from "../types";
import { Search, UserCheck, Star, Users, Award, ShieldAlert, X, Shield, Target, Activity, Zap } from "lucide-react";

interface RosterViewProps {
  players: Player[];
  playerVotes: Record<number, number>;
  onVote: (playerId: number) => void;
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
}

export default function RosterView({
  players,
  playerVotes,
  onVote,
  selectedPlayer,
  setSelectedPlayer
}: RosterViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [hasVoted, setHasVoted] = useState<Record<number, boolean>>({});

  const positions = ["All", "Forward", "Midfielder", "Defender", "Goalkeeper"];

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.nickname && player.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = activeFilter === "All" || player.position === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleLocalVote = (playerId: number) => {
    if (hasVoted[playerId]) return;
    onVote(playerId);
    setHasVoted({ ...hasVoted, [playerId]: true });
  };

  return (
    <div className="space-y-6 px-4 md:px-0 max-w-6xl mx-auto py-8">
      {/* Header and filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-white text-2xl font-black tracking-tight flex items-center gap-1.5">
            <Users className="w-5 h-5 text-blue-500" />
            First Team Squad
          </h2>
          <p className="text-gray-400 text-xs">Meet Tango FC first-team lineup for the 2026 MOSSL Season</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar inputs */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search squad..."
              className="bg-[#0b1929] border border-white/10 focus:border-blue-500/50 p-2.5 pl-10 rounded-xl text-white text-xs outline-none transition-all w-full sm:w-56"
            />
          </div>

          <div className="flex bg-[#0b1929]/80 border border-white/10 rounded-xl p-0.5 overflow-x-auto gap-0.5 max-w-full scrollbar-none">
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setActiveFilter(pos)}
                className={`px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-tight transition-all duration-150 whitespace-nowrap ${
                  activeFilter === pos
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {pos === "All" ? "All" : pos === "Goalkeeper" ? "Goalkeepers" : pos + "s"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Players cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => {
            const votesCount = playerVotes[player.id] || 0;
            return (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="group bg-[#0b1929] hover:bg-white/[0.03] border border-white/5 hover:border-blue-500/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:translate-y-[-3px] flex flex-col justify-between"
              >
                {/* Photo area */}
                <div className="relative aspect-square w-full bg-[#07111f] overflow-hidden flex items-center justify-center">
                  <img
                    src={player.playerImage}
                    alt={player.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-104"
                    onError={(e) => {
                      const targetInput = e.target as HTMLImageElement;
                      targetInput.style.display = "none";
                      targetInput.parentElement!.innerHTML = `
                        <div class="text-gray-600 text-4xl font-extrabold uppercase font-sans">
                          ${player.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                      `;
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white font-extrabold text-xxs font-mono flex items-center justify-center">
                    #{player.number ?? "—"}
                  </div>
                  {player.isNewSigning && (
                    <span className="absolute top-2.5 left-2.5 bg-amber-500 text-[#07111f] font-black text-xxs px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                      <Star className="w-3 h-3 fill-[#07111f]" />
                      New
                    </span>
                  )}
                </div>

                {/* Player details */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-white text-xs font-bold leading-tight truncate group-hover:text-blue-400 transition-colors">
                      {player.name}
                    </h3>
                    <p className="text-blue-400 text-xxs font-bold italic mt-0.5 truncate">
                      "{player.nickname || player.name.split(" ")[0]}"
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-xxs text-gray-400 font-mono">
                    <span className="bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-gray-400 uppercase font-black text-[8px] tracking-wider">
                      {player.position}
                    </span>
                    
                    <div className="flex items-center gap-2.5 text-[10px] font-bold">
                      {player.position === "Defender" || player.position === "Goalkeeper" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sky-400 flex items-center gap-1 font-mono" title="Clean Sheets">
                            <Shield className="w-3.5 h-3.5 text-sky-500 stroke-[2.5]" />
                            {player.cleanSheets || 0}
                          </span>
                          {player.goals > 0 && (
                            <span className="text-emerald-400 flex items-center gap-1 font-mono" title="Goals">
                              <Target className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                              {player.goals}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500 flex items-center gap-1 font-mono" title="Goals">
                            <Target className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                            {player.goals || 0}
                          </span>
                          <span className="text-amber-500 flex items-center gap-1 font-mono" title="Assists">
                            <Award className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                            {player.assists || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-gray-500 bg-[#0b1929] border border-white/5 rounded-2xl">
            <ShieldAlert className="w-10 h-10 text-gray-600 mx-auto mb-2.5" />
            <p className="text-xs">No active squad players match your query.</p>
          </div>
        )}
      </div>

      {/* Select details view modal overlay */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0b1929] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Header close trigger */}
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/35 w-8 h-8 rounded-full flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile banner metadata */}
            <div className="bg-[#07111f] p-6 border-b border-white/5 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative w-24 h-24 rounded-2xl bg-blue-600/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={selectedPlayer.playerImage}
                  alt={selectedPlayer.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const targetInput = e.target as HTMLImageElement;
                    targetInput.style.display = "none";
                    targetInput.parentElement!.innerHTML = `
                      <div class="text-gray-400 text-3xl font-black font-sans uppercase">
                        ${selectedPlayer.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                    `;
                  }}
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-white text-xl font-black leading-tight tracking-tight">
                    {selectedPlayer.name}
                  </h3>
                  {selectedPlayer.isNewSigning && (
                    <span className="bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xxs font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Starred core
                    </span>
                  )}
                </div>
                <p className="text-blue-400 text-xs font-bold italic mt-0.5">
                  "{selectedPlayer.nickname || selectedPlayer.name}"
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 text-xxs text-gray-400">
                  <span className="bg-blue-600/15 text-blue-400 px-3 py-1 rounded-full uppercase font-black">
                    {selectedPlayer.position}
                  </span>
                  <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-gray-300 font-semibold font-mono">
                    Jersey #{selectedPlayer.number ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Career stats layout */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-white text-xxs font-extrabold uppercase tracking-widest border-b border-white/5 pb-2 mb-3.5 flex items-center gap-1.5 text-gray-400">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Career statistics Summary
                </h4>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* Games Played / Caps */}
                  <div className="bg-[#07111f] border border-white/5 rounded-xl p-3 text-center flex flex-col items-center justify-center space-y-1">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider block mb-0.5 leading-none">Played</span>
                      <strong className="text-white text-lg font-black font-mono leading-none block">
                        {selectedPlayer.gamesPlayed ?? "—"}
                      </strong>
                      <span className="text-[9px] text-gray-500 block mt-1 tracking-wider uppercase font-semibold">Caps</span>
                    </div>
                  </div>

                  {selectedPlayer.position === "Goalkeeper" ? (
                    <>
                      {/* Goalkeeper: Clean Sheets */}
                      <div className="bg-[#07111f] border border-white/5 rounded-xl p-3 text-center flex flex-col items-center justify-center space-y-1">
                        <Shield className="w-4 h-4 text-sky-400" />
                        <div>
                          <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider block mb-0.5 leading-none">Clean sheets</span>
                          <strong className="text-sky-400 text-lg font-black font-mono leading-none block">
                            {selectedPlayer.cleanSheets ?? 0}
                          </strong>
                          <span className="text-[9px] text-sky-400/85 block mt-1 tracking-wider uppercase font-semibold">TFC CS</span>
                        </div>
                      </div>
                      {/* Goalkeeper: Saves percentage */}
                      <div className="bg-[#07111f] border border-white/5 rounded-xl p-3 text-center flex flex-col items-center justify-center space-y-1">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <div>
                          <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider block mb-0.5 leading-none">Saves pct</span>
                          <strong className="text-amber-500 text-lg font-black font-mono leading-none block">
                            {selectedPlayer.savePercentage ?? "--"}%
                          </strong>
                          <span className="text-[9px] text-amber-500/85 block mt-1 tracking-wider uppercase font-semibold">Ratio %</span>
                        </div>
                      </div>
                    </>
                  ) : selectedPlayer.position === "Defender" ? (
                    <>
                      {/* Defender: Clean Sheets */}
                      <div className="bg-[#07111f] border border-white/5 rounded-xl p-3 text-center flex flex-col items-center justify-center space-y-1">
                        <Shield className="w-4 h-4 text-sky-400" />
                        <div>
                          <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider block mb-0.5 leading-none">Clean sheets</span>
                          <strong className="text-sky-400 text-lg font-black font-mono leading-none block">
                            {selectedPlayer.cleanSheets ?? 0}
                          </strong>
                          <span className="text-[9px] text-sky-400/85 block mt-1 tracking-wider uppercase font-semibold">TFC CS</span>
                        </div>
                      </div>
                      {/* Defender: Goals */}
                      <div className="bg-[#07111f] border border-white/5 rounded-xl p-3 text-center flex flex-col items-center justify-center space-y-1">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider block mb-0.5 leading-none">Goals Scored</span>
                          <strong className="text-emerald-400 text-lg font-black font-mono leading-none block">
                            {selectedPlayer.goals ?? 0}
                          </strong>
                          <span className="text-[9px] text-emerald-400/85 block mt-1 tracking-wider uppercase font-semibold">TFC GS</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Midfield/Forwards: Goals */}
                      <div className="bg-[#07111f] border border-white/5 rounded-xl p-3 text-center flex flex-col items-center justify-center space-y-1">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider block mb-0.5 leading-none">Goals Scored</span>
                          <strong className="text-emerald-400 text-lg font-black font-mono leading-none block">
                            {selectedPlayer.goals ?? 0}
                          </strong>
                          <span className="text-[9px] text-emerald-400/85 block mt-1 tracking-wider uppercase font-semibold">TFC GS</span>
                        </div>
                      </div>
                      {/* Midfield/Forwards: Assists */}
                      <div className="bg-[#07111f] border border-white/5 rounded-xl p-3 text-center flex flex-col items-center justify-center space-y-1">
                        <Award className="w-4 h-4 text-amber-500" />
                        <div>
                          <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider block mb-0.5 leading-none">Assists</span>
                          <strong className="text-amber-500 text-lg font-black font-mono leading-none block">
                            {selectedPlayer.assists ?? 0}
                          </strong>
                          <span className="text-[9px] text-amber-500/85 block mt-1 tracking-wider uppercase font-semibold">TFC Asst</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Active MOTM Monthly Voter Box */}
              <div className="bg-gradient-to-r from-blue-900/20 via-indigo-900/10 to-[#07111f] border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="text-white text-xs font-bold flex items-center justify-center sm:justify-start gap-1">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    POTM Voting Station
                  </h4>
                  <p className="text-gray-400 text-[10px] sm:text-xxs mt-1 leading-relaxed max-w-sm">
                    Support {selectedPlayer.name} for the Player of the Month award. Submit your ballot below!
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center bg-[#07111f]/60 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-gray-400 text-[9px] uppercase tracking-wider font-semibold block leading-none mb-1">Votes</span>
                    <strong className="text-white font-mono text-sm leading-none">
                      {playerVotes[selectedPlayer.id] || 0}
                    </strong>
                  </div>

                  <button
                    disabled={hasVoted[selectedPlayer.id]}
                    onClick={() => handleLocalVote(selectedPlayer.id)}
                    className={`px-4.5 py-2 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all duration-200 ${
                      hasVoted[selectedPlayer.id]
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/15"
                    }`}
                  >
                    {hasVoted[selectedPlayer.id] ? "Saved ballot" : "Submit ballot"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
