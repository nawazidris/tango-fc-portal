import React, { useState, useEffect } from "react";
import { DatabaseState, Player, Match, Team, NewsArticle } from "./types";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Dashboard from "./components/Dashboard";
import RosterView from "./components/RosterView";
import MatchesView from "./components/MatchesView";
import StandingsView from "./components/StandingsView";
import StatsDashboard from "./components/StatsDashboard";
import TechnicalTeamView from "./components/TechnicalTeamView";
import MediaRoom from "./components/MediaRoom";
import ClubHistoryView from "./components/ClubHistoryView";
import AdminDashboard from "./components/AdminDashboard";
import { ShieldCheck, CalendarRange, Trophy, Users, HelpCircle, Facebook, Instagram, Twitter, User, LogIn, X } from "lucide-react";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("home");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Authentication State
  const [userToken, setUserToken] = useState<string | null>(() => localStorage.getItem("user-token"));
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem("user-role"));

  // Login Modal State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Application Data State
  const [data, setData] = useState<DatabaseState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch all Football parameters on mount
  const fetchFootballData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/football-data");
      if (!response.ok) {
        throw new Error("Failed to retrieve football datastore parameters.");
      }
      const json: DatabaseState = await response.json();
      setData(json);
    } catch (err: any) {
      console.error("Error fetching football data:", err);
      setErrorMsg("Unable to synchronize with server parameters. Please verify dev runtime is active.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFootballData();
  }, []);

  // Secure Auth State Handlers
  const handleLoginSuccess = (token: string, role: string) => {
    localStorage.setItem("user-token", token);
    localStorage.setItem("user-role", role);
    setUserToken(token);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("user-token");
    localStorage.removeItem("user-role");
    setUserToken(null);
    setUserRole(null);
    setActiveTab("home");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoginLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      handleLoginSuccess(data.token, data.role);
      setIsLoginOpen(false);
      setUsername("");
      setPassword("");
      setActiveTab("admin");
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Direct backend API calls with authentication token verification
  const handleSavePlayer = async (player: any) => {
    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken, player })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to save player.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while saving the player.");
    }
  };

  const handleDeletePlayer = async (id: number) => {
    if (!confirm("Are you sure you want to permanently discharge this player from the official roster?")) return;
    try {
      const response = await fetch(`/api/players/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to remove player.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while discharging the player.");
    }
  };

  const handleSaveMatch = async (match: any) => {
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken, match })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to update match.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while updating the match details.");
    }
  };

  const handleDeleteMatch = async (id: number) => {
    if (!confirm("Are you sure you want to permanently wipe this match fixture from the league archives?")) return;
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to remove match fixture.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while clearing the match fixture.");
    }
  };

  const handleUploadStandings = async (teams: any[]) => {
    try {
      const response = await fetch("/api/standings/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken, teams })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to replace standings sheet.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred during standings replacement.");
    }
  };

  const handleSaveNews = async (article: any) => {
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken, article })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to post article.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while updating the news article.");
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm("Wipe this release entry from general viewing?")) return;
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to discard news article.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while discarding the article.");
    }
  };

  const handleSaveGalleryItem = async (item: any) => {
    try {
      const response = await fetch("/api/media/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken, item })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to save gallery item.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while saving the gallery item.");
    }
  };

  const handleDeleteGalleryItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const response = await fetch(`/api/media/gallery/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to remove gallery item.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while removing the gallery item.");
    }
  };

  const handleSaveVideoItem = async (video: any) => {
    try {
      const response = await fetch("/api/media/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken, video })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to save video.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while saving the video.");
    }
  };

  const handleDeleteVideoItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      const response = await fetch(`/api/media/videos/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to remove video.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while removing the video.");
    }
  };

  const handlePlayerVote = async (playerId: number) => {
    try {
      const response = await fetch("/api/fan-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId })
      });
      if (!response.ok) {
        throw new Error("Unable to log vote.");
      }
      const res = await response.json();
      if (res.success && data) {
        setData({
          ...data,
          playerMonthlyVotes: {
            ...data.playerMonthlyVotes,
            [playerId]: res.votes
          }
        });
      }
    } catch (err: any) {
      console.error("Voter error:", err);
    }
  };

  const handleSavePoll = async (poll: any) => {
    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken, poll })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to save poll.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while saving the poll.");
    }
  };

  const handleDeletePoll = async (id: number) => {
    if (!confirm("Are you sure you want to delete this poll?")) return;
    try {
      const response = await fetch(`/api/polls/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to remove poll.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while removing the poll.");
    }
  };

  const handleVotePoll = async (pollId: number, optionId: string) => {
    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId })
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to cast vote.");
      }
      await fetchFootballData();
    } catch (err: any) {
      alert(err.message || "An error occurred while registering your vote.");
    }
  };

  // Find Tango FC rank & point ratios
  const getTangoStandingsData = () => {
    if (!data || !data.teams) return { position: 4, points: 24 }; // fallback defaults
    const sorted = [...data.teams].sort((a, b) => b.stats[7] - a.stats[7]);
    const idx = sorted.findIndex((t) => t.name.toLowerCase().includes("tango"));
    if (idx === -1) return { position: 4, points: 24 };
    return {
      position: idx + 1,
      points: sorted[idx].stats[7]
    };
  };

  const tfcMetrics = getTangoStandingsData();

  // Active view router dispatcher
  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 space-y-4" id="loading-spinner">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium">Synchronizing elite club databases...</p>
        </div>
      );
    }

    if (errorMsg || !data) {
      return (
        <div className="max-w-md mx-auto my-12 bg-red-950/20 border border-red-500/20 rounded-2xl p-6 text-center shadow-lg" id="error-screen">
          <h3 className="text-red-400 font-extrabold text-md uppercase">Database Offline</h3>
          <p className="text-gray-400 text-xs mt-2 leading-relaxed">{errorMsg || "Database configuration is empty."}</p>
          <button
            onClick={fetchFootballData}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white text-xxs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-colors"
          >
            Retry Connection Sync
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <Dashboard
            matches={data.matches}
            players={data.players}
            teams={data.teams}
            news={data.news}
            polls={data.polls || []}
            setActiveTab={setActiveTab}
            onSelectPlayer={(p) => {
              setSelectedPlayer(p);
              setActiveTab("roster");
            }}
            userToken={userToken}
            onVotePoll={handleVotePoll}
            onSavePoll={handleSavePoll}
            onDeletePoll={handleDeletePoll}
          />
        );
      case "roster":
        return (
          <RosterView
            players={data.players}
            playerVotes={data.playerMonthlyVotes || {}}
            onVote={handlePlayerVote}
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
          />
        );
      case "matches":
        return (
          <MatchesView
            matches={data.matches}
            players={data.players}
            playerVotes={data.playerMonthlyVotes || {}}
            onVote={handlePlayerVote}
          />
        );
      case "standings":
        return <StandingsView teams={data.teams} matches={data.matches} />;
      case "stats":
        return (
          <StatsDashboard
            players={data.players}
            teams={data.teams}
            matches={data.matches}
            onSelectPlayer={(p) => {
              setSelectedPlayer(p);
              setActiveTab("roster");
            }}
          />
        );
      case "technical":
        return <TechnicalTeamView technicalTeam={data.technicalTeam} />;
      case "media":
        return <MediaRoom gallery={data.gallery} videos={data.videos} />;
      case "history":
        return <ClubHistoryView history={data.history} />;
      case "admin":
        if (!userToken) {
          return (
            <div className="max-w-md mx-auto my-12 bg-[#0b1929] border border-white/10 rounded-2xl p-6 text-center shadow-2xl animate-scaleUp" id="unauthorized-access">
              <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-white text-md font-bold">Portal Access Locked</h3>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed mb-4">
                Authorized credentials are required to modify rosters, scores, or bulletins. Please use any of the standard logins in the Sign-In menu.
              </p>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Sign In Now
              </button>
            </div>
          );
        }
        return (
          <AdminDashboard
            token={userToken}
            role={userRole || "Logistics"}
            players={data.players}
            matches={data.matches}
            teams={data.teams}
            news={data.news}
            gallery={data.gallery || []}
            videos={data.videos || []}
            onSavePlayer={handleSavePlayer}
            onDeletePlayer={handleDeletePlayer}
            onSaveMatch={handleSaveMatch}
            onDeleteMatch={handleDeleteMatch}
            onUploadStandings={handleUploadStandings}
            onSaveNews={handleSaveNews}
            onDeleteNews={handleDeleteNews}
            onSaveGalleryItem={handleSaveGalleryItem}
            onDeleteGalleryItem={handleDeleteGalleryItem}
            onSaveVideoItem={handleSaveVideoItem}
            onDeleteVideoItem={handleDeleteVideoItem}
            onReload={fetchFootballData}
          />
        );
      default:
        return (
          <div className="text-center py-20 text-gray-500">
            <HelpCircle className="w-10 h-10 mx-auto opacity-30 mb-2" />
            <p className="text-sm font-semibold">Under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070e17] text-gray-100 flex flex-col justify-between selection:bg-blue-600/30 selection:text-blue-200 font-sans leading-normal antialiased" id="app-root">
      
      {/* 1. Header Toolbar navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userToken={userToken}
        userRole={userRole}
        onLogout={handleLogout}
        onLoginSuccess={handleLoginSuccess}
        isLoginOpen={isLoginOpen}
        setIsLoginOpen={setIsLoginOpen}
      />

      {/* 2. Hero Widget (rendered exclusively on landing dashboard page) */}
      {activeTab === "home" && !isLoading && data && (
        <Hero
          tangoRank={tfcMetrics.position}
          tangoPoints={tfcMetrics.points}
          onViewRoster={() => setActiveTab("roster")}
          onViewMatches={() => setActiveTab("matches")}
        />
      )}

      {/* 3. Main Views center content area */}
      <main className="flex-grow">
        {renderView()}
      </main>

      {/* 4. Elegant custom-tailored humble footer with clean labels */}
      <footer className="border-t border-white/5 bg-[#050b11] py-8 text-center" id="brand-footer">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h5 className="text-white font-extrabold text-sm tracking-tight">Tango Football Club</h5>
            <p className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-wider font-semibold">Mashonaland Central Division 2 Soccer League</p>
          </div>

          {/* Social Media Engagement Hub */}
          <div className="flex items-center gap-3 my-2 md:my-0">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 border border-white/5 hover:border-[#1877F2]/30 hover:bg-[#1877F2]/10 hover:text-[#1877F2] text-gray-400 transition-all duration-200"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 border border-white/5 hover:border-[#E4405F]/30 hover:bg-[#E4405F]/10 hover:text-[#E4405F] text-gray-400 transition-all duration-200"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 border border-white/5 hover:border-white/25 hover:bg-white/5 hover:text-white text-gray-400 transition-all duration-200"
              aria-label="X (formerly Twitter)"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
          
          <p className="text-gray-500 text-[10px] md:text-xxs text-center md:text-right font-medium max-w-sm">
            &copy; 2026 Tango FC. Dedicated to Sportsmanship, Character and Masvingo Community Pride.
          </p>
        </div>
      </footer>

      {/* Secure Sign In Modal Overlays */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-[92%] xs:w-full max-w-sm bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-2xl animate-scaleUp">
            <button
              onClick={() => {
                setIsLoginOpen(false);
                setLoginError("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold mx-auto mb-2 shadow-md shadow-blue-500/5">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-white text-base font-bold">Admin Portal Login</h3>
              <p className="text-gray-400 text-xxs mt-0.5">Authorized technical staff & administrators only</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full bg-[#07111f] border border-white/10 focus:border-blue-500 p-2.5 rounded-xl text-white text-xs outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xxs font-bold uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#07111f] border border-white/10 focus:border-blue-500 p-2.5 rounded-xl text-white text-xs outline-none transition-colors"
                />
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-red-400 text-xxs font-semibold leading-relaxed">
                  {loginError}
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginOpen(false);
                    setLoginError("");
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all duration-200 active:scale-98 border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all duration-200 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isLoginLoading ? "Validating..." : "Sign In"}
                </button>
              </div>
            </form>

            <div className="mt-4 border-t border-white/5 pt-3.5 text-center">
              <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1.5 leading-none">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                Auth controls secured with Role-Based Access Toggles
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
