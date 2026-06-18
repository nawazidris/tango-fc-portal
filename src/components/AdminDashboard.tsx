import React, { useState } from "react";
import { Player, Match, Team, MatchEvent, NewsArticle } from "../types";
import {
  Trophy, Plus, Save, Trash2, Upload, Calendar, ClipboardList, RefreshCcw, 
  MessageSquare, UserPlus, Sparkles, FileText, CheckCircle2, ShieldAlert,
  Info, CircleDot
} from "lucide-react";

interface AdminDashboardProps {
  token: string;
  role: string;
  players: Player[];
  matches: Match[];
  teams: Team[];
  news: NewsArticle[];
  gallery?: any[];
  videos?: any[];
  onSavePlayer: (player: any) => Promise<void>;
  onDeletePlayer: (id: number) => Promise<void>;
  onSaveMatch: (match: any) => Promise<void>;
  onDeleteMatch: (id: number) => Promise<void>;
  onUploadStandings: (teams: any[]) => Promise<void>;
  onSaveNews: (article: any) => Promise<void>;
  onDeleteNews: (id: number) => Promise<void>;
  onSaveGalleryItem?: (item: any) => Promise<void>;
  onDeleteGalleryItem?: (id: number) => Promise<void>;
  onSaveVideoItem?: (video: any) => Promise<void>;
  onDeleteVideoItem?: (id: number) => Promise<void>;
  onReload: () => void;
}

