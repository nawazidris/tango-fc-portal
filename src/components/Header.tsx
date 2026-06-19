import React, { useState } from "react";
import { User, LogOut, LogIn, Menu, X, ShieldCheck } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userToken: string | null;
  userRole: string | null;
  onLogout: () => void;
  onLoginSuccess: (token: string, role: string) => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  userToken,
  userRole,
  onLogout,
  onLoginSuccess,
  isLoginOpen,
  setIsLoginOpen,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Removed local login submit handler (now in App.tsx)

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
        <div className="absolute top-full left-0 right-0 bg-[#0b1929] border-b border-white/10 p-5 z-40 lg:hidden flex flex-col gap-2.5 shadow-xl animate-fadeIn">
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

    </header>
  );
}
