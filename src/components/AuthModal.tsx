import React, { useState } from 'react';
import { User, ViewMode } from '../types';
import { StorageService } from '../services/storage';
import { soundEffects } from '../utils/audio';
import { X, Lock, Mail, User as UserIcon, GraduationCap, Sparkles, Check, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserChanged: (user: User) => void;
  onRedirectToPlanner: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  onRedirectToPlanner,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentYear, setStudentYear] = useState('Year 3 Computer Science');
  const [regNumber, setRegNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  if (!isOpen) return null;

  const users = StorageService.getUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      soundEffects.playComplete();
      StorageService.setCurrentUser(found);
      onUserChanged(found);
      setSuccessToast(`Welcome back, ${found.name}! Redirecting to Planner...`);
      setTimeout(() => {
        onClose();
        onRedirectToPlanner();
      }, 700);
    } else {
      // Allow flexible demo login: create or log in as that user
      soundEffects.playComplete();
      const registered = StorageService.registerUser(
        email.split('@')[0],
        email,
        'Year 3 Computer Science'
      );
      onUserChanged(registered);
      setSuccessToast(`Logged in as ${registered.name}! Redirecting to Planner...`);
      setTimeout(() => {
        onClose();
        onRedirectToPlanner();
      }, 700);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in name, email, and password');
      return;
    }

    soundEffects.playLevelUp();
    const newUser = StorageService.registerUser(
      name,
      email,
      studentYear || 'Year 1 Computer Science',
      regNumber
    );

    onUserChanged(newUser);
    setSuccessToast(`Account created for ${newUser.name}! Opening Planner...`);
    setTimeout(() => {
      onClose();
      onRedirectToPlanner();
    }, 700);
  };

  const handleQuickSwitch = (user: User) => {
    soundEffects.playClick();
    StorageService.setCurrentUser(user);
    onUserChanged(user);
    setSuccessToast(`Switched profile to ${user.name}`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#16213e] border border-purple-800/60 rounded-2xl p-6 sm:p-8 shadow-2xl glow-card text-white">
        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-[#e94560] to-[#f5a623] p-0.5 glow-pink mb-3">
            <div className="w-full h-full bg-[#16213e] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h2 className="font-comic text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#e94560] via-[#f5a623] to-[#e94560]">
            STUDENT PORTAL
          </h2>
          <p className="text-xs text-purple-200/80 mt-1">
            Access your private study schedule and progress matrix
          </p>
        </div>

        {/* Toast */}
        {successToast && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Tab switchers */}
        <div className="flex bg-[#0f0f1a] p-1 rounded-xl mb-6 border border-purple-900/40">
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setTab('login');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-[#e94560] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            LOGIN
          </button>
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setTab('register');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-[#e94560] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Forms */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="danmoses2541@gmail.com"
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white font-bold text-sm tracking-wider uppercase glow-pink glow-pink-hover transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>Login to Study Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dan Moses"
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1">
                  Year / Major
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400" />
                  <input
                    type="text"
                    value={studentYear}
                    onChange={(e) => setStudentYear(e.target.value)}
                    placeholder="Year 3 CS"
                    className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl pl-8 pr-2 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1">
                  Reg / Student ID
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="CS/2023/8842"
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white font-bold text-sm tracking-wider uppercase glow-pink glow-pink-hover transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>Create Student Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-purple-900/40">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300/70 mb-2.5 text-center">
            Or Jump In With Demo Profiles
          </div>
          <div className="space-y-2">
            {users.slice(0, 2).map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickSwitch(user)}
                className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  currentUser.id === user.id
                    ? 'border-amber-400/80 bg-amber-500/10'
                    : 'border-purple-900/40 bg-[#0f0f1a]/60 hover:border-purple-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-900/50 p-0.5">
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.avatarSeed}&backgroundColor=16213e`}
                      alt={user.name}
                      className="w-full h-full rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{user.name}</div>
                    <div className="text-[10px] text-purple-300/70">{user.email} · {user.studentYear}</div>
                  </div>
                </div>
                {currentUser.id === user.id ? (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] text-purple-400 underline">Switch</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