export default function AdminDashboard({
  token,
  role,
  players,
  matches,
  teams,
  news,
  gallery = [],
  videos = [],
  onSavePlayer,
  onDeletePlayer,
  onSaveMatch,
  onDeleteMatch,
  onUploadStandings,
  onSaveNews,
  onDeleteNews,
  onSaveGalleryItem,
  onDeleteGalleryItem,
  onSaveVideoItem,
  onDeleteVideoItem,
  onReload
}: AdminDashboardProps) {
  // Admin Tabs selectors
  const [adminTab, setAdminTab] = useState<"dashboard" | "players" | "matches" | "standings" | "news" | "media">("dashboard");

  // Auth roles helper
  const isAdmin = role === "Admin";
  const isCoach = role === "Coach" || isAdmin;
  const isLogistics = role === "Logistics" || isAdmin;

  // -- 1. Players Section State --
  const [pId, setPId] = useState<number | null>(null);
  const [pName, setPName] = useState("");
  const [pNickname, setPNickname] = useState("");
  const [pPosition, setPPosition] = useState<any>("Forward");
  const [pNumber, setPNumber] = useState("");
  const [pGoals, setPGoals] = useState("");
  const [pAssists, setPAssists] = useState("");
  const [pCleanSheets, setPCleanSheets] = useState("");
  const [pGamesPlayed, setPGamesPlayed] = useState("");
  const [pSavePct, setPSavePct] = useState("");
  const [pImage, setPImage] = useState("");

  const handleEditPlayerClick = (p: Player) => {
    setPId(p.id);
    setPName(p.name);
    setPNickname(p.nickname || "");
    setPPosition(p.position);
    setPNumber(p.number ? String(p.number) : "");
    setPGoals(String(p.goals));
    setPAssists(String(p.assists));
    setPCleanSheets(String(p.cleanSheets));
    setPGamesPlayed(String(p.gamesPlayed));
    setPSavePct(p.savePercentage ? String(p.savePercentage) : "");
    setPImage(p.playerImage);
    setAdminTab("players");
  };

  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPosition) return;

    await onSavePlayer({
      id: pId,
      name: pName,
      nickname: pNickname,
      position: pPosition,
      number: pNumber ? Number(pNumber) : null,
      goals: pGoals ? Number(pGoals) : 0,
      assists: pAssists ? Number(pAssists) : 0,
      cleanSheets: pCleanSheets ? Number(pCleanSheets) : 0,
      gamesPlayed: pGamesPlayed ? Number(pGamesPlayed) : 0,
      savePercentage: pSavePct ? Number(pSavePct) : 0,
      playerImage: pImage
    });

    // Reset Form
    setPId(null); setPName(""); setPNickname(""); setPNumber("");
    setPGoals(""); setPAssists(""); setPCleanSheets(""); setPGamesPlayed(""); setPSavePct(""); setPImage("");
  };

  // -- 2. Matches Section State --
  const [mId, setMId] = useState<number | null>(null);
  const [mHomeTeam, setMHomeTeam] = useState("");
  const [mAwayTeam, setMAwayTeam] = useState("");
  const [mDate, setMDate] = useState("");
  const [mTime, setMTime] = useState("");
  const [mVenue, setMVenue] = useState("");
  const [mStatus, setMStatus] = useState<any>("upcoming");
  const [mHomeScore, setMHomeScore] = useState("");
  const [mAwayScore, setMAwayScore] = useState("");
  const [mCompetition, setMCompetition] = useState("League");
  const [mEvents, setMEvents] = useState<MatchEvent[]>([]);
  const [mPlayerOfTheMatch, setMPlayerOfTheMatch] = useState("");

  // Individual Event log inputs
  const [tempEvType, setTempEvType] = useState<any>("goal");
  const [tempEvTeam, setTempEvTeam] = useState<any>("home");
  const [tempEvPlayer, setTempEvPlayer] = useState("");
  const [tempEvMinute, setTempEvMinute] = useState("");
  const [tempEvAssist, setTempEvAssist] = useState("");

  const handleAddEvent = () => {
    if (!tempEvPlayer) return;
    const newEv: MatchEvent = {
      type: tempEvType,
      team: tempEvTeam,
      player: tempEvPlayer,
      minute: tempEvMinute ? Number(tempEvMinute) : undefined,
    };
    if (tempEvType === "goal" && tempEvAssist) {
      newEv.assist = tempEvAssist;
    }
    setMEvents([...mEvents, newEv]);

    setTempEvPlayer("");
    setTempEvMinute("");
    setTempEvAssist("");
  };

  const handleRemoveEvent = (idx: number) => {
    setMEvents(mEvents.filter((_, i) => i !== idx));
  };

  const handleEditMatchClick = (m: Match) => {
    setMId(m.id);
    setMHomeTeam(m.homeTeam);
    setMAwayTeam(m.awayTeam);
    setMDate(m.date);
    setMTime(m.time);
    setMVenue(m.venue);
    setMStatus(m.status);
    setMHomeScore(m.homeScore !== null ? String(m.homeScore) : "");
    setMAwayScore(m.awayScore !== null ? String(m.awayScore) : "");
    setMCompetition(m.competition || "League");
    setMEvents(m.events || []);
    setMPlayerOfTheMatch(m.playerOfTheMatch || "");
    setAdminTab("matches");
  };

  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mHomeTeam || !mAwayTeam || !mDate) return;

    await onSaveMatch({
      id: mId,
      homeTeam: mHomeTeam,
      awayTeam: mAwayTeam,
      date: mDate,
      time: mTime,
      venue: mVenue,
      status: mStatus,
      homeScore: mHomeScore !== "" ? Number(mHomeScore) : null,
      awayScore: mAwayScore !== "" ? Number(mAwayScore) : null,
      competition: mCompetition,
      events: mEvents,
      playerOfTheMatch: mPlayerOfTheMatch || undefined
    });

    // Reset Form
    setMId(null); setMHomeTeam(""); setMAwayTeam(""); setMDate(""); setMTime(""); setMVenue("");
    setMStatus("upcoming"); setMHomeScore(""); setMAwayScore(""); setMCompetition("League"); setMEvents([]);
    setMPlayerOfTheMatch("");
  };

  // -- 3. Standings Multi-Uploader State --
  const [standingsTextInput, setStandingsTextInput] = useState("");
  const [parsedPreviewRows, setParsedPreviewRows] = useState<any[]>([]);

  const handleStandingsParse = () => {
    if (!standingsTextInput.trim()) return;

    const lines = standingsTextInput.split("\n").map(l => l.trim()).filter(Boolean);
    const resultRows: any[] = [];

    lines.forEach(line => {
      // Split by tab, comma, or double space
      const tokens = line.split(/\t|,|  +/).map(t => t.trim()).filter(Boolean);
      if (tokens.length >= 8) {
        // Assume format: Pos, Team, Played, Won, Drawn, Lost, GF, GA, GD, Pts
        // Pos can be first token, Team second. If first token looks like string, index 0 is first team
        const pos = Number(tokens[0]) || null;
        const name = pos ? tokens[1] : tokens[0];
        const statOffset = pos ? 2 : 1;

        resultRows.push({
          name,
          played: Number(tokens[statOffset]) || 0,
          won: Number(tokens[statOffset + 1]) || 0,
          drawn: Number(tokens[statOffset + 2]) || 0,
          lost: Number(tokens[statOffset + 3]) || 0,
          gf: Number(tokens[statOffset + 4]) || 0,
          ga: Number(tokens[statOffset + 5]) || 0,
          gd: Number(tokens[statOffset + 6]) || 0,
          pts: Number(tokens[statOffset + 7]) || 0,
        });
      }
    });

    setParsedPreviewRows(resultRows);
  };

  const handleStandingsUploadSubmit = async () => {
    if (parsedPreviewRows.length === 0) return;
    await onUploadStandings(parsedPreviewRows);
    setStandingsTextInput("");
    setParsedPreviewRows([]);
  };

  // -- 4. News Section State --
  const [nId, setNId] = useState<number | null>(null);
  const [nTitle, setNTitle] = useState("");
  const [nCategory, setNCategory] = useState("News");
  const [nP1, setNP1] = useState("");
  const [nP2, setNP2] = useState("");
  const [nImage, setNImage] = useState("");
  const [nDate, setNDate] = useState("");

  const handleEditNewsClick = (article: NewsArticle) => {
    setNId(article.id);
    setNTitle(article.title);
    setNCategory(article.category);
    setNP1(article.p1);
    setNP2(article.p2 || "");
    setNImage(article.imageUrl);
    setNDate(article.date);
    setAdminTab("news");
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nTitle || !nP1) return;

    await onSaveNews({
      id: nId,
      title: nTitle,
      category: nCategory,
      p1: nP1,
      p2: nP2,
      imageUrl: nImage,
      date: nDate || new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    });

    setNId(null); setNTitle(""); setNCategory("News"); setNP1(""); setNP2(""); setNImage(""); setNDate("");
  };

  // -- 5. Media Management Section State --
  const [photoId, setPhotoId] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCategory, setPhotoCategory] = useState("newseason");

  const [videoId, setVideoId] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCategory, setVideoCategory] = useState("newseason");

  const handleEditPhotoClick = (photo: any) => {
    setPhotoId(photo.id);
    setPhotoUrl(photo.url);
    setPhotoTitle(photo.title);
    setPhotoCategory(photo.category || "newseason");
  };

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || !photoTitle) return;
    if (onSaveGalleryItem) {
      await onSaveGalleryItem({
        id: photoId,
        url: photoUrl,
        title: photoTitle,
        category: photoCategory
      });
      setPhotoId(null);
      setPhotoUrl("");
      setPhotoTitle("");
      setPhotoCategory("newseason");
    }
  };

  const handleEditVideoItemClick = (vid: any) => {
    setVideoId(vid.id);
    setVideoUrl(vid.url);
    setVideoTitle(vid.title);
    setVideoCategory(vid.category || "newseason");
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl || !videoTitle) return;
    if (onSaveVideoItem) {
      await onSaveVideoItem({
        id: videoId,
        url: videoUrl,
        title: videoTitle,
        category: videoCategory
      });
      setVideoId(null);
      setVideoUrl("");
      setVideoTitle("");
      setVideoCategory("newseason");
    }
  };

  return (
    <div className="space-y-8 px-4 md:px-0 max-w-6xl mx-auto py-8">
      
      {/* Admin Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center rounded-xl shadow">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-black tracking-tight">Admin Console Dashboard</h2>
            <p className="text-gray-400 text-xs">Manage Tango FC rosters, match logs, events, standings, and news updates</p>
          </div>
        </div>

        {/* Console Nav Tabs */}
        <div className="flex flex-wrap bg-[#0b1929] border border-white/10 rounded-xl p-1 gap-1 w-full sm:w-auto">
          {[
            { id: "dashboard", label: "Control Hub" },
            { id: "players", label: "Players Directory" },
            { id: "matches", label: "Matches Board" },
            { id: "standings", label: "Table Upload" },
            { id: "news", label: "Newsroom" },
            { id: "media", label: "Media Hub" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all duration-150 whitespace-nowrap ${
                adminTab === tab.id
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/10"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={onReload}
            title="Reload backend cache state"
            className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white text-gray-400 transition-colors flex items-center justify-center gap-1.5 px-3 sm:px-1.5 flex-1 sm:flex-initial"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span className="sm:hidden text-xxs font-bold uppercase tracking-wider">Reload Cache</span>
          </button>
        </div>
      </div>

      {/* --- TAB A: CONTROL HUB --- */}
      {adminTab === "dashboard" && (
        <div className="space-y-6">
          <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <h3 className="text-white text-base font-extrabold flex items-center gap-1.5 leading-none mb-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              Tango FC Core Control Panel
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed max-w-2xl">
              Welcome back. You are authenticated with <strong className="text-amber-500">{role}</strong> privileges. Use this secure database portal to update outcomes in real-time. Standings are recalculated on-screen instantly from matches results.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Registered Squad", count: players.length, desc: "Active players list", color: "text-blue-500" },
                { label: "Total Matches logged", count: matches.length, desc: `${matches.filter(m => m.status === "completed").length} played / ${matches.filter(m => m.status === "upcoming").length} upcoming`, color: "text-emerald-500" },
                { label: "MOSSL Opponents", count: teams.length, desc: "Active leagues teams", color: "text-white" },
                { label: "Newsroom Articles", count: news.length, desc: "Published releases", color: "text-amber-500" }
              ].map((c, i) => (
                <div key={i} className="bg-[#07111f] border border-white/5 rounded-xl p-4.5">
                  <span className="text-gray-500 text-xxs font-bold uppercase tracking-wider block mb-1">{c.label}</span>
                  <strong className={`text-2xl font-black font-mono block leading-none ${c.color}`}>{c.count}</strong>
                  <span className="text-gray-500 text-[9px] block mt-1.5 uppercase font-bold tracking-wide font-sans">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines details role */}
          <div className="bg-[#0b1929]/50 border border-white/5 rounded-2xl p-5 text-xs inline-flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Privilege Rights Matrix:</h4>
              <ul className="list-disc pl-4 space-y-1 text-gray-400">
                <li><strong className="text-amber-500">Administrator</strong>: Full database operations (Matches, Players, Standings upload, news).</li>
                <li><strong className="text-[#3b82f6]">Coach</strong>: Can create or amend match scores, log highlights/goals, but cannot add/delete players or upload standings.</li>
                <li><strong className="text-[#10b981]">Logistics</strong>: Can manage player profiles, jerseys, bio notes, but cannot log match results.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB B: PLAYERS DIRECTORY --- */}
      {adminTab === "players" && (
        <div className="space-y-6">
          {isLogistics ? (
            <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-lg">
              <h3 className="text-white text-sm font-extrabold flex items-center gap-1.5 border-b border-white/5 pb-3 mb-4">
                <UserPlus className="w-4 h-4 text-blue-500" />
                {pId ? "Update Existing Player" : "Join Custom Athlete to Squad"}
              </h3>

              <form onSubmit={handlePlayerSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Player Name *</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. John Moyo"
                    className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Nickname</label>
                  <input
                    type="text"
                    value={pNickname}
                    onChange={(e) => setPNickname(e.target.value)}
                    placeholder="e.g. Bambo"
                    className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Position *</label>
                  <select
                    value={pPosition}
                    onChange={(e) => setPPosition(e.target.value as any)}
                    className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                  >
                    <option value="Forward">Forward</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Defender">Defender</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Jersey Number</label>
                  <input
                    type="number"
                    value={pNumber}
                    onChange={(e) => setPNumber(e.target.value)}
                    placeholder="e.g. 10"
                    className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Games Played</label>
                  <input
                    type="number"
                    value={pGamesPlayed}
                    onChange={(e) => setPGamesPlayed(e.target.value)}
                    placeholder="e.g. 7"
                    className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Goals</label>
                  <input
                    type="number"
                    value={pGoals}
                    onChange={(e) => setPGoals(e.target.value)}
                    placeholder="e.g. 5"
                    className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Assists</label>
                  <input
                    type="number"
                    value={pAssists}
                    onChange={(e) => setPAssists(e.target.value)}
                    placeholder="9"
                    className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Clean Sheets</label>
                  <input
                    type="number"
                    value={pCleanSheets}
                    onChange={(e) => setPCleanSheets(e.target.value)}
                    placeholder="2"
                    className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                  />
                </div>

                {pPosition === "Goalkeeper" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Saves Percentage %</label>
                    <input
                      type="number"
                      value={pSavePct}
                      onChange={(e) => setPSavePct(e.target.value)}
                      placeholder="e.g. 70"
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Profile Photo Image URL</label>
                  <input
                    type="text"
                    value={pImage}
                    onChange={(e) => setPImage(e.target.value)}
                    placeholder="https://placehold.co/300x300?text=John"
                    className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-2.5 pt-4">
                  {pId && (
                    <button
                      type="button"
                      onClick={() => {
                        setPId(null); setPName(""); setPNickname(""); setPNumber("");
                        setPGoals(""); setPAssists(""); setPCleanSheets(""); setPGamesPlayed(""); setPSavePct(""); setPImage("");
                      }}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 px-4 py-2 rounded-xl text-xxs font-bold uppercase tracking-wider"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#10b981] hover:bg-emerald-400 text-white font-bold p-2.5 px-6 rounded-xl text-xxs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-4 h-4" />
                    Save Player
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              Unauthorized access right restrictions. Logistics manager credentials required to manage players profiles.
            </div>
          )}

          {/* Roster list representation */}
          <div className="space-y-3">
            <h4 className="text-white text-xxs font-extrabold uppercase tracking-widest text-gray-500">First-Team Registered roster ({players.length} players)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {players.map((p) => (
                <div key={p.id} className="bg-[#0b1929] border border-white/5 p-3 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.playerImage} alt={p.name} className="w-9 h-9 rounded object-cover border border-white/5 flex-shrink-0" />
                    <div className="min-w-0">
                      <strong className="text-white text-xs font-bold block leading-tight truncate">{p.name}</strong>
                      <span className="text-gray-500 text-xxs italic block truncate font-sans">#{p.number ?? "—"} · {p.position}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isLogistics && (
                      <button
                        onClick={() => handleEditPlayerClick(p)}
                        className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/10 px-2.5 py-1 rounded text-xxs font-bold uppercase tracking-wider transition-all"
                      >
                        Edit
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => onDeletePlayer(p.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 p-1 px-2 rounded-lg text-xxs font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB C: MATCHES BOARD --- */}
      {adminTab === "matches" && (
        <div className="space-y-6">
          {isCoach ? (
            <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-white text-sm font-extrabold flex items-center gap-1.5 border-b border-white/5 pb-3">
                <Calendar className="w-4 h-4 text-blue-500" />
                {mId ? "Edit Match Result Card" : "Schedule Upcoming Match fixture"}
              </h3>

              <form onSubmit={handleMatchSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Home Team *</label>
                    <input
                      type="text"
                      required
                      value={mHomeTeam}
                      onChange={(e) => setMHomeTeam(e.target.value)}
                      placeholder="e.g. Tango FC"
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Away Team *</label>
                    <input
                      type="text"
                      required
                      value={mAwayTeam}
                      onChange={(e) => setMAwayTeam(e.target.value)}
                      placeholder="e.g. ZRP Masvingo"
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Fixture Date *</label>
                    <input
                      type="date"
                      required
                      value={mDate}
                      onChange={(e) => setMDate(e.target.value)}
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Time</label>
                    <input
                      type="time"
                      value={mTime}
                      onChange={(e) => setMTime(e.target.value)}
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Venue</label>
                    <input
                      type="text"
                      value={mVenue}
                      onChange={(e) => setMVenue(e.target.value)}
                      placeholder="e.g. Shakashe Stadium"
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Match Status *</label>
                    <select
                      value={mStatus}
                      onChange={(e) => setMStatus(e.target.value as any)}
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed Result</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Home Score</label>
                    <input
                      type="number"
                      value={mHomeScore}
                      onChange={(e) => setMHomeScore(e.target.value)}
                      placeholder="e.g. 3"
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Away Score</label>
                    <input
                      type="number"
                      value={mAwayScore}
                      onChange={(e) => setMAwayScore(e.target.value)}
                      placeholder="e.g. 2"
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Competition Category</label>
                    <input
                      type="text"
                      value={mCompetition}
                      onChange={(e) => setMCompetition(e.target.value)}
                      placeholder="e.g. League"
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  {mStatus === "completed" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider text-amber-500">Player of the Match</label>
                      <select
                        value={mPlayerOfTheMatch}
                        onChange={(e) => setMPlayerOfTheMatch(e.target.value)}
                        className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none cursor-pointer"
                      >
                        <option value="">-- No POTM Selected --</option>
                        {players.map(p => (
                          <option key={p.id} value={p.name}>{p.name} {p.nickname ? `(${p.nickname})` : ""}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Match Events details log section */}
                <div className="bg-[#07111f] border border-white/5 rounded-xl p-4.5 space-y-4">
                  <div className="flex items-center gap-1 text-xxs font-bold uppercase text-amber-500 tracking-wider">
                    <CircleDot className="w-4 h-4" />
                    Log Match Highlights / Live Events ({mEvents.length} events logged)
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 items-end">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500 text-[10px] font-bold uppercase">Type</label>
                      <select
                        value={tempEvType}
                        onChange={(e) => setTempEvType(e.target.value as any)}
                        className="bg-[#0b1929] border border-white/15 p-2 rounded-lg text-white text-xxs outline-none"
                      >
                        <option value="goal">Goal Scored ⚽</option>
                        <option value="yellow_card">Yellow Card 🟨</option>
                        <option value="red_card">Red Card 🟥</option>
                        <option value="substitution">Substitution 🔁</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500 text-[10px] font-bold uppercase">Team Aspect</label>
                      <select
                        value={tempEvTeam}
                        onChange={(e) => setTempEvTeam(e.target.value as any)}
                        className="bg-[#0b1929] border border-white/15 p-2 rounded-lg text-white text-xxs outline-none"
                      >
                        <option value="home">Home side</option>
                        <option value="away">Away side</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500 text-[10px] font-bold uppercase">Player name</label>
                      <select
                        value={tempEvPlayer}
                        onChange={(e) => setTempEvPlayer(e.target.value)}
                        className="bg-[#0b1929] border border-white/15 p-2 rounded-lg text-white text-[#9ca3af] text-xxs outline-none"
                      >
                        <option value="">Select scorer</option>
                        {players.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {tempEvType === "goal" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-gray-500 text-[10px] font-bold uppercase">Assist Player</label>
                        <select
                          value={tempEvAssist}
                          onChange={(e) => setTempEvAssist(e.target.value)}
                          className="bg-[#0b1929] border border-white/15 p-2 rounded-lg text-white text-[#9ca3af] text-xxs outline-none"
                        >
                          <option value="">No assist (None)</option>
                          {players.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500 text-[10px] font-bold uppercase">Game Minute</label>
                      <input
                        type="number"
                        value={tempEvMinute}
                        onChange={(e) => setTempEvMinute(e.target.value)}
                        placeholder="e.g. 45"
                        className="bg-[#0b1929] border border-white/15 p-2 rounded-lg text-white text-xxs outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddEvent}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-lg text-xxs font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Event
                    </button>
                  </div>

                  {/* Visual listing of MatchEvents */}
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pt-2">
                    {mEvents.map((ev, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-[#0b1929] p-2 border border-white/10 rounded-lg">
                        <span className="text-gray-300 font-medium">
                          [{ev.team.toUpperCase()}] <strong className="text-white font-bold">{ev.type.toUpperCase()}</strong>: {ev.player}
                          {ev.minute && ` (${ev.minute}')`}
                          {ev.assist && ` (asst: ${ev.assist})`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvent(i)}
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  {mId && (
                    <button
                      type="button"
                      onClick={() => {
                        setMId(null); setMHomeTeam(""); setMAwayTeam(""); setMDate(""); setMTime(""); setMVenue("");
                        setMStatus("upcoming"); setMHomeScore(""); setMAwayScore(""); setMCompetition("League"); setMEvents([]);
                      }}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 px-4 py-2 rounded-xl text-xxs font-bold uppercase tracking-wider"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#10b981] hover:bg-emerald-400 text-white font-bold p-2.5 px-6 rounded-xl text-xxs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-4 h-4" />
                    Save Match
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              Unauthorized access right restrictions. Field Coach credentials required to manage matches fixtures or scores.
            </div>
          )}

          {/* Roster list representation */}
          <div className="space-y-3">
            <h4 className="text-white text-xxs font-extrabold uppercase tracking-widest text-gray-500">Matches logs schedules list</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
              {matches.map((m) => (
                <div key={m.id} className="bg-[#0b1929] border border-white/5 p-3 rounded-xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <strong className="text-white text-xs font-bold block leading-tight truncate">
                      {m.homeTeam} vs {m.awayTeam}
                    </strong>
                    <span className="text-gray-500 text-xxs block mt-0.5 font-sans leading-none">
                      {m.date} · {m.venue} ·{" "}
                      <strong className={m.status === "completed" ? "text-emerald-400" : "text-amber-500"}>
                        {m.status === "completed" ? `${m.homeScore} - ${m.awayScore}` : "Upcoming"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {isCoach && (
                      <button
                        onClick={() => handleEditMatchClick(m)}
                        className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/10 px-2.5 py-1 rounded text-xxs font-bold uppercase tracking-wider transition-all"
                      >
                        Edit
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => onDeleteMatch(m.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 p-1 px-2 rounded-lg text-xxs font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB D: TABLE MULTI-UPLOAD --- */}
      {adminTab === "standings" && (
        <div className="space-y-6">
          {isAdmin ? (
            <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-white text-sm font-extrabold flex items-center gap-1.5 border-b border-white/5 pb-3">
                <Upload className="w-4 h-4 text-blue-500" />
                Raw Standings Document Multi-Uploader
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed leading-normal">
                Quick-paste bulk records copy-pasted directly from your terminal databases log sheets or spreadsheet table. Columns parsed should align closely with Pos, Team name, Played, Won, Drawn, Losses, GF, GA, GD, Points as logged in <code>log.json</code>.
              </p>

              <div className="space-y-3.5">
                <textarea
                  rows={6}
                  value={standingsTextInput}
                  onChange={(e) => setStandingsTextInput(e.target.value)}
                  placeholder="Pos   Team Name   P   W   D   L   GF   GA   GD   Pts&#10;1   Flesk FC   12   8   4   0   34   7   27   28&#10;2   Steers FC   12   7   4   1   24   12   12   25"
                  className="w-full bg-[#07111f] border border-white/10 focus:border-blue-500/40 p-4 rounded-xl text-white text-xxs outline-none font-mono tracking-wide leading-relaxed"
                />

                <div className="flex justify-between items-center flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={handleStandingsParse}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-2 py-2 px-5 rounded-lg text-xxs font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Parse Text
                  </button>

                  {parsedPreviewRows.length > 0 && (
                    <button
                      type="button"
                      onClick={handleStandingsUploadSubmit}
                      className="bg-[#10b981] hover:bg-emerald-400 text-white font-extrabold p-2 py-2 px-6 rounded-lg text-xxs uppercase tracking-wider flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      Approve &amp; Replace Standings ({parsedPreviewRows.length} Teams parsed)
                    </button>
                  )}
                </div>
              </div>

              {/* Parsed Standings Preview Table */}
              {parsedPreviewRows.length > 0 && (
                <div className="bg-[#07111f] border border-white/5 rounded-xl p-4.5 overflow-x-auto space-y-3">
                  <h4 className="text-white text-xxs uppercase font-extrabold tracking-widest text-emerald-400">Recalculated Table Preview Sheet</h4>
                  <table className="w-full text-left text-[11px] min-w-[500px]">
                    <thead className="text-gray-500 uppercase tracking-header font-bold text-[9px]">
                      <tr className="border-b border-white/5">
                        <th className="py-2">Pos</th>
                        <th className="py-2">Team Name</th>
                        <th className="py-2">Played</th>
                        <th className="py-2">GF</th>
                        <th className="py-2">GA</th>
                        <th className="py-2">GD</th>
                        <th className="py-2">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-400">
                      {parsedPreviewRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01]">
                          <td className="py-2 text-white font-bold">{idx + 1}</td>
                          <td className="py-2"><strong className="text-white">{row.name}</strong></td>
                          <td className="py-2">{row.played}</td>
                          <td className="py-2">{row.gf}</td>
                          <td className="py-2">{row.ga}</td>
                          <td className="py-2">{row.gd}</td>
                          <td className="py-2 text-white font-bold">{row.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              Unauthorized access right restrictions. Main Site Administrator rights required to execute raw multi-upload parses.
            </div>
          )}
        </div>
      )}

      {/* --- TAB E: NEWSROOM --- */}
      {adminTab === "news" && (
        <div className="space-y-6">
          {isAdmin ? (
            <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-white text-sm font-extrabold flex items-center gap-1.5 border-b border-white/5 pb-3">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                {nId ? "Edit Published Article" : "Create New Press Release"}
              </h3>

              <form onSubmit={handleNewsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Article Title *</label>
                    <input
                      type="text"
                      required
                      value={nTitle}
                      onChange={(e) => setNTitle(e.target.value)}
                      placeholder="e.g. 🏆 MOSSL League Champions 2025/26!"
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Category Tag *</label>
                    <input
                      type="text"
                      required
                      value={nCategory}
                      onChange={(e) => setNCategory(e.target.value)}
                      placeholder="e.g. Champions"
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-3">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Main Paragraph P1 *</label>
                    <textarea
                      required
                      rows={3}
                      value={nP1}
                      onChange={(e) => setNP1(e.target.value)}
                      placeholder="Article body paragraph starts here..."
                      className="bg-[#07111f] border border-white/10 p-3 rounded-xl text-white text-xs outline-none resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-3">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Secondary Paragraph P2</label>
                    <textarea
                      rows={2}
                      value={nP2}
                      onChange={(e) => setNP2(e.target.value)}
                      placeholder="Secondary details paragraph starts here..."
                      className="bg-[#07111f] border border-white/10 p-3 rounded-xl text-white text-xs outline-none resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Display Image URL</label>
                    <input
                      type="text"
                      value={nImage}
                      onChange={(e) => setNImage(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/..."
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Publish Date</label>
                    <input
                      type="text"
                      value={nDate}
                      onChange={(e) => setNDate(e.target.value)}
                      placeholder="e.g. February 22, 2026"
                      className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  {nId && (
                    <button
                      type="button"
                      onClick={() => {
                        setNId(null); setNTitle(""); setNCategory("News"); setNP1(""); setNP2(""); setNImage(""); setNDate("");
                      }}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 px-4 py-2 rounded-xl text-xxs font-bold uppercase tracking-wider"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#10b981] hover:bg-emerald-400 text-white font-bold p-2.5 px-6 rounded-xl text-xxs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-4 h-4" />
                    Publish Article
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              Unauthorized access right restrictions. Main Site Administrator rights required to edit news.
            </div>
          )}

          {/* News articles log schedule list */}
          <div className="space-y-3">
            <h4 className="text-white text-xxs font-extrabold uppercase tracking-widest text-gray-500">News Articles Logs List</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
              {news.map((n) => (
                <div key={n.id} className="bg-[#0b1929] border border-white/5 p-3 rounded-xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <strong className="text-white text-xs font-bold block leading-tight truncate">
                      {n.title}
                    </strong>
                    <span className="text-gray-500 text-xxs block mt-0.5 font-sans leading-none">
                      {n.date} · <span className="text-blue-400 font-bold">{n.category}</span>
                    </span>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEditNewsClick(n)}
                          className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/10 px-2.5 py-1 rounded text-xxs font-bold uppercase tracking-wider transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteNews(n.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 p-1 px-2 rounded-lg text-xxs font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB F: MULTIMEDIA MEDIA MANAGER HUB --- */}
      {adminTab === "media" && (
        <div className="space-y-6">
          
          {/* Helpful Step-By-Step Instruction Box */}
          <div className="bg-gradient-to-r from-blue-900/10 via-[#0a1524] to-[#0b1929] border border-blue-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Sparkles className="w-24 h-24 text-blue-500" />
            </div>
            <h3 className="text-white text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              How do I add my custom images and videos?
            </h3>
            <p className="text-gray-300 text-xs mt-2 leading-relaxed max-w-4xl">
              You described having a physical folder of pictures and videos. To make them load fast and display correctly on your live website:
            </p>
            <ol className="list-decimal list-inside text-gray-400 text-xxs mt-3.5 space-y-2 max-w-3xl">
              <li>
                <strong className="text-white">Create folders inside the public/ directory:</strong> Create folders named <code className="text-amber-400 font-mono">public/gallery/</code> and <code className="text-amber-400 font-mono">public/videos/</code> or drag your entire folders in there using the file explorer on the left.
              </li>
              <li>
                <strong className="text-white">Copy or drag your files there:</strong> Place your images and video files. For example, drag <code className="text-gray-300 font-mono">match_champions.jpg</code> or <code className="text-gray-300 font-mono">goals_highlight.mp4</code>.
              </li>
              <li>
                <strong className="text-white">Register the path URL in the forms below:</strong> For files inside the <code className="text-gray-300 font-mono">public/</code> directory, use absolute relative paths: e.g., use <code className="text-indigo-400 font-mono">/gallery/match_champions.jpg</code> as the URL, or <code className="text-indigo-400 font-mono text-[9px]">/videos/goals_highlight.mp4</code>.
              </li>
              <li>
                <strong className="text-white">External URLs work too:</strong> You can also copy URLs directly from Google Drive, Unsplash, or video CDNs and paste them here to register.
              </li>
            </ol>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            
            {/* COLUMN 1: PICTURES / PHOTOS GALLERY PORTAL */}
            <div className="space-y-6">
              <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
                <h3 className="text-white text-sm font-extrabold flex items-center gap-1.5 border-b border-white/5 pb-3">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  {photoId ? "Edit Photo Entry" : "Register New Photo"}
                </h3>
  
                {isAdmin ? (
                  <form onSubmit={handlePhotoSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Photo Title / Caption *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Captain lifting the season championship shield"
                          value={photoTitle}
                          onChange={(e) => setPhotoTitle(e.target.value)}
                          className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 font-sans">
                        <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Image Source Path (or URL) *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. /gallery/my-image.jpg"
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 font-sans">
                        <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Display Category *</label>
                        <select
                          value={photoCategory}
                          onChange={(e) => setPhotoCategory(e.target.value)}
                          className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none cursor-pointer"
                        >
                          <option value="newseason">2026 Season Launch</option>
                          <option value="matchday">Matchday Action Grid</option>
                          <option value="champions">Celebrations Log</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      {photoId && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoId(null); setPhotoUrl(""); setPhotoTitle(""); setPhotoCategory("newseason");
                          }}
                          className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xxs font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-600/10"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {photoId ? "Update Photo" : "Add to Gallery"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 bg-red-500/5 text-red-400 border border-red-500/10 rounded-xl text-xxs">
                    Admin privileges required to register images.
                  </div>
                )}
              </div>

              {/* LIST OF PHOTOS WITH THUMBNAIL */}
              <div className="space-y-3">
                <h4 className="text-white text-xxs font-extrabold uppercase tracking-widest text-gray-500">Registered Pictures ({gallery.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {gallery.map((g) => (
                    <div key={g.id} className="bg-[#0b1929] border border-white/5 p-2 rounded-xl flex gap-3 items-center">
                      <img src={g.url} alt={g.title} className="w-14 h-14 rounded-lg object-cover border border-white/10 bg-[#07111f] flex-shrink-0" onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/100x100?text=Broken_Link";
                      }} />
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-black uppercase bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-400 tracking-wider">
                          {g.category === "newseason" ? "Season 2026" : g.category === "champions" ? "Celebration" : "Matchday"}
                        </span>
                        <strong className="text-white text-xs font-bold block truncate leading-snug mt-1" title={g.title}>
                          {g.title}
                        </strong>
                        <span className="text-gray-500 text-[9px] block font-mono truncate mt-0.5" title={g.url}>
                          {g.url}
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEditPhotoClick(g)}
                            className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/10 px-2 py-1 rounded text-[10px] font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteGalleryItem && onDeleteGalleryItem(g.id)}
                            className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/10 p-1 rounded flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 2: VIDEOS GALLERY PORTAL */}
            <div className="space-y-6">
              <div className="bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
                <h3 className="text-white text-sm font-extrabold flex items-center gap-1.5 border-b border-white/5 pb-3">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  {videoId ? "Edit Video Entry" : "Register New Video"}
                </h3>
  
                {isAdmin ? (
                  <form onSubmit={handleVideoSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Video Clip Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Tactical breakdown goals reel"
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Video Source Path (MP4) *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. /videos/goals-highlight.mp4"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-gray-400 text-xxs font-bold uppercase tracking-wider">Display Category *</label>
                        <select
                          value={videoCategory}
                          onChange={(e) => setVideoCategory(e.target.value)}
                          className="bg-[#07111f] border border-white/10 p-2.5 rounded-xl text-white text-xs outline-none cursor-pointer"
                        >
                          <option value="newseason">2026 Season Launch</option>
                          <option value="matchday">Matchday Action Grid</option>
                          <option value="champions">Celebrations Log</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      {videoId && (
                        <button
                          type="button"
                          onClick={() => {
                            setVideoId(null); setVideoUrl(""); setVideoTitle(""); setVideoCategory("newseason");
                          }}
                          className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xxs font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-600/10"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {videoId ? "Update Video" : "Add Video Playback"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 bg-red-500/5 text-red-400 border border-red-500/10 rounded-xl text-xxs">
                    Admin privileges required to register videos.
                  </div>
                )}
              </div>

              {/* LIST OF VIDEOS */}
              <div className="space-y-3">
                <h4 className="text-white text-xxs font-extrabold uppercase tracking-widest text-gray-500">Registered Video Reels ({videos.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {videos.map((v) => (
                    <div key={v.id} className="bg-[#0b1929] border border-white/5 p-2 rounded-xl flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-lg bg-[#07111f] border border-white/10 flex items-center justify-center flex-shrink-0 text-amber-500 relative">
                        ★
                        <span className="absolute text-[8px] font-sans font-extrabold uppercase bg-amber-500 text-[#07111f] px-1 rounded -bottom-1 text-center scale-90">PLAY</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-black uppercase bg-[#10b981]/10 px-1.5 py-0.5 rounded text-emerald-400 tracking-wider">
                          {v.category === "newseason" ? "Season 2026" : v.category === "champions" ? "Celebration" : "Matchday"}
                        </span>
                        <strong className="text-white text-xs font-bold block truncate leading-snug mt-1" title={v.title}>
                          {v.title}
                        </strong>
                        <span className="text-gray-500 text-[9px] block font-mono truncate mt-0.5" title={v.url}>
                          {v.url}
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEditVideoItemClick(v)}
                            className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/10 px-2 py-1 rounded text-[10px] font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteVideoItem && onDeleteVideoItem(v.id)}
                            className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/10 p-1 rounded flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
