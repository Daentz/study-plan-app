import React, { useState } from 'react';
import { User, ViewMode } from '../types';
import { soundEffects } from '../utils/audio';
import { Volume2, VolumeX, User as UserIcon, Menu, X, Sparkles, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode, sectionId?: string) => void;
  currentUser: User;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.enabled);

  const toggleSound = () => {
    soundEffects.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      soundEffects.playClick();
    }
  };

  const handleNavClick = (view: ViewMode, sectionId?: string) => {
    soundEffects.playClick();
    onNavigate(view, sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-md border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <button
          onClick={() => handleNavClick('welcome')}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e94560] to-[#f5a623] p-0.5 glow-pink transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#16213e] rounded-[10px] flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
          </div>
          <div>
            <div className="font-comic text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#e94560] via-[#f5a623] to-[#e94560]">
              STUDY PLAN
            </div>
            <div className="text-[10px] tracking-widest uppercase text-purple-300/70 font-semibold -mt-1">
              CS Gamer Edition
            </div>
          </div>
        </button>

        {/* Clean Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => handleNavClick('welcome')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'welcome'
                ? 'text-[#f5a623] bg-purple-950/60 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Welcome
          </button>
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'home'
                ? 'text-[#e94560] bg-purple-950/60 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('planner')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'planner'
                ? 'text-[#e94560] bg-purple-950/60 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Planner
          </button>
          <button
            onClick={() => handleNavClick('ai-sensei')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'ai-sensei'
                ? 'text-amber-400 bg-amber-500/20 border border-amber-400/40 shadow-[0_0_12px_rgba(245,166,35,0.3)]'
                : 'text-amber-300 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Sensei</span>
          </button>
          <button
            onClick={() => handleNavClick('ai-search')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'ai-search'
                ? 'text-cyan-400 bg-cyan-500/20 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-cyan-300 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <span className="text-xs">🌐</span>
            <span>Live Search</span>
          </button>
          <button
            onClick={() => handleNavClick('home', 'schedule')}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            Schedule
          </button>
          <button
            onClick={() => handleNavClick('home', 'subjects')}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            Subjects
          </button>
          <button
            onClick={() => handleNavClick('home', 'progress')}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            Progress
          </button>
          <button
            onClick={() => handleNavClick('home', 'contact')}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            className="p-2 rounded-lg bg-[#16213e] border border-purple-900/40 text-slate-300 hover:text-amber-400 hover:border-amber-400/50 transition-all cursor-pointer"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* User profile capsule */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenAuth();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#16213e] border border-purple-900/50 hover:border-[#e94560]/60 transition-all cursor-pointer group text-left"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-[#e94560] p-0.5 flex-shrink-0">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.avatarSeed}&backgroundColor=16213e`}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white group-hover:text-[#f5a623] transition-colors leading-tight truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-purple-300/70 truncate max-w-[120px]">
                {currentUser.studentYear}
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
          </button>

          {/* Logout / Switch user button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onLogout();
            }}
            title="Log Out or Switch Account"
            className="p-2 rounded-lg bg-[#16213e] border border-purple-900/40 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all cursor-pointer hidden sm:block"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#16213e] border border-purple-900/40 text-slate-200 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#16213e]/98 border-b border-purple-900/40 px-4 py-4 space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
            <div className="text-xs text-purple-200 font-semibold">
              Signed in as <span className="text-[#f5a623]">{currentUser.name}</span> ({currentUser.studentYear})
            </div>
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-[#e94560] underline font-bold"
            >
              Switch Account
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleNavClick('welcome')}
              className="px-3 py-2 rounded-lg text-left text-sm font-semibold text-slate-200 hover:bg-purple-900/40"
            >
              ✨ Welcome
            </button>
            <button
              onClick={() => handleNavClick('home')}
              className="px-3 py-2 rounded-lg text-left text-sm font-semibold text-slate-200 hover:bg-purple-900/40"
            >
              🏠 Home Dashboard
            </button>
            <button
              onClick={() => handleNavClick('planner')}
              className="px-3 py-2 rounded-lg text-left text-sm font-semibold text-[#e94560] font-bold hover:bg-purple-900/40"
            >
              📝 Planner
            </button>
            <button
              onClick={() => handleNavClick('ai-sensei')}
              className="px-3 py-2 rounded-lg text-left text-sm font-semibold text-[#f5a623] font-bold hover:bg-purple-900/40 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Sensei Chat</span>
            </button>
            <button
              onClick={() => handleNavClick('ai-search')}
              className="px-3 py-2 rounded-lg text-left text-sm font-semibold text-cyan-400 font-bold hover:bg-purple-900/40 flex items-center gap-1.5"
            >
              <span>🌐</span>
              <span>Live Search</span>
            </button>
            <button
              onClick={() => handleNavClick('home', 'schedule')}
              className="px-3 py-2 rounded-lg text-left text-sm font-semibold text-slate-200 hover:bg-purple-900/40"
            >
              📅 Schedule
            </button>
            <button
              onClick={() => handleNavClick('home', 'subjects')}
              className="px-3 py-2 rounded-lg text-left text-sm font-semibold text-slate-200 hover:bg-purple-900/40"
            >
              📚 Subjects
            </button>
            <button
              onClick={() => handleNavClick('home', 'progress')}
              className="px-3 py-2 rounded-lg text-left text-sm font-semibold text-slate-200 hover:bg-purple-900/40"
            >
              🎯 Progress
            </button>
            <button
              onClick={() => handleNavClick('home', 'contact')}
              className="px-3 py-2 rounded-lg text-left text-sm font-semibold text-slate-200 hover:bg-purple-900/40"
            >
              ✉️ Contact
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
