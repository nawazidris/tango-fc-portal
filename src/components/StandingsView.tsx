import React, { useState } from "react";
import { Match, Team } from "../types";
import { Search, Trophy, Info } from "lucide-react";

interface StandingsViewProps {
  teams: Team[];
  matches: Match[];
}

export const BASE_TEAMS_LIST = [
  "Flesk FC",
  "Steers FC",
  "Careful Driving Academy",
  "Tango FC",
  "Safeguard Stars",
  "Sparklions",
  "Exor Stars",
  "Chibuku",
  "Motor Sales FC",
  "Prison Warriors",
  "Morefire FC",
  "Light Of God",
  "Mugodhi FC",
  "Cotrad",
  "Mutimurefu",
  "FC Duchima",
  "ZRP Masvingo",
  "ZINWA Runde",
  "GZU FC",
  "Thorglot All Stars"
];

export default function StandingsView({ teams, matches }: StandingsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Load Standings directly if uploaded/stored, else calculate dynamically from completed matches
  const getStandingsData = (): any[] => {
    if (teams && teams.length > 0) {
      return teams.map((t) => ({
        name: t.name,
        played: t.stats[0],
        won: t.stats[1],
        drawn: t.stats[2],
        lost: t.stats[3],
        gf: t.stats[4],
        ga: t.stats[5],
        gd: t.stats[6],
        pts: t.stats[7]
      })).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    }

    // Fallback: Re-calculate Standings Automatically from completed results dynamically!
    // 1. Initialize stats for all 20 teams
    const teamStats = BASE_TEAMS_LIST.reduce((acc, name) => {
      acc[name] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      return acc;
    }, {} as Record<string, typeof currentStats>);

    const currentStats = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };

    // 2. Loop through completed matches and add outcomes
    const completed = matches.filter((m) => m.status === "completed" && m.homeScore !== null && m.awayScore !== null);
    
    completed.forEach((m) => {
      const home = m.homeTeam.trim();
      const away = m.awayTeam.trim();
      const hs = Number(m.homeScore);
      const as = Number(m.awayScore);

      // Make sure teams exist in stats datastore
      if (!teamStats[home]) teamStats[home] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      if (!teamStats[away]) teamStats[away] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };

      // Update games played & goals ratios
      teamStats[home].played++;
      teamStats[home].gf += hs;
      teamStats[home].ga += as;

      teamStats[away].played++;
      teamStats[away].gf += as;
      teamStats[away].ga += hs;

      // Calculate outcome points (W*3 + D*1)
      if (hs > as) {
        teamStats[home].won++;
        teamStats[home].pts += 3;

        teamStats[away].lost++;
      } else if (as > hs) {
        teamStats[away].won++;
        teamStats[away].pts += 3;

        teamStats[home].lost++;
      } else {
        teamStats[home].drawn++;
        teamStats[home].pts += 1;

        teamStats[away].drawn++;
        teamStats[away].pts += 1;
      }
    });

    // 3. Compile list and recalculate Goal Difference
    const standingsList = Object.keys(teamStats).map((name) => {
      const stats = teamStats[name];
      const gd = stats.gf - stats.ga;
      return {
        name,
        played: stats.played,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        gf: stats.gf,
        ga: stats.ga,
        gd,
        pts: stats.pts,
      };
    });

    // 4. Sort beautifully: (Points DESC, then Goal Difference DESC, then Goals For DESC)
    return standingsList.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  };

  const getShortTeamName = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "";
    const first = parts[0];
    if (first.toLowerCase() === "fc" && parts[1]) {
      return parts[1];
    }
    if (name.toLowerCase().includes("tango")) {
      return "Tango FC";
    }
    return first;
  };

  const dynamicStandings = getStandingsData();

  const filteredStandings = dynamicStandings.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 px-2 md:px-0 max-w-6xl mx-auto py-6">
      
      {/* Search and Headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-white text-xl font-black tracking-tight flex items-center gap-1.5">
            <Trophy className="w-5 h-5 text-blue-500" />
            MOSSL Rankings Board
          </h2>
          <p className="text-gray-400 text-[11px]">Standings automatically recalculated from completed matches</p>
        </div>

        <div className="relative self-start sm:self-auto w-full sm:w-60">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search teams..."
            className="bg-[#0b1929] border border-white/10 focus:border-blue-500/50 p-2 pl-9 rounded-xl text-white text-xs outline-none transition-all w-full"
          />
        </div>
      </div>

      {/* Highlights Legends Row - optimized to fit one line on small screens */}
      <div className="flex flex-row items-center justify-between gap-1 text-[8.5px] font-bold uppercase tracking-wider bg-[#0b1929]/50 border border-white/5 rounded-xl p-1.5 mb-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center gap-1 px-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
          <span>Top 4 Champions</span>
        </div>
        <div className="flex items-center gap-1 border-l border-white/5 pl-2 px-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
          <span>Mid-Table</span>
        </div>
        <div className="flex items-center gap-1 border-l border-white/5 pl-2 px-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
          <span>Relegation (17+)</span>
        </div>
      </div>

      {/* Main rankings spreadsheet table */}
      <div className="bg-[#0b1929] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left text-xs min-w-[340px] md:min-w-[480px]">
            <thead className="bg-[#07111f] border-b border-white/5 text-gray-400 font-extrabold uppercase text-[9px] tracking-wider text-center">
              <tr>
                <th className="py-2.5 px-1 text-center w-8">Pos</th>
                <th className="py-2.5 px-1.5 text-left">Team</th>
                <th className="py-2.5 px-0.5 w-6" title="Played">P</th>
                <th className="py-2.5 px-0.5 w-6" title="Won">W</th>
                <th className="py-2.5 px-0.5 w-6" title="Drawn">D</th>
                <th className="py-2.5 px-0.5 w-6" title="Lost">L</th>
                <th className="py-2.5 px-0.5 w-6" title="Goals For">F</th>
                <th className="py-2.5 px-0.5 w-6" title="Goals Against">A</th>
                <th className="py-2.5 px-0.5 w-7" title="Goal Difference">GD</th>
                <th className="py-2.5 px-1.5 text-white font-black text-center w-8">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-center">
              {filteredStandings.map((team, idx) => {
                const pos = idx + 1;
                const isTango = team.name.toLowerCase().includes("tango fc") || team.name.trim() === "Tango FC";
                
                // Color zone calculations
                let zoneCls = "";
                let indicatorCls = "bg-[#07111f] border-white/5 text-gray-400";
                if (pos <= 4) {
                   zoneCls = "bg-emerald-500/5 hover:bg-emerald-500/10";
                   indicatorCls = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
                } else if (pos <= 7) {
                   zoneCls = "bg-blue-500/5 hover:bg-blue-500/10";
                   indicatorCls = "bg-blue-500/20 text-blue-400 border-blue-500/20";
                } else if (pos >= 17) {
                   zoneCls = "bg-red-500/5 hover:bg-red-500/10";
                   indicatorCls = "bg-red-500/20 text-red-100 border-red-500/30";
                }

                const rowHighlight = isTango 
                  ? "bg-blue-600/15 hover:bg-blue-600/20 font-black border-l-4 border-blue-500 text-blue-400 shadow-inner" 
                  : zoneCls;

                const gdVal = team.gd;
                const gdColor = gdVal > 0 ? "text-emerald-400 font-semibold" : gdVal < 0 ? "text-red-400 font-semibold" : "text-gray-400 font-medium";
                const gdText = gdVal > 0 ? `+${gdVal}` : `${gdVal}`;

                return (
                  <tr key={idx} className={`transition-colors duration-150 ${rowHighlight}`}>
                    <td className="py-1 px-1 font-black font-mono w-8 text-center">
                      <span className={`w-4.5 h-4.5 text-[8.5px] rounded flex items-center justify-center border font-bold mx-auto ${indicatorCls}`}>
                        {pos}
                      </span>
                    </td>
                    <td className="py-1 px-1.5 text-left font-semibold">
                      <span className={`text-[10px] md:text-[11px] tracking-tight truncate max-w-[70px] xs:max-w-[100px] md:max-w-none inline-block ${isTango ? "text-blue-400 font-black" : "text-gray-200"}`}>
                        {getShortTeamName(team.name)}
                      </span>
                    </td>
                    <td className="py-1 px-0.5 font-medium font-mono text-gray-300 text-[9.5px] w-6">{team.played}</td>
                    <td className="py-1 px-0.5 font-medium font-mono text-gray-400 text-[9.5px] w-6">{team.won}</td>
                    <td className="py-1 px-0.5 font-medium font-mono text-gray-400 text-[9.5px] w-6">{team.drawn}</td>
                    <td className="py-1 px-0.5 font-medium font-mono text-gray-400 text-[9.5px] w-6">{team.lost}</td>
                    <td className="py-1 px-0.5 font-medium font-mono text-gray-500 text-[9.5px] w-6">{team.gf}</td>
                    <td className="py-1 px-0.5 font-medium font-mono text-gray-500 text-[9.5px] w-6">{team.ga}</td>
                    <td className={`py-1 px-0.5 text-[9.5px] font-mono w-7 ${gdColor}`}>{gdText}</td>
                    <td className="py-1 px-1.5 font-black font-mono text-center w-8 text-[11px]">
                      <span className={isTango ? "text-blue-400 text-xs" : "text-white"}>
                        {team.pts}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
