import React from "react";
import { Match, Player, Team, NewsArticle, Poll } from "../types";
import { ArrowRight, Trophy, Flame, CalendarRange, Medal, Sparkles, Plus, Image } from "lucide-react";
import PollsSection from "./PollsSection";

interface DashboardProps {
  matches: Match[];
  players: Player[];
  teams: Team[];
  news: NewsArticle[];
  polls: Poll[];
  setActiveTab: (tab: string) => void;
  onSelectPlayer: (player: Player) => void;
  userToken: string | null;
  onVotePoll: (pollId: number, optionId: string) => Promise<void>;
  onSavePoll: (poll: any) => Promise<void>;
  onDeletePoll: (pollId: number) => Promise<void>;
}

export default function Dashboard({
  matches,
  players,
  teams,
  news,
  polls,
  setActiveTab,
  onSelectPlayer,
  userToken,
  onVotePoll,
  onSavePoll,
  onDeletePoll
}: DashboardProps) {
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

  // 1. Next Fixture
  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  // 2. Latest Result
  const completedMatches = matches.filter((m) => m.status === "completed");
  const latestResult = completedMatches.length > 0 ? completedMatches[completedMatches.length - 1] : null;

  // 3. Top scorers (Top 4 sorted by goals, then assists)
  const topScorers = [...players]
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, 4);

  // 4. Form tracker for Tango FC (allCompleted Matches filtering by Tango)
  const getTangoFormGroup = () => {
    const tangoCompleted = completedMatches.filter(
      (m) => m.homeTeam.includes("Tango") || m.awayTeam.includes("Tango")
    );
    // Sort by date ascending to get last 5 in timeline order
    const sorted = [...tangoCompleted].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last5 = sorted.slice(-5);

    return last5.map((m) => {
      const isHome = m.homeTeam.includes("Tango");
      const hs = m.homeScore || 0;
      const as = m.awayScore || 0;
      if (hs === as) return { r: "D", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30", match: m };
      if (isHome) {
        return hs > as
          ? { r: "W", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", match: m }
          : { r: "L", cls: "bg-red-500/20 text-red-500 border-red-500/30", match: m };
      } else {
        return as > hs
          ? { r: "W", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", match: m }
          : { r: "L", cls: "bg-red-500/20 text-red-500 border-red-500/30", match: m };
      }
    });
  };

  const formGuide = getTangoFormGroup();

  // 5. Condensed Standings Table (Top 5 teams + Tango FC if not in top 5)
  // Recursively calculate stats dynamically if desired, but here we sort current table list
  const sortedTeams = [...teams].sort((a, b) => {
    const ptsA = a.stats[7];
    const ptsB = b.stats[7];
    const gdA = a.stats[6];
    const gdB = b.stats[6];
    const gfA = a.stats[4];
    const gfB = b.stats[4];
    return ptsB - ptsA || gdB - gdA || gfB - gfA;
  });

  const topFive = sortedTeams.slice(0, 5);
  const tangoIndex = sortedTeams.findIndex((t) => t.name.toLowerCase().includes("tango"));
  const isTangoInTopFive = tangoIndex < 5;

  return (
    <div className="space-y-8 px-4 md:px-0 max-w-6xl mx-auto py-8">
      {/* Visual Hierarchy Widgets Grid (Next Match, Latest Result, Form Guide) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Next Fixture Widget Card */}
        <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="text-gray-400 text-xxs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-blue-400" />
                Next Fixture
              </span>
              <span className="text-blue-400 text-xxs font-bold uppercase bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                {nextMatch?.competition || "League"}
              </span>
            </div>

            {nextMatch ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 text-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-extrabold text-sm truncate uppercase tracking-tight">{nextMatch.homeTeam}</p>
                    <p className="text-gray-400 text-xxs mt-0.5">Home</p>
                  </div>
                  <div className="text-blue-500 font-black text-xs uppercase bg-blue-500/10 w-9 h-9 rounded-full flex items-center justify-center border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)] flex-shrink-0">
                    VS
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-extrabold text-sm truncate uppercase tracking-tight">{nextMatch.awayTeam}</p>
                    <p className="text-gray-400 text-xxs mt-0.5">Away</p>
                  </div>
                </div>

                <div className="bg-[#07111f] border border-white/5 rounded-xl p-3.5 space-y-2 text-xs">
                  <p className="text-gray-300 font-medium flex items-center justify-between text-left">
                    <span className="text-gray-400">Date</span>
                    <strong className="text-white font-bold">{new Date(nextMatch.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                  </p>
                  <p className="text-gray-300 font-medium flex items-center justify-between text-left">
                    <span className="text-gray-400">Kickoff</span>
                    <strong className="text-white font-bold">{nextMatch.time} Hrs</strong>
                  </p>
                  <p className="text-gray-300 font-medium flex items-center justify-between text-left">
                    <span className="text-gray-400">Venue</span>
                    <strong className="text-white font-bold truncate max-w-[160px]">{nextMatch.venue}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-4">No upcoming fixtures logged.</p>
            )}
          </div>

          <button
            onClick={() => setActiveTab("matches")}
            className="w-full mt-4 text-center text-xs font-bold text-blue-400 hover:text-white flex items-center justify-center gap-1 group/btn"
          >
            Matches Schedule
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </button>
        </div>

        {/* Latest Result Widget Card */}
        <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="text-gray-400 text-xxs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                Latest Result
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.06)] backdrop-blur-sm [text-shadow:0_0_10px_rgba(16,185,129,0.1)] hover:border-emerald-400/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)] transition-all duration-300 select-none group/badge">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-[9.5px] font-black uppercase tracking-widest font-mono">
                  FT Completed
                </span>
              </span>
            </div>

            {latestResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 text-center">
                  <div className="flex-1 min-w-0">
                    <p className={`font-extrabold text-sm truncate uppercase tracking-tight ${latestResult.homeTeam.includes("Tango") ? "text-blue-400 font-black" : "text-white"}`}>
                      {latestResult.homeTeam}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-emerald-400 rounded-xl text-lg font-black font-mono tracking-widest shadow-[0_0_12px_rgba(16,185,129,0.1)] flex-shrink-0">
                    {latestResult.homeScore} - {latestResult.awayScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-extrabold text-sm truncate uppercase tracking-tight ${latestResult.awayTeam.includes("Tango") ? "text-blue-400 font-black" : "text-white"}`}>
                      {latestResult.awayTeam}
                    </p>
                  </div>
                </div>

                {/* Score Events List */}
                <div className="bg-[#07111f] border border-white/5 rounded-xl p-3.5 max-h-[96px] overflow-y-auto text-xxs text-gray-400 space-y-1.5 scrollbar-thin">
                  {latestResult.events && latestResult.events.length > 0 ? (
                    latestResult.events.map((ev, idx) => {
                      const isAway = ev.team === "away";
                      return (
                        <div key={idx} className={`flex items-center gap-1.5 ${isAway ? "justify-end text-right" : "justify-start text-left"}`}>
                          <span className="text-emerald-500">⚽</span>
                          <strong className="text-gray-100 font-extrabold">{getPlayerNameShort(ev.player)}</strong>
                          {ev.minute && <span className="text-gray-500">({ev.minute}')</span>}
                          {ev.assist && (
                            <span className="text-amber-500/90 text-[9.5px] font-semibold flex items-center gap-0.5 bg-amber-500/5 px-1 rounded">
                              <span>👟</span>
                              <span>{getPlayerNameShort(ev.assist)}</span>
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center font-medium italic text-gray-500 py-1">Tactical grid sheet results.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-4">No matches completed yet.</p>
            )}
          </div>

          <button
            onClick={() => setActiveTab("matches")}
            className="w-full mt-4 text-center text-xs font-bold text-emerald-400 hover:text-white flex items-center justify-center gap-1 group/btn"
          >
            Review match center
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </button>
        </div>

        {/* Current Form Guide Widget */}
        <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="text-gray-400 text-xxs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Live Form Guide
              </span>
              <span className="text-gray-400 text-xxs font-bold">
                Tango FC
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-xxs text-gray-400 leading-relaxed">
                Form timeline across the last 5 completed fixtures. Hover on any badge to review specific match records.
              </p>

              {/* Form guidance row */}
              <div className="flex items-center justify-center gap-2.5 py-4">
                {formGuide.length > 0 ? (
                  formGuide.map((item, idx) => (
                    <div
                      key={idx}
                      title={`${item.match.homeTeam} vs ${item.match.awayTeam} (${item.match.homeScore}-${item.match.awayScore})`}
                      className={`w-9 h-9 rounded-full flex items-center justify-center border font-mono font-black text-sm uppercase cursor-pointer hover:scale-115 hover:rotate-15 hover:shadow-lg transition-all duration-200 ${item.cls}`}
                    >
                      {item.r}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 italic text-xs py-3">Roster in training pre-camp.</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("stats")}
            className="w-full mt-4 text-center text-xs font-bold text-amber-400 hover:text-white flex items-center justify-center gap-1 group/btn"
          >
            Analytical Metrics
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </button>
        </div>

      </div>

      {/* Main Double Dashboard Layout (Standings + Top Scorers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">         {/* Condensed Standings (Left Column, lg:col-span-7) */}
        <div className="lg:col-span-7 bg-[#0b1929] border border-white/10 rounded-2xl p-3 sm:p-5 shadow-xl relative">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
            <div>
              <h3 className="text-white text-sm font-black tracking-tight flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-500" />
                League Rankings Preview
              </h3>
              <p className="text-gray-400 text-xxs mt-0.5">Top zone standings from MOSSL League 2026</p>
            </div>
            <button
              onClick={() => setActiveTab("standings")}
              className="text-blue-400 hover:text-white text-xs font-bold flex items-center gap-1 group/btn"
            >
              Standings
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover/btn:translate-x-1" />
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-none rounded-xl">
            <table className="w-full text-left text-xxs md:text-xs">
              <thead className="bg-[#07111f] text-gray-400 font-bold uppercase text-[8px] md:text-[9px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-2 px-1.5 text-center w-8">Pos</th>
                  <th className="py-2 px-1.5">Team</th>
                  <th className="py-2 px-1.5 text-center">P</th>
                  <th className="py-2 px-1.5 text-center">W</th>
                  <th className="py-2 px-1.5 text-center">D</th>
                  <th className="py-2 px-1.5 text-center font-bold text-white">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(isTangoInTopFive ? topFive : [...topFive, sortedTeams[tangoIndex]]).map((team, idx) => {
                  const pos = idx + 1;
                  const isTango = team.name.toLowerCase().includes("tango");
                  const highlightedClass = isTango 
                    ? "bg-blue-600/10 font-bold border-l-4 border-blue-500" 
                    : "";

                  return (
                    <tr key={idx} className={`hover:bg-white/[0.02] transition-colors ${highlightedClass}`}>
                      <td className="py-2 px-1.5 text-center font-semibold text-gray-400 font-mono w-8">{sortedTeams.indexOf(team) + 1}</td>
                      <td className="py-2 px-1.5">
                        <span className={`text-xs md:text-[13px] tracking-tight truncate max-w-[120px] sm:max-w-[170px] inline-block ${isTango ? "text-blue-400 font-black" : "text-gray-100"}`}>
                          {team.name}
                        </span>
                      </td>
                      <td className="py-2 px-1.5 text-center font-medium font-mono text-gray-300">{team.stats[0]}</td>
                      <td className="py-2 px-1.5 text-center font-medium font-mono text-gray-300">{team.stats[1]}</td>
                      <td className="py-2 px-1.5 text-center font-medium font-mono text-gray-300">{team.stats[2]}</td>
                      <td className={`py-2 px-1.5 text-center font-black font-mono text-xs md:text-[14px] ${isTango ? "text-blue-400" : "text-gray-100"}`}>
                        {team.stats[7]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Scorers Board (Right Column, lg:col-span-5) */}
        <div className="lg:col-span-5 bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <div>
              <h3 className="text-white text-md font-black tracking-tight flex items-center gap-2">
                <Medal className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                Attacking Leaders
              </h3>
              <p className="text-gray-400 text-xxs mt-0.5">Top scorers on current events leaderboard</p>
            </div>
            <button
              onClick={() => setActiveTab("stats")}
              className="text-amber-400 hover:text-white text-xs font-bold"
            >
              All Stats
            </button>
          </div>

          <div className="space-y-2.5">
            {topScorers.map((player, idx) => (
              <div
                key={player.id}
                onClick={() => onSelectPlayer(player)}
                className="group flex items-center justify-between p-2.5 rounded-xl border border-white/5 hover:border-blue-500/30 bg-white/5 hover:bg-blue-600/[0.04] cursor-pointer transition-all duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={player.playerImage}
                      alt={player.name}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                      className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                    />
                    <div className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 bg-blue-600 border border-white/10 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center font-mono">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-gray-100 font-extrabold text-sm group-hover:text-blue-400 transition-colors truncate">
                      {player.name}
                    </h4>
                    <p className="text-gray-400 text-[10px] tracking-wide uppercase font-semibold font-sans mt-0.5">
                      {player.position}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-white text-md font-black font-mono">{player.goals}</span>
                    <span className="text-gray-400 text-xxs block -mt-0.5 uppercase tracking-wide">Goals</span>
                  </div>
                  <div className="text-right border-l border-white/5 pl-4 pr-1">
                    <span className="text-gray-300 text-sm font-extrabold font-mono">{player.assists}</span>
                    <span className="text-gray-400 text-xxs block -mt-0.5 uppercase tracking-wide">Assts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Interactive Poll of the Week Section */}
      <PollsSection
        polls={polls}
        userToken={userToken}
        onVotePoll={onVotePoll}
        onSavePoll={onSavePoll}
        onDeletePoll={onDeletePoll}
      />

      {/* Featured Club News Section Row */}
      <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
          <div>
            <h3 className="text-white text-md font-black tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              Tango FC Club News
            </h3>
            <p className="text-gray-400 text-xxs mt-0.5">Official releases, team developments & announcements</p>
          </div>
          {userToken && (
            <button
              onClick={() => setActiveTab("admin")}
              className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Manage News
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.slice(0, 3).map((article) => (
            <article
              key={article.id}
              className="group flex flex-col justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.01]"
            >
              <div className="relative aspect-video bg-[#07111f] overflow-hidden flex items-center justify-center">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  onError={(e) => {
                    // Fallback to placeholder nicely
                    const targetInput = e.target as HTMLImageElement;
                    targetInput.style.display = "none";
                    targetInput.parentElement!.innerHTML = `
                      <div class="flex flex-col items-center justify-center text-gray-500 gap-1.5">
                        <Image class="w-8 h-8 opacity-45" />
                        <span class="text-xxs uppercase tracking-wider font-semibold">TFC Graphic Media</span>
                      </div>
                    `;
                  }}
                />
                <span className="absolute top-3 left-3 bg-blue-600/90 hover:bg-blue-600 p-1 px-3.5 rounded-full text-white text-[9px] font-bold uppercase tracking-wider shadow border border-white/10 z-10">
                  {article.category}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-gray-500 text-xxs font-bold uppercase">{article.date}</span>
                  <h4 className="text-white font-extrabold text-sm mt-1.5 mb-2.5 leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                    {article.p1}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
