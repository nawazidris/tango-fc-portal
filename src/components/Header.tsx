import React, { useState } from "react";
import { User, LogOut, LogIn, Menu, X, ShieldCheck } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userToken: string | null;
  userRole: string | null;
  onLogout: () => void;
  onLoginSuccess: (token: string, role: string) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  userToken,
  userRole,
  onLogout,
  onLoginSuccess,
}: HeaderProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: "home", label: "Home" },
    { id: "roster", label: "Roster" },
    { id: "matches", label: "Matches" },
    { id: "standings", label: "Standings" },
    { id: "stats", label: "Stats" },
    { id: "technical", label: "Technical Staff" },
    { id: "media", label: "Media Room" },
    { id: "history", label: "Club History" },
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

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

      onLoginSuccess(data.token, data.role);
      setIsLoginOpen(false);
      setUsername("");
      setPassword("");
      // Redirect to admin tab if logged in successfully
      setActiveTab("admin");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#07111f]/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between">
      {/* Brand Crew */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
        <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border-2 border-blue-500 shadow-md shadow-blue-500/20 overflow-hidden bg-[#07111f]">
          <img 
            src="/images/tangoforces.jpg" 
            alt="Tango FC Logo" 
            className="w-full h-full object-cover" 
            onError={(e) => {
              // Gracefully fallback to text initials if image is not yet uploaded
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector('.fallback-initials')) {
                const span = document.createElement('span');
                span.className = 'fallback-initials text-white font-extrabold text-base tracking-widest pl-0.5 z-10';
                span.innerText = 'TFC';
                parent.appendChild(span);
              }
            }}
          />
        </div>
        <div>
          <h1 className="text-white font-black text-lg tracking-tight leading-tight">Tango FC</h1>
          <p className="text-blue-400 text-xxs font-semibold uppercase tracking-wider">The Forces</p>
        </div>
      </div>

      {/* Desktop Navigation Link Toggles */}
      <nav className="hidden lg:flex items-center gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
        {userToken && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              activeTab === "admin"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                : "text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Portal
          </button>
        )}
      </nav>

      {/* Auth Control Center */}
      <div className="flex items-center gap-3">
        {userToken ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-xs font-medium text-gray-300">
              {userRole}
            </span>
            <button
              onClick={onLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsLoginOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            Portal Sign In
          </button>
        )}

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-gray-300 hover:text-white p-1"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#0b1929] border-b border-white/10 p-5 z-40 lg:hidden flex flex-col gap-2.5 shadow-xl animate-fadeIn">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {userToken && (
            <button
              onClick={() => {
                setActiveTab("admin");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-150 ${
                activeTab === "admin"
                  ? "bg-amber-600 text-white"
                  : "text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin panel
            </button>
          )}
        </div>
      )}

      {/* Secure Sign In Modal Overlays */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-[92%] xs:w-full max-w-sm bg-[#0b1929] border border-white/10 rounded-2xl p-5 shadow-2xl animate-scaleUp">
            <button
              onClick={() => {
                setIsLoginOpen(false);
                setErrorMsg("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
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

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-red-400 text-xxs font-semibold leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginOpen(false);
                    setErrorMsg("");
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all duration-200 active:scale-98 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all duration-200 active:scale-98 disabled:opacity-50"
                >
                  {isLoading ? "Validating..." : "Sign In"}
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
    </header>
  );
}
