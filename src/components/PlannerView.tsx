import React, { useState } from 'react';
import { CategoryType, StudyPlan, User } from '../types';
import { CATEGORIES } from '../data/initialData';
import { AIService, GeneratedPlanRecommendation } from '../services/aiService';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Sparkles,
  Search,
  Filter,
  Layers,
  Edit3,
  RotateCcw,
  Check,
  X,
  FileText
} from 'lucide-react';

interface PlannerViewProps {
  currentUser: User;
  plans: StudyPlan[];
  onAddPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt'>) => void;
  onTogglePlanDone: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
  onUpdatePlan: (plan: StudyPlan) => void;
  onResetSamplePlans: () => void;
  initialCategory?: CategoryType;
}

const CS_TOPIC_PRESETS = [
  'Graph Theory & Shortest Path Proofs',
  'Dynamic Programming (LeetCode 75)',
  'OS Concurrency: Mutex & Semaphores',
  'Discrete Mathematics: Modular Arithmetic',
  'Compiler Parsing & AST Tree Construction',
  'Distributed Consensus (Raft / Paxos)',
  'Linear Algebra: PCA & Matrix Decomp',
  'Quantum Computing & Qubit Superposition',
];

export const PlannerView: React.FC<PlannerViewProps> = ({
  currentUser,
  plans,
  onAddPlan,
  onTogglePlanDone,
  onDeletePlan,
  onUpdatePlan,
  onResetSamplePlans,
  initialCategory,
}) => {
  // Current Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<CategoryType>(initialCategory || 'Computer Studies');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState('');

  // Search & Filter state
  const [filterState, setFilterState] = useState<'all' | 'pending' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryType | 'all'>('all');

  // Edit Modal State
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);

  // AI Generator state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedPlans, setAiGeneratedPlans] = useState<GeneratedPlanRecommendation[]>([]);

  // Stats calculation
  const totalCount = plans.length;
  const doneCount = plans.filter((p) => p.done).length;
  const pendingCount = totalCount - doneCount;
  const totalMinutes = plans.reduce((acc, p) => acc + p.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Form submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    soundEffects.playComplete();
    onAddPlan({
      userId: currentUser.id,
      subject: subject.trim(),
      category,
      date,
      time,
      duration,
      done: false,
      notes: notes.trim() || undefined,
    });

    setSubject('');
    setNotes('');
  };

  // AI Generation with Gemini
  const handleGenerateWithGemini = async () => {
    const topicToUse = subject.trim() || 'Computer Science Algorithms';
    soundEffects.playClick();
    setIsGeneratingAI(true);

    try {
      const suggestions = await AIService.generatePlanSuggestions(topicToUse, category);
      soundEffects.playComplete();
      setAiGeneratedPlans(suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyAISuggestion = (sug: GeneratedPlanRecommendation) => {
    soundEffects.playLevelUp();
    setSubject(sug.subject);
    setDuration(sug.duration);
    if (sug.notes) setNotes(sug.notes);
  };

  // Toggle done
  const handleToggle = (plan: StudyPlan) => {
    onTogglePlanDone(plan.id);
    if (!plan.done) {
      soundEffects.playComplete();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      soundEffects.playClick();
    }
  };

  // Delete
  const handleDelete = (planId: string) => {
    soundEffects.playClick();
    onDeletePlan(planId);
  };

  // Save edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    soundEffects.playComplete();
    onUpdatePlan(editingPlan);
    setEditingPlan(null);
  };

  // Filtered plans
  const filteredPlans = plans.filter((plan) => {
    // Status filter
    if (filterState === 'pending' && plan.done) return false;
    if (filterState === 'done' && !plan.done) return false;

    // Category filter
    if (selectedCategoryFilter !== 'all' && plan.category !== selectedCategoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = plan.subject.toLowerCase().includes(q);
      const matchCat = plan.category.toLowerCase().includes(q);
      const matchNotes = plan.notes ? plan.notes.toLowerCase().includes(q) : false;
      return matchSub || matchCat || matchNotes;
    }

    return true;
  });

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Background orbs */}
      <div className="absolute top-10 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#e94560]/10 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#e94560] mb-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#e94560]" />
            <span>SESSION DIRECTORY</span>
          </div>
          <h1 className="font-comic text-4xl sm:text-5xl text-white">
            STUDY PLANNER
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Log new curriculum objectives, toggle completed sessions, and filter your schedule.
          </p>
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            onResetSamplePlans();
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16213e] border border-purple-800/60 text-purple-300 text-xs font-bold hover:text-white hover:border-[#f5a623] transition-colors cursor-pointer"
          title="Restore sample CS dataset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reload Sample Plans</span>
        </button>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: NEW SESSION FORM (4/12 width on desktop) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-[#16213e] border border-purple-900/60 rounded-2xl p-6 shadow-xl sticky top-24">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-900/40">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#e94560] to-[#f5a623] p-0.5 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-comic text-2xl text-white">NEW SESSION</h2>
              <p className="text-[11px] text-purple-300/80">Schedule your next focus block</p>
            </div>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold uppercase text-purple-200 mb-1.5">
                Subject / Goal
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Graph theory revision"
                className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]"
              />

              {/* Quick CS Topic Presets */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Quick CS Presets:
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateWithGemini}
                    disabled={isGeneratingAI}
                    className="text-[10px] font-bold text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className={`w-3 h-3 text-amber-400 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAI ? 'Gemini Thinking...' : 'Gemini AI Suggest 3'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                  {CS_TOPIC_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setSubject(preset);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#0f0f1a] border border-purple-900/50 text-purple-300 hover:text-white hover:border-[#f5a623] transition-colors cursor-pointer text-left truncate max-w-full"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {/* AI Generated Suggestions Container */}
                {aiGeneratedPlans.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#0f0f1a] border border-amber-400/40 space-y-1.5 animate-fadeIn">
                    <div className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Gemini Generated Study Sessions:</span>
                    </div>
                    {aiGeneratedPlans.map((sug, sIdx) => (
                      <div
                        key={sIdx}
                        onClick={() => handleApplyAISuggestion(sug)}
                        className="p-1.5 rounded-lg bg-[#16213e] border border-purple-900/40 hover:border-amber-400 text-left text-xs cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-white group-hover:text-amber-300 truncate">
                            {sug.subject}
                          </span>
                          <span className="text-[10px] font-mono text-purple-300 whitespace-nowrap">
                            {sug.duration}m
                          </span>
                        </div>
                        {sug.notes && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {sug.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase text-purple-200 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e94560]"
              >
                {(Object.keys(CATEGORIES) as CategoryType[]).map((catKey) => {
                  const cat = CATEGORIES[catKey];
                  return (
                    <option key={catKey} value={catKey} className="bg-[#16213e] text-white">
                      {cat.emoji} {cat.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Date and Time row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-purple-200 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e94560]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-purple-200 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Time</span>
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e94560]"
                />
              </div>
            </div>

            {/* Duration dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase text-purple-200 mb-1.5">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e94560]"
              >
                <option value={30} className="bg-[#16213e]">30 Minutes (Sprint)</option>
                <option value={45} className="bg-[#16213e]">45 Minutes</option>
                <option value={60} className="bg-[#16213e]">1 Hour (Standard Block)</option>
                <option value={90} className="bg-[#16213e]">1.5 Hours (Deep Work)</option>
                <option value={120} className="bg-[#16213e]">2 Hours</option>
                <option value={180} className="bg-[#16213e]">3 Hours (Exam Raid)</option>
              </select>
            </div>

            {/* Notes / Sub-goals */}
            <div>
              <label className="block text-xs font-bold uppercase text-purple-200 mb-1.5">
                Session Focus / Key Proofs (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Solve problem set 3, proofs 1-4"
                className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560]"
              />
            </div>

            {/* Glowing Add Plan Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white font-bold text-sm tracking-wider uppercase glow-pink glow-pink-hover transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Add Plan</span>
            </button>
          </form>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: MY PLANS LIST & STATS (7/12 width) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 bg-[#16213e] border border-purple-900/60 rounded-2xl p-4 shadow-xl">
            <div className="text-center">
              <div className="text-[10px] sm:text-xs font-bold uppercase text-slate-400">Total</div>
              <div className="font-comic text-2xl sm:text-3xl text-white tabular-nums">{totalCount}</div>
            </div>
            <div className="text-center border-l border-purple-900/40">
              <div className="text-[10px] sm:text-xs font-bold uppercase text-emerald-400">Done</div>
              <div className="font-comic text-2xl sm:text-3xl text-emerald-400 tabular-nums">{doneCount}</div>
            </div>
            <div className="text-center border-l border-purple-900/40">
              <div className="text-[10px] sm:text-xs font-bold uppercase text-amber-400">Pending</div>
              <div className="font-comic text-2xl sm:text-3xl text-amber-400 tabular-nums">{pendingCount}</div>
            </div>
            <div className="text-center border-l border-purple-900/40">
              <div className="text-[10px] sm:text-xs font-bold uppercase text-purple-400">Hours</div>
              <div className="font-comic text-2xl sm:text-3xl text-purple-300 tabular-nums">{totalHours}h</div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-[#16213e] border border-purple-900/60 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Filter Buttons: All / Pending / Done */}
              <div className="flex bg-[#0f0f1a] p-1 rounded-xl border border-purple-900/40">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setFilterState('all');
                  }}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterState === 'all'
                      ? 'bg-purple-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setFilterState('pending');
                  }}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterState === 'pending'
                      ? 'bg-[#e94560] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setFilterState('done');
                  }}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterState === 'done'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Done ({doneCount})
                </button>
              </div>

              {/* Search input */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plans..."
                  className="w-full bg-[#0f0f1a] border border-purple-900/50 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 text-[11px] font-bold uppercase mr-1">Category:</span>
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-purple-900 text-white'
                    : 'bg-[#0f0f1a] text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {(Object.keys(CATEGORIES) as CategoryType[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const active = selectedCategoryFilter === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategoryFilter(catKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${
                      active
                        ? 'bg-purple-900 text-white border border-purple-500'
                        : 'bg-[#0f0f1a] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Session Cards */}
          <div className="space-y-3">
            {filteredPlans.length === 0 ? (
              <div className="bg-[#16213e] border border-purple-900/50 rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center mx-auto mb-3 text-purple-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-comic text-2xl text-slate-200 mb-1">NO PLANS FOUND</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery || selectedCategoryFilter !== 'all' || filterState !== 'all'
                    ? 'Try clearing the search or category filter to reveal study plans.'
                    : 'Your study plan queue is empty. Use the left form to schedule your first session!'}
                </p>
              </div>
            ) : (
              filteredPlans.map((plan) => {
                const cat = CATEGORIES[plan.category] || CATEGORIES['Other'];
                return (
                  <div
                    key={plan.id}
                    className={`group bg-[#16213e] border rounded-2xl p-4 sm:p-5 shadow-lg transition-all ${
                      plan.done
                        ? 'border-purple-950/40 bg-[#16213e]/50 opacity-60'
                        : 'border-purple-900/60 hover:border-purple-500/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Checkbox & Details */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Checkbox button */}
                        <button
                          type="button"
                          onClick={() => handleToggle(plan)}
                          className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          title={plan.done ? 'Mark as Pending' : 'Mark as Complete'}
                        >
                          {plan.done ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-slate-500 hover:text-[#e94560]" />
                          )}
                        </button>

                        {/* Text info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {/* Category badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cat.borderColor} ${cat.bgColor}`}
                              style={{ color: cat.color }}
                            >
                              <span>{cat.emoji}</span>
                              <span>{cat.name}</span>
                            </span>

                            {/* Status label */}
                            {plan.done ? (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                DONE
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                PENDING
                              </span>
                            )}
                          </div>

                          <h3
                            className={`text-base sm:text-lg font-bold transition-all ${
                              plan.done ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {plan.subject}
                          </h3>

                          {plan.notes && (
                            <p className="text-xs text-slate-300 mt-1 italic font-medium">
                              📝 {plan.notes}
                            </p>
                          )}

                          {/* Date, Time, Duration */}
                          <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 font-mono">
                            <span className="flex items-center gap-1 text-purple-300">
                              <Calendar className="w-3.5 h-3.5 text-purple-400" />
                              <span>{plan.date}</span>
                            </span>

                            <span className="flex items-center gap-1 text-purple-300">
                              <Clock className="w-3.5 h-3.5 text-purple-400" />
                              <span>{plan.time}</span>
                            </span>

                            <span className="text-amber-400 font-bold tabular-nums">
                              {plan.duration} mins
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls: Edit & Delete */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            soundEffects.playClick();
                            setEditingPlan(plan);
                          }}
                          title="Edit Session"
                          className="p-2 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-900/40 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(plan.id)}
                          title="Delete Session"
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#16213e] border border-purple-800/80 rounded-2xl p-6 shadow-2xl glow-card text-white">
            <button
              onClick={() => setEditingPlan(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-comic text-2xl text-white mb-4">
              EDIT STUDY PLAN
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-purple-200 mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  required
                  value={editingPlan.subject}
                  onChange={(e) => setEditingPlan({ ...editingPlan, subject: e.target.value })}
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-purple-200 mb-1">
                  Category
                </label>
                <select
                  value={editingPlan.category}
                  onChange={(e) => setEditingPlan({ ...editingPlan, category: e.target.value as CategoryType })}
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3 py-2 text-sm text-white"
                >
                  {(Object.keys(CATEGORIES) as CategoryType[]).map((catKey) => (
                    <option key={catKey} value={catKey} className="bg-[#16213e]">
                      {CATEGORIES[catKey].emoji} {CATEGORIES[catKey].name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-purple-200 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingPlan.date}
                    onChange={(e) => setEditingPlan({ ...editingPlan, date: e.target.value })}
                    className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-purple-200 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={editingPlan.time}
                    onChange={(e) => setEditingPlan({ ...editingPlan, time: e.target.value })}
                    className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-purple-200 mb-1">
                  Duration (Minutes)
                </label>
                <select
                  value={editingPlan.duration}
                  onChange={(e) => setEditingPlan({ ...editingPlan, duration: Number(e.target.value) })}
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value={30} className="bg-[#16213e]">30 Minutes</option>
                  <option value={45} className="bg-[#16213e]">45 Minutes</option>
                  <option value={60} className="bg-[#16213e]">60 Minutes</option>
                  <option value={90} className="bg-[#16213e]">90 Minutes</option>
                  <option value={120} className="bg-[#16213e]">120 Minutes (2h)</option>
                  <option value={180} className="bg-[#16213e]">180 Minutes (3h)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-purple-200 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={editingPlan.notes || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, notes: e.target.value })}
                  className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0f0f1a] border border-purple-900/60 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white font-bold text-xs glow-pink"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
