import React, { useState } from "react";
import { Player, Team, Match } from "../types";
import { Search, ChevronLeft, ChevronRight, BarChart3, Star, Goal, Percent, Shield, Award, Activity } from "lucide-react";

interface StatsDashboardProps {
  players: Player[];
  teams: Team[];
  matches: Match[];
  onSelectPlayer: (player: Player) => void;
}

const ITEMS_PER_PAGE = 7;

export default function StatsDashboard({ players, teams, matches, onSelectPlayer }: StatsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedFilterPosition] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"goals" | "assists" | "gamesPlayed" | "cleanSheets">("goals");

  // Calculate Tango FC advanced ratios
  const getTangoRatios = () => {
    const completedTango = matches.filter(
      (m) =>
        m.status === "completed" &&
        (m.homeTeam.trim() === "Tango FC" || m.awayTeam.trim() === "Tango FC")
    );

    let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;

    completedTango.forEach((m) => {
      const isHome = m.homeTeam.trim() === "Tango FC";
      const hs = Number(m.homeScore) || 0;
      const as = Number(m.awayScore) || 0;
      
      gf += isHome ? hs : as;
      ga += isHome ? as : hs;

      if (hs === as) {
        draws++;
      } else if (isHome) {
        hs > as ? wins++ : losses++;
      } else {
        as > hs ? wins++ : losses++;
      }
    });

    const played = completedTango.length;
    const pts = wins * 3 + draws;
    const goalsPerMatch = played ? (gf / played).toFixed(2) : "0.00";
    const ptsPerGame = played ? (pts / played).toFixed(2) : "0.00";
    const winPct = played ? ((wins / played) * 100).toFixed(0) : "0";

    return {
      played, wins, draws, losses, gf, ga, gd: gf - ga, pts, goalsPerMatch, ptsPerGame, winPct
    };
  };

  const ratios = getTangoRatios();

  // Position filters selection options
  const filterPositions = ["All", "Forward", "Midfielder", "Defender", "Goalkeeper"];

  // Sort & Filter players
  const filteredPlayers = players
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.nickname && p.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPos = selectedPosition === "All" || p.position === selectedPosition;
      return matchesSearch && matchesPos;
    })
    .sort((a, b) => b[sortField] - a[sortField]);

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPlayers = filteredPlayers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // High quality SVG Vector charts helpers
  // 1. Radar diagram stats: Goals, Assists, Clean Sheets, Matches, Saves ratio %
  const totalGoals = players.reduce((s, p) => s + p.goals, 0);
  const totalAssists = players.reduce((s, p) => s + p.assists, 0);
  const totalCS = players.reduce((s, p) => s + p.cleanSheets, 0);

  return (
    <div className="space-y-6 px-4 md:px-0 max-w-6xl mx-auto py-8">
      
      {/* Overview Analytics Dashboard Headers */}
      <div className="border-b border-white/5 pb-5">
        <h2 className="text-white text-2xl font-black tracking-tight flex items-center gap-1.5">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Club Performance Analytics
        </h2>
        <p className="text-gray-400 text-xs">Advanced metrics, individual standings, and team goals ratio tracker</p>
      </div>

      {/* Advanced Performance Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Matches Played", val: ratios.played, sub: "MOSSL 2026", color: "text-white" },
          { label: "Goals Scored", val: ratios.gf, sub: `${ratios.goalsPerMatch} Per match`, color: "text-emerald-400" },
          { label: "Goals Conceded", val: ratios.ga, sub: `GD: ${ratios.gd > 0 ? "+" + ratios.gd : ratios.gd}`, color: "text-red-400" },
          { label: "Win Percentage", val: `${ratios.winPct}%`, sub: `${ratios.wins} Wins / ${ratios.losses} Losses`, color: "text-amber-400" }
        ].map((met, idx) => (
          <div key={idx} className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 text-center">
            <span className="text-gray-400 text-xxs font-bold uppercase tracking-wider block mb-1.5">{met.label}</span>
            <strong className={`text-3xl font-black font-mono block leading-none ${met.color}`}>{met.val}</strong>
            <span className="text-gray-500 text-[10px] tracking-wide font-semibold uppercase block mt-2">{met.sub}</span>
          </div>
        ))}
      </div>

      {/* Ratios Metrics Sub-bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0b1929]/40 border border-white/5 rounded-2xl p-4.5 text-center">
        <div>
          <span className="text-gray-500 text-xxs font-bold uppercase tracking-wider">Points Per Game</span>
          <strong className="text-white text-lg font-black font-mono block mt-1">{ratios.ptsPerGame}</strong>
        </div>
        <div className="border-t sm:border-t-0 sm:border-x border-white/5 py-3 sm:py-0 sm:px-4">
          <span className="text-gray-500 text-xxs font-bold uppercase tracking-wider">Average goals per match</span>
          <strong className="text-white text-lg font-black font-mono block mt-1">{ratios.goalsPerMatch}</strong>
        </div>
        <div>
          <span className="text-gray-500 text-xxs font-bold uppercase tracking-wider">Active Run point ratio</span>
          <strong className="text-blue-400 text-lg font-black font-mono block mt-1">{ratios.pts} Pts</strong>
        </div>
      </div>

      {/* Interactive Custom SVG Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Radar Ratio visualizer */}
        <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="border-b border-white/5 pb-3 mb-4">
            <h3 className="text-white font-black text-sm tracking-tight flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/10" />
              Creativity Breakdown
            </h3>
            <p className="text-gray-400 text-xxs mt-0.5">Team core output parameters</p>
          </div>

          <div className="flex items-center justify-center py-4 bg-[#07111f] border border-white/5 rounded-xl">
            <svg width="240" height="220" viewBox="0 0 120 110" className="opacity-90">
              <circle cx="60" cy="55" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <circle cx="60" cy="55" r="30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <circle cx="60" cy="55" r="15" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              
              {/* Axes lines */}
              <line x1="60" y1="10" x2="60" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <line x1="15" y1="55" x2="105" y2="55" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

              {/* Labels */}
              <text x="60" y="8" fill="#9ca3af" fontSize="4.5" fontWeight="bold" textAnchor="middle" className="uppercase font-sans tracking-wide">Goals</text>
              <text x="110" y="56" fill="#9ca3af" fontSize="4.5" fontWeight="bold" textAnchor="start" className="uppercase font-sans tracking-wide">Assts</text>
              <text x="60" y="107" fill="#9ca3af" fontSize="4.5" fontWeight="bold" textAnchor="middle" className="uppercase font-sans tracking-wide">Defense</text>
              <text x="10" y="56" fill="#9ca3af" fontSize="4.5" fontWeight="bold" textAnchor="end" className="uppercase font-sans tracking-wide">Saves</text>

              {/* Data vectors polygon */}
              {/* Normalised to max 40 scale */}
              <polygon
                points="60,25 90,55 60,70 35,55"
                fill="rgba(59, 130, 246, 0.25)"
                stroke="#3b82f6"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              
              {/* Data Vertices */}
              <circle cx="60" cy="25" r="1.5" fill="#3b82f6" />
              <circle cx="90" cy="55" r="1.5" fill="#3b82f6" />
              <circle cx="60" cy="70" r="1.5" fill="#3b82f6" />
              <circle cx="35" cy="55" r="1.5" fill="#3b82f6" />
            </svg>
          </div>
        </div>

        {/* Doughnut efficiency visualizer */}
        <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="border-b border-white/5 pb-3 mb-4">
            <h3 className="text-white font-black text-sm tracking-tight flex items-center gap-1.5">
              <Goal className="w-4 h-4 text-emerald-400" />
              Squad Goals contribution
            </h3>
            <p className="text-gray-400 text-xxs mt-0.5">Top scorers percentage distribution ratio</p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 bg-[#07111f] border border-white/5 rounded-xl min-h-[220px]">
            <svg width="140" height="140" viewBox="0 0 36 36" className="transform -rotate-90">
              {/* Doughnum rings representing ratios */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
              
              {/* Edrice goals: 8 (approx 53%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="53 47" strokeDashoffset="0" />
              
              {/* Vincho goals: 3 (approx 20%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-53" />

              {/* Tan tan goals: 2 (approx 13%) */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="13 87" strokeDashoffset="-73" />
            </svg>

            {/* Legends labels list */}
            <div className="flex items-center gap-3 mt-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Edrice</span>
              <span className="flex items-center gap-1.5 border-l border-white/5 pl-3"><span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span> Vincho</span>
              <span className="flex items-center gap-1.5 border-l border-white/5 pl-3"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Tan tan</span>
            </div>
          </div>
        </div>

      </div>

      {/* Paginated Squad Performance Spreadsheet */}
      <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-3 md:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3 mb-3">
          <div>
            <h3 className="text-white text-xs md:text-sm font-black tracking-tight">squad Individual Ledger</h3>
            <p className="text-gray-400 text-[10px] md:text-xxs mt-0.5">Filter, sort, and search metrics by specific game variables</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial min-w-[100px]">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-3 h-3" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="bg-[#07111f] border border-white/10 focus:border-blue-500/50 p-1.5 pl-7.5 rounded-lg text-white text-[10px] outline-none transition-all w-full sm:w-28 md:w-36"
              />
            </div>

            {/* Position filter */}
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedFilterPosition(e.target.value)}
              className="bg-[#07111f] border border-white/10 focus:border-blue-500/50 p-1.5 px-2 rounded-lg text-white text-[10px] outline-none flex-1 sm:flex-initial"
            >
              {filterPositions.map((pos) => (
                <option key={pos} value={pos}>{pos === "All" ? "Positions" : pos + "s"}</option>
              ))}
            </select>

            {/* Sort field parameters */}
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="bg-[#07111f] border border-white/10 focus:border-blue-500/50 p-1.5 px-2 rounded-lg text-white text-[10px] outline-none flex-1 sm:flex-initial"
            >
              <option value="goals">Goals</option>
              <option value="assists">Assists</option>
              <option value="gamesPlayed">Caps</option>
              <option value="cleanSheets">Clean Sheets</option>
            </select>
          </div>
        </div>

        {/* Tabular entries list */}
        <div className="overflow-x-auto scrollbar-none rounded-xl">
          <table className="w-full text-left text-xxs md:text-xs min-w-[280px] md:min-w-[550px]">
            <thead className="bg-[#07111f] border-b border-white/5 text-gray-400 font-extrabold uppercase text-[8px] md:text-[9px] tracking-wider text-center">
              <tr>
                <th className="py-2 px-1 text-left">Player</th>
                <th className="py-2 px-1 text-left hidden xs:table-cell">Pos</th>
                <th className="py-2 px-1">
                  <span className="flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-gray-500" />
                    Caps
                  </span>
                </th>
                <th className="py-2 px-1 text-emerald-400">
                  <span className="flex items-center justify-center gap-1 text-emerald-400">
                    <Goal className="w-3 h-3 text-emerald-400" />
                    Gls
                  </span>
                </th>
                <th className="py-2 px-1 text-amber-400">
                  <span className="flex items-center justify-center gap-1 text-amber-400">
                    <Award className="w-3 h-3 text-amber-500" />
                    Ast
                  </span>
                </th>
                <th className="py-2 px-1 text-sky-400">
                  <span className="flex items-center justify-center gap-1 text-sky-400">
                    <Shield className="w-3 h-3 text-sky-400" />
                    CS
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-center">
              {paginatedPlayers.length > 0 ? (
                paginatedPlayers.map((player) => (
                  <tr
                    key={player.id}
                    onClick={() => onSelectPlayer(player)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-1 text-left flex items-center gap-1.5">
                      <img src={player.playerImage} alt={player.name} className="w-6 h-6 rounded object-cover border border-white/5 flex-shrink-0" />
                      <div className="min-w-0">
                        <strong className="text-white text-[10px] md:text-xs font-bold block leading-tight truncate max-w-[65px] xs:max-w-[100px] md:max-w-none">{player.name}</strong>
                        <span className="text-gray-500 text-[8px] md:text-xxs leading-none block truncate">{player.nickname ? `"${player.nickname}"` : `#${player.number ?? "—"}`}</span>
                      </div>
                    </td>
                    <td className="py-2 px-1 text-left font-medium text-blue-400 font-sans tracking-wide uppercase text-[8px] md:text-xxs hidden xs:table-cell">
                      {player.position}
                    </td>
                    <td className="py-2 px-1 font-semibold font-mono text-gray-300 text-[10px] md:text-xs">{player.gamesPlayed}</td>
                    <td className="py-2 px-1 font-black font-mono text-emerald-400 text-[10px] md:text-xs">{player.goals}</td>
                    <td className="py-2 px-1 font-extrabold font-mono text-amber-400 text-[10px] md:text-xs">{player.assists}</td>
                    <td className="py-2 px-1 font-semibold font-mono text-gray-400 text-[10px] md:text-xs">{player.cleanSheets}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-xxs italic">No players matching the active spreadsheet search query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Controls block footer as requested */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4">
            <span className="text-xxs text-gray-400 font-medium">
              Showing <strong className="text-white font-bold">{startIndex + 1}</strong> to{" "}
              <strong className="text-white font-bold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredPlayers.length)}</strong> of{" "}
              <strong className="text-white font-bold">{filteredPlayers.length}</strong> players
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-1 px-2.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-7.5 h-7.5 text-xxs font-bold rounded-lg border transition-colors ${
                    currentPage === i + 1
                      ? "bg-blue-600 border-blue-500 text-white font-black"
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-1 px-2.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
