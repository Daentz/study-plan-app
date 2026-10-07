import React from 'react';
import { StudyPlan, User, ViewMode } from '../types';
import { soundEffects } from '../utils/audio';
import { ArrowRight, BookOpen, Calendar, CheckCircle2, Flame, Sparkles } from 'lucide-react';

interface WelcomeViewProps {
  currentUser: User;
  plans: StudyPlan[];
  onNavigate: (view: ViewMode) => void;
  onOpenAuth: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  currentUser,
  plans,
  onNavigate,
  onOpenAuth,
}) => {
  const completedCount = plans.filter((p) => p.done).length;
  const totalCount = plans.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Dicebear avatar icons for the decorative orbit ring
  const orbitAvatars = [
    { seed: 'ninja_ace', name: 'Algos', color: 'border-pink-500 shadow-[0_0_12px_#e94560]' },
    { seed: 'cyber_bot', name: 'Compilers', color: 'border-cyan-400 shadow-[0_0_12px_#06b6d4]' },
    { seed: 'math_wizard', name: 'Proofs', color: 'border-amber-400 shadow-[0_0_12px_#f5a623]' },
    { seed: 'quantum_neko', name: 'Physics', color: 'border-purple-400 shadow-[0_0_12px_#7c3aed]' },
    { seed: 'zen_master', name: 'Architecture', color: 'border-emerald-400 shadow-[0_0_12px_#10b981]' },
    { seed: 'speed_runner', name: 'LeetCode', color: 'border-rose-400 shadow-[0_0_12px_#f43f5e]' },
  ];

  const handleEnterDashboard = () => {
    soundEffects.playClick();
    onNavigate('home');
  };

  const handleGoToPlanner = () => {
    soundEffects.playClick();
    onNavigate('planner');
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Blurred glowing background orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[110px] pointer-events-none animate-pulse-orb" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#e94560]/20 rounded-full blur-[120px] pointer-events-none animate-pulse-orb" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-[#f5a623]/15 rounded-full blur-[90px] pointer-events-none animate-pulse-orb" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Ring of Anime Avatar Icons */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 mb-6 flex items-center justify-center">
          {/* Outer pulsed ring border */}
          <div className="absolute inset-0 rounded-full border border-purple-500/20 border-dashed animate-spin" style={{ animationDuration: '40s' }} />
          <div className="absolute inset-4 rounded-full border border-[#e94560]/30 shadow-[0_0_25px_rgba(233,69,96,0.25)]" />

          {/* Central Hero Avatar */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-tr from-[#e94560] via-[#f5a623] to-[#7c3aed] glow-pink z-10 animate-float">
            <div className="w-full h-full rounded-full bg-[#16213e] p-1 overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.avatarSeed}&backgroundColor=16213e`}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Student badge pip */}
            <div className="absolute -bottom-1 -right-1 bg-[#16213e] rounded-full p-1 border border-amber-400">
              <span className="text-sm">⚡</span>
            </div>
          </div>

          {/* Orbiting Avatar Icons */}
          {orbitAvatars.map((item, idx) => {
            const angle = (idx / orbitAvatars.length) * 2 * Math.PI;
            const radius = typeof window !== 'undefined' && window.innerWidth < 640 ? 80 : 105;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={item.seed}
                className="absolute w-9 h-9 sm:w-11 sm:h-11 rounded-full p-0.5 bg-[#16213e] border-2 transition-transform hover:scale-125 z-20 group cursor-pointer"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  borderColor: item.color.includes('pink')
                    ? '#e94560'
                    : item.color.includes('cyan')
                    ? '#06b6d4'
                    : item.color.includes('amber')
                    ? '#f5a623'
                    : item.color.includes('purple')
                    ? '#7c3aed'
                    : item.color.includes('emerald')
                    ? '#10b981'
                    : '#f43f5e',
                }}
                title={item.name}
              >
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${item.seed}&backgroundColor=16213e`}
                  alt={item.name}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold text-white bg-black/80 px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Badge with Owner Name & Year */}
        <button
          onClick={onOpenAuth}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16213e] border border-purple-500/40 text-purple-200 text-xs sm:text-sm font-bold tracking-wide hover:border-[#f5a623] hover:text-[#f5a623] transition-all cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.3)] mb-4"
        >
          <span className="w-2 h-2 rounded-full bg-[#e94560] animate-pulse" />
          <span>{currentUser.name}</span>
          <span className="text-purple-400">·</span>
          <span>{currentUser.studentYear}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </button>

        {/* Big "Study Plan" Title */}
        <h1 className="font-comic text-6xl sm:text-7xl md:text-8xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#e94560] via-[#f5a623] to-[#e94560] text-glow-pink drop-shadow-lg leading-tight mb-2">
          STUDY PLAN
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-purple-200/90 font-medium max-w-xl mb-6">
          Level up your Computer Science curriculum with battle-tested timetables, subject quests, and real-time progress tracking.
        </p>

        {/* Motivational Quote Card */}
        <div className="relative max-w-lg mx-auto bg-[#16213e]/80 border border-purple-800/40 rounded-2xl p-4 sm:p-5 mb-8 shadow-xl backdrop-blur-sm">
          <div className="flex items-start gap-3 text-left">
            <span className="text-2xl text-amber-400 select-none">“</span>
            <div>
              <p className="text-slate-200 text-sm sm:text-base italic font-serif leading-relaxed">
                The only way to truly master the machine is to cultivate the discipline within. Master the algorithms today, architect the future tomorrow.
              </p>
              <div className="mt-2 text-xs font-semibold text-purple-400">
                — CS Study Squad Protocol · Codex Vol. 1
              </div>
            </div>
            <span className="text-2xl text-amber-400 select-none self-end">”</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-10">
          <button
            onClick={handleEnterDashboard}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white font-bold text-base sm:text-lg glow-pink glow-pink-hover transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg"
          >
            <span>Enter Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleGoToPlanner}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#16213e] border border-purple-500/50 text-white font-bold text-base sm:text-lg hover:border-[#f5a623] hover:text-[#f5a623] glow-purple transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg"
          >
            <BookOpen className="w-5 h-5 text-[#f5a623]" />
            <span>Go to Planner</span>
          </button>
        </div>

        {/* Quick Quest Progress Snapshot */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-lg">
          <div className="bg-[#16213e]/70 border border-purple-900/40 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[#f5a623] text-xs font-bold mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>TOTAL PLANS</span>
            </div>
            <div className="font-comic text-2xl sm:text-3xl text-white tabular-nums">
              {totalCount}
            </div>
          </div>

          <div className="bg-[#16213e]/70 border border-purple-900/40 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[#e94560] text-xs font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>COMPLETED</span>
            </div>
            <div className="font-comic text-2xl sm:text-3xl text-emerald-400 tabular-nums">
              {completedCount}
            </div>
          </div>

          <div className="bg-[#16213e]/70 border border-purple-900/40 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-purple-400 text-xs font-bold mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>PROGRESS</span>
            </div>
            <div className="font-comic text-2xl sm:text-3xl text-[#f5a623] tabular-nums">
              {progressPercent}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
