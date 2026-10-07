import React, { useState } from 'react';
import { CategoryType, StudyPlan, User, ViewMode } from '../types';
import { CATEGORIES, MENTOR_AVATARS } from '../data/initialData';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Send,
  PlusCircle,
  Layers,
  ChevronDown,
  Check,
  AlertCircle
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface DashboardViewProps {
  currentUser: User;
  plans: StudyPlan[];
  onTogglePlanDone: (planId: string) => void;
  onNavigate: (view: ViewMode) => void;
  onQuickAddCategory?: (category: CategoryType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  plans,
  onTogglePlanDone,
  onNavigate,
  onQuickAddCategory,
}) => {
  // Active mentor hover state
  const [activeMentor, setActiveMentor] = useState<string | null>(null);

  // Timetable filter
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'tomorrow' | 'upcoming'>('all');

  // Progress filter
  const [progressFilter, setProgressFilter] = useState<'all' | 'pending' | 'done'>('all');

  // Contact form state
  const [contactName, setContactName] = useState(currentUser.name);
  const [contactEmail, setContactEmail] = useState(currentUser.email);
  const [contactPhone, setContactPhone] = useState('+1 (555) 234-5678');
  const [contactRegNumber, setContactRegNumber] = useState(currentUser.registrationNumber || ' ');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Calculate dates
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  // Group plans by date
  const filteredPlansForTimetable = plans.filter((plan) => {
    if (timeFilter === 'today') return plan.date === todayStr;
    if (timeFilter === 'tomorrow') return plan.date === tomorrowStr;
    if (timeFilter === 'upcoming') return plan.date >= todayStr;
    return true;
  });

  // Grouping object
  const groupedByDay: { [date: string]: StudyPlan[] } = {};
  filteredPlansForTimetable
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)))
    .forEach((plan) => {
      if (!groupedByDay[plan.date]) {
        groupedByDay[plan.date] = [];
      }
      groupedByDay[plan.date].push(plan);
    });

  // Progress calculation
  const totalCount = plans.length;
  const completedCount = plans.filter((p) => p.done).length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Checklist items
  const checklistPlans = plans.filter((p) => {
    if (progressFilter === 'pending') return !p.done;
    if (progressFilter === 'done') return p.done;
    return true;
  });

  const handleToggle = (id: string, wasDone: boolean) => {
    onTogglePlanDone(id);
    if (!wasDone) {
      soundEffects.playComplete();
      // If this was the last remaining one or milestones, launch confetti
      if (completedCount + 1 === totalCount && totalCount > 0) {
        soundEffects.playLevelUp();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } else {
      soundEffects.playClick();
    }
  };

  const scrollToSection = (id: string) => {
    soundEffects.playClick();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playLevelUp();
    StorageService.saveContactMessage({
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      registrationNumber: contactRegNumber,
      message: contactMessage,
    });
    setContactSubmitted(true);
  };

  const getWorkloadLevel = (count: number) => {
    if (count <= 1) return { label: 'Light', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40' };
    if (count <= 3) return { label: 'Active', color: 'text-amber-400 bg-amber-500/15 border-amber-500/40' };
    return { label: 'Busy', color: 'text-[#e94560] bg-rose-500/15 border-rose-500/40' };
  };

  const formatFriendlyDate = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative text-slate-100 pb-20">
      {/* Background orbs */}
      <div className="fixed top-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-[#e94560]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ========================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================= */}
      <section className="relative px-4 pt-12 pb-16 sm:pb-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          {/* Student Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16213e] border border-purple-500/40 text-purple-200 text-xs font-bold tracking-wide mb-4 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SESSION ACTIVE</span>
            <span className="text-purple-400">·</span>
            <span className="text-[#f5a623]">{currentUser.name}</span>
            <span className="text-purple-400">·</span>
            <span>{currentUser.studentYear}</span>
          </div>

          <h1 className="font-comic text-5xl sm:text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-[#e94560] via-[#f5a623] to-[#e94560] leading-tight mb-4 drop-shadow-md">
            MASTER YOUR CURRICULUM
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto mb-8">
            Your battle-tested study command center. Review scheduled sessions, audit subject workload distributions, and clear your milestones with gamer discipline.
          </p>

          {/* Two Scroll-to Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <button
              onClick={() => scrollToSection('schedule')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white font-bold text-sm sm:text-base glow-pink glow-pink-hover transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              <span>View My Schedule</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection('progress')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#16213e] border border-purple-500/50 text-white font-bold text-sm sm:text-base hover:border-amber-400 hover:text-amber-400 glow-purple transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Track Progress</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Mentors Avatar Strip */}
          <div className="bg-[#16213e]/80 border border-purple-800/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold uppercase tracking-widest text-purple-300/80 mb-3 text-center">
              CS Squad Mentors · Hover For Mission Directives
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
              {MENTOR_AVATARS.map((mentor) => (
                <div
                  key={mentor.id}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => {
                    soundEffects.playClick();
                    setActiveMentor(mentor.id);
                  }}
                  onMouseLeave={() => setActiveMentor(null)}
                  onClick={() => setActiveMentor(activeMentor === mentor.id ? null : mentor.id)}
                >
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 bg-[#0f0f1a] border-2 transition-transform transform group-hover:scale-110 group-hover:-translate-y-1 shadow-md"
                    style={{ borderColor: mentor.color }}
                  >
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Mentor Tooltip */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 sm:w-64 p-3 bg-[#0f0f1a] border border-purple-500/60 rounded-xl shadow-2xl text-left z-30 transition-all ${
                      activeMentor === mentor.id ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mentor.color }} />
                      <span className="text-xs font-bold text-white">{mentor.name}</span>
                      <span className="text-[10px] text-purple-400">({mentor.title})</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic font-medium leading-relaxed mb-2">
                      {mentor.tooltip}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEffects.playClick();
                        onNavigate('ai-sensei');
                      }}
                      className="w-full py-1 text-center text-[10px] font-bold uppercase rounded-lg bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white cursor-pointer hover:opacity-90"
                    >
                      Chat with Sensei ⚡
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-purple-900/40 flex items-center justify-center gap-4 text-xs font-bold">
              <button
                onClick={() => onNavigate('ai-sensei')}
                className="text-amber-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Open Gemini AI Sensei</span>
              </button>
              <span className="text-purple-600">·</span>
              <button
                onClick={() => onNavigate('ai-search')}
                className="text-cyan-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="text-xs">🌐</span>
                <span>Search Live Google CS Data</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. STUDY TIMETABLE SECTION */}
      {/* ========================================================= */}
      <section id="schedule" className="px-4 py-12 max-w-7xl mx-auto scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#e94560]" />
              <span>TIMETABLE MATRIX</span>
            </div>
            <h2 className="font-comic text-3xl sm:text-4xl text-white">
              STUDY TIMETABLE
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Next upcoming study sessions chronologically grouped by day
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Pills */}
            <div className="flex bg-[#16213e] p-1 rounded-xl border border-purple-900/50">
              {(['all', 'today', 'tomorrow', 'upcoming'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    soundEffects.playClick();
                    setTimeFilter(filter);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    timeFilter === filter
                      ? 'bg-[#e94560] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('planner')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/40 border border-purple-700/50 text-purple-200 text-xs font-bold hover:text-white hover:border-[#e94560] transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#e94560]" />
              <span className="hidden sm:inline">Add Session</span>
            </button>
          </div>
        </div>

        {/* Table view */}
        <div className="bg-[#16213e] border border-purple-900/50 rounded-2xl overflow-hidden shadow-xl">
          {Object.keys(groupedByDay).length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center mx-auto mb-3 text-purple-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-comic text-2xl text-slate-200 mb-1">NO SESSIONS IN TIMETABLE</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                No study plans match this timeframe. Add your next CS study quest to stay on track!
              </p>
              <button
                onClick={() => onNavigate('planner')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white text-xs font-bold glow-pink cursor-pointer inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Plan New Study Session</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-purple-900/40">
              {Object.entries(groupedByDay).map(([dateStr, dayPlans]) => (
                <div key={dateStr} className="p-4 sm:p-6">
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-900/30">
                    <div className="flex items-center gap-2">
                      <span className="font-comic text-xl text-[#f5a623]">
                        {formatFriendlyDate(dateStr)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">({dateStr})</span>
                    </div>
                    <span className="text-xs text-purple-300 font-medium">
                      {dayPlans.filter((p) => p.done).length}/{dayPlans.length} Finished
                    </span>
                  </div>

                  {/* Responsive Table / Row List */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-purple-900/20">
                          <th className="py-2 px-3 w-10 text-center">Done</th>
                          <th className="py-2 px-3 w-28">Time</th>
                          <th className="py-2 px-3">Subject / Mission</th>
                          <th className="py-2 px-3 w-36">Category</th>
                          <th className="py-2 px-3 w-24 text-right">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-900/20">
                        {dayPlans.map((plan) => {
                          const cat = CATEGORIES[plan.category] || CATEGORIES['Other'];
                          return (
                            <tr
                              key={plan.id}
                              className={`transition-colors ${
                                plan.done ? 'bg-slate-900/40 opacity-70' : 'hover:bg-purple-950/30'
                              }`}
                            >
                              {/* Toggle Checkbox */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => handleToggle(plan.id, plan.done)}
                                  className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                                  title={plan.done ? 'Mark as Pending' : 'Mark as Done'}
                                >
                                  {plan.done ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-slate-500 hover:text-[#e94560]" />
                                  )}
                                </button>
                              </td>

                              {/* Time */}
                              <td className="py-3 px-3 font-mono text-xs text-slate-300 font-medium">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                                  <span>{plan.time}</span>
                                </div>
                              </td>

                              {/* Subject */}
                              <td className="py-3 px-3">
                                <div
                                  className={`font-semibold ${
                                    plan.done ? 'line-through text-slate-400' : 'text-white'
                                  }`}
                                >
                                  {plan.subject}
                                </div>
                                {plan.notes && (
                                  <div className="text-xs text-purple-300/70 truncate max-w-md mt-0.5">
                                    {plan.notes}
                                  </div>
                                )}
                              </td>

                              {/* Category */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cat.borderColor} ${cat.bgColor}`}
                                  style={{ color: cat.color }}
                                >
                                  <span>{cat.emoji}</span>
                                  <span>{cat.name}</span>
                                </span>
                              </td>

                              {/* Duration */}
                              <td className="py-3 px-3 text-right font-mono text-xs text-slate-300 tabular-nums">
                                {plan.duration} mins
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SUBJECTS SECTION */}
      {/* ========================================================= */}
      <section id="subjects" className="px-4 py-12 max-w-7xl mx-auto scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#f5a623] mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#f5a623]" />
              <span>CURRICULUM BREAKDOWN</span>
            </div>
            <h2 className="font-comic text-3xl sm:text-4xl text-white">
              SUBJECT DOMAINS
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Workload density and topic distribution across active categories
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Light (0-1)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Active (2-3)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#e94560]" /> Busy (4+)
            </span>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(Object.keys(CATEGORIES) as CategoryType[]).map((categoryKey) => {
            const cat = CATEGORIES[categoryKey];
            const catPlans = plans.filter((p) => p.category === categoryKey);
            const workload = getWorkloadLevel(catPlans.length);
            const totalMinutes = catPlans.reduce((sum, p) => sum + p.duration, 0);
            const hours = (totalMinutes / 60).toFixed(1);

            return (
              <div
                key={categoryKey}
                className="bg-[#16213e] border border-purple-900/50 rounded-2xl p-5 shadow-lg hover:border-purple-600/70 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#0f0f1a] border border-purple-900/60 flex items-center justify-center text-xl shadow-inner">
                        {cat.emoji}
                      </div>
                      <div>
                        <h3 className="font-comic text-xl text-white group-hover:text-[#f5a623] transition-colors">
                          {cat.name}
                        </h3>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {catPlans.length} {catPlans.length === 1 ? 'Session' : 'Sessions'} · {hours} hrs
                        </div>
                      </div>
                    </div>

                    {/* Workload Tag */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${workload.color}`}>
                      {workload.label}
                    </span>
                  </div>

                  {/* List of Subjects Studied */}
                  <div className="mt-4 space-y-1.5 min-h-[90px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300/70">
                      Planned Topics:
                    </div>
                    {catPlans.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-2">
                        No active study quests logged yet.
                      </div>
                    ) : (
                      catPlans.slice(0, 3).map((plan) => (
                        <div
                          key={plan.id}
                          className="text-xs text-slate-300 flex items-center gap-1.5 truncate"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${plan.done ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          <span className={plan.done ? 'line-through text-slate-500 truncate' : 'truncate'}>
                            {plan.subject}
                          </span>
                        </div>
                      ))
                    )}
                    {catPlans.length > 3 && (
                      <div className="text-[10px] text-purple-400 font-semibold pt-0.5">
                        +{catPlans.length - 3} more topics in planner
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-5 pt-3 border-t border-purple-900/40 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (onQuickAddCategory) {
                        onQuickAddCategory(categoryKey);
                      } else {
                        onNavigate('planner');
                      }
                    }}
                    className="text-xs font-bold text-[#e94560] hover:text-[#f5a623] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Add to {cat.name}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('planner')}
                    className="text-xs text-purple-400 hover:text-white transition-colors cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. PROGRESS BOARD SECTION */}
      {/* ========================================================= */}
      <section id="progress" className="px-4 py-12 max-w-7xl mx-auto scroll-mt-20">
        <div className="bg-[#16213e] border border-purple-900/50 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>OBJECTIVE TRACKER</span>
              </div>
              <h2 className="font-comic text-3xl sm:text-4xl text-white">
                PROGRESS BOARD
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Live interactive study checklist and overall semester trajectory
              </p>
            </div>

            {/* Overall Progress Stat Box */}
            <div className="bg-[#0f0f1a] border border-purple-900/60 rounded-xl p-4 min-w-[240px] text-right">
              <div className="text-xs font-bold uppercase text-purple-300 mb-1">
                COMPLETION RATE
              </div>
              <div className="flex items-baseline justify-end gap-2">
                <span className="font-comic text-4xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#f5a623] tabular-nums">
                  {completedCount}/{totalCount}
                </span>
                <span className="text-lg font-bold text-slate-300 tabular-nums">
                  ({progressPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Glowing Progress Bar */}
          <div className="relative w-full h-4 bg-[#0f0f1a] rounded-full overflow-hidden border border-purple-900/50 mb-8 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#e94560] via-[#f5a623] to-emerald-400 transition-all duration-500 shadow-[0_0_15px_rgba(233,69,96,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Checklist Controls */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-purple-900/30 flex-wrap">
            <div className="text-xs font-bold uppercase text-slate-300">
              Interactive Session Checklist
            </div>

            <div className="flex items-center gap-1 bg-[#0f0f1a] p-1 rounded-xl border border-purple-900/40">
              <button
                onClick={() => setProgressFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  progressFilter === 'all'
                    ? 'bg-purple-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setProgressFilter('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  progressFilter === 'pending'
                    ? 'bg-[#e94560] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setProgressFilter('done')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  progressFilter === 'done'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Done ({completedCount})
              </button>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {checklistPlans.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No sessions found in this filter.
              </div>
            ) : (
              checklistPlans.map((plan) => {
                const cat = CATEGORIES[plan.category] || CATEGORIES['Other'];
                return (
                  <div
                    key={plan.id}
                    onClick={() => handleToggle(plan.id, plan.done)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none group ${
                      plan.done
                        ? 'bg-purple-950/20 border-purple-900/30 opacity-60'
                        : 'bg-[#0f0f1a]/80 border-purple-900/50 hover:border-[#e94560]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-slate-400 group-hover:text-emerald-400 transition-colors">
                        {plan.done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 group-hover:text-[#e94560]" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-sm font-semibold transition-all ${
                            plan.done ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {plan.subject}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span style={{ color: cat.color }}>{cat.emoji} {cat.name}</span>
                          <span>·</span>
                          <span className="font-mono">{formatFriendlyDate(plan.date)} at {plan.time}</span>
                          <span>·</span>
                          <span className="font-mono">{plan.duration}m</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {plan.done ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. CONTACT SECTION */}
      {/* ========================================================= */}
      <section id="contact" className="px-4 py-12 max-w-4xl mx-auto scroll-mt-20">
        <div className="bg-[#16213e] border border-purple-900/50 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#e94560] mb-1">
              <Send className="w-4 h-4 text-[#e94560]" />
              <span>ACADEMIC DISPATCH</span>
            </div>
            <h2 className="font-comic text-3xl sm:text-4xl text-white">
              CONTACT & STUDY FEEDBACK
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Submit notes to academic advisors, study squad leads, or curriculum coordinators.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="font-comic text-2xl text-emerald-300 mb-2">
                MESSAGE TRANSMITTED!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6">
                Your report has been received by the Computer Science Study Advisory. We will respond to <span className="text-amber-400 font-mono">{contactEmail}</span> shortly.
              </p>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setContactSubmitted(false);
                  setContactMessage('');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0f0f1a] border border-purple-700/60 text-white text-xs font-bold hover:border-[#e94560] transition-colors cursor-pointer"
              >
                Send Another Dispatch
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-purple-200 mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Dan Moses"
                    className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e94560]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-purple-200 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="danmoses2541@gmail.com"
                    className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e94560]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-purple-200 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e94560]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-purple-200 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={contactRegNumber}
                    onChange={(e) => setContactRegNumber(e.target.value)}
                    placeholder="CS/2023/8842"
                    className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e94560]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-purple-200 mb-1">
                  Message / Study Plan Note
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Need advice on balancing Distributed Systems coursework with Graph Theory revision..."
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#e94560]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white font-bold text-sm tracking-wider uppercase glow-pink glow-pink-hover transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Transmission</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. FOOTER */}
      {/* ========================================================= */}
      <footer className="mt-16 border-t border-purple-900/30 pt-8 px-4 text-center max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-comic text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#e94560] to-[#f5a623]">
            STUDY PLAN
          </span>
          <span className="text-xs text-purple-400">· Computer Science Edition</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Built for CS students tackling algorithms, systems, and deep engineering goals.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-purple-400">
          <button onClick={() => onNavigate('welcome')} className="hover:text-white cursor-pointer">Welcome</button>
          <span>·</span>
          <button onClick={() => onNavigate('planner')} className="hover:text-white cursor-pointer">Planner</button>
          <span>·</span>
          <button onClick={() => scrollToSection('schedule')} className="hover:text-white cursor-pointer">Timetable</button>
          <span>·</span>
          <button onClick={() => scrollToSection('progress')} className="hover:text-white cursor-pointer">Progress</button>
        </div>
      </footer>
    </div>
  );
};
