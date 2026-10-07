import React, { useState } from 'react';
import { CategoryType, GroundingSource, StudyPlan, User, ViewMode } from '../types';
import { CATEGORIES } from '../data/initialData';
import { AIService, SearchApiResponse } from '../services/aiService';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Search,
  Globe,
  ExternalLink,
  Sparkles,
  BookOpen,
  CalendarPlus,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface AISearchGroundingViewProps {
  currentUser: User;
  onAddPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt'>) => void;
  onNavigate: (view: ViewMode) => void;
}

const SEARCH_PRESETS = [
  {
    label: 'Stanford CS 161 Algorithms Syllabus 2026',
    category: 'Computer Studies' as CategoryType,
    query: 'Stanford CS 161 algorithms syllabus topics and key dynamic programming problem sets',
  },
  {
    label: 'Python 3.13 Free-Threaded GIL Concurrency',
    category: 'Computer Studies' as CategoryType,
    query: 'Python 3.13 free-threaded no GIL concurrency performance improvements and benchmarks',
  },
  {
    label: 'Raft vs Paxos Consensus Differences',
    category: 'Computer Studies' as CategoryType,
    query: 'Key architectural differences between Raft and Paxos distributed consensus protocols',
  },
  {
    label: 'RSA Encryption & Modular Inverses Proofs',
    category: 'Mathematics' as CategoryType,
    query: 'How does RSA algorithm use Euler totient theorem and extended Euclidean algorithm for keys?',
  },
  {
    label: 'Quantum Computing Qubit Superposition Principles',
    category: 'Physics' as CategoryType,
    query: 'Quantum computing qubit state superposition and Bloch sphere representation explanation',
  },
];

export const AISearchGroundingView: React.FC<AISearchGroundingViewProps> = ({
  currentUser,
  onAddPlan,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Computer Studies');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const handleExecuteSearch = async (queryToRun?: string, categoryToUse?: CategoryType) => {
    const q = (queryToRun || searchQuery).trim();
    if (!q || isLoading) return;

    soundEffects.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    const cat = categoryToUse || selectedCategory;

    try {
      const response = await AIService.querySearchGrounding(q, `Subject domain: ${cat}`);
      soundEffects.playComplete();
      setResult(response);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Search Grounding query failed';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundEffects.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScheduleFromSearch = () => {
    if (!result) return;
    soundEffects.playLevelUp();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    const cleanSubject = searchQuery.slice(0, 65).trim();
    onAddPlan({
      userId: currentUser.id,
      subject: `Research Quest: ${cleanSubject}`,
      category: selectedCategory,
      date: new Date().toISOString().split('T')[0],
      time: '15:00',
      duration: 60,
      done: false,
      notes: `Researched with Gemini Search Grounding. Review web citations.`,
    });

    setAddedToast(`Scheduled "${cleanSubject}" in your study planner!`);
    setTimeout(() => setAddedToast(null), 3500);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Background orbs */}
      <div className="fixed top-20 right-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16213e] border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-wide mb-3 shadow-lg">
          <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>REAL-TIME SEARCH GROUNDING</span>
          <span className="text-purple-400">·</span>
          <span>GEMINI 3.5 FLASH</span>
        </div>

        <h1 className="font-comic text-4xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#f5a623] to-[#e94560] leading-tight mb-3">
          LIVE CS RESEARCH DATA
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
          Access up-to-date and accurate information grounded with live Google Search. Query current university syllabi, benchmark figures, algorithms, and technical specs.
        </p>
      </div>

      {/* Search Bar & Category Controls Card */}
      <div className="bg-[#16213e] border border-purple-900/60 rounded-2xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto mb-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteSearch();
          }}
          className="space-y-4"
        >
          {/* Input field */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search CS concepts, papers, benchmark data, or university syllabus topics..."
              className="w-full bg-[#0f0f1a] border border-purple-900/60 rounded-xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Category Chips and Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 text-[11px] font-bold uppercase mr-1">Domain:</span>
              {(Object.keys(CATEGORIES) as CategoryType[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const active = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedCategory(catKey);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${
                      active
                        ? 'bg-purple-900 text-white border border-cyan-400 shadow-sm'
                        : 'bg-[#0f0f1a] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-[#e94560] to-[#f5a623] text-white font-bold text-sm glow-pink glow-pink-hover transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Globe className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Querying Google Data...' : 'Search with Gemini'}</span>
            </button>
          </div>
        </form>

        {/* Preset Sample Queries */}
        <div className="mt-6 pt-5 border-t border-purple-900/40">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80 mb-2.5">
            Recommended CS Research Prompts:
          </div>
          <div className="flex flex-wrap gap-2">
            {SEARCH_PRESETS.map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => {
                  setSearchQuery(preset.query);
                  setSelectedCategory(preset.category);
                  handleExecuteSearch(preset.query, preset.category);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#0f0f1a] border border-purple-900/50 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/50 transition-colors cursor-pointer text-left"
              >
                🔍 {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {addedToast && (
        <div className="max-w-md mx-auto mb-6 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Error state */}
      {errorMsg && (
        <div className="max-w-4xl mx-auto mb-8 p-4 rounded-xl bg-rose-500/20 border border-rose-500/60 text-rose-200 text-sm">
          <strong>Search Error:</strong> {errorMsg}. Verify that your server environment has `GEMINI_API_KEY` active.
        </div>
      )}

      {/* Search Results Display */}
      {result && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          {/* Synthesis Card */}
          <div className="bg-[#16213e] border border-cyan-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-purple-900/40">
              <div>
                <div className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>GROUNDED SYNTHESIS</span>
                </div>
                <h2 className="font-comic text-2xl text-white">
                  RESEARCH FINDINGS
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(result.text)}
                  className="px-3 py-1.5 rounded-lg bg-[#0f0f1a] border border-purple-900/50 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleScheduleFromSearch}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white hover:opacity-95 transition-opacity flex items-center gap-1.5 text-xs font-bold cursor-pointer glow-pink"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>+ Schedule Plan</span>
                </button>
              </div>
            </div>

            {/* Answer Text */}
            <div className="text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans space-y-3">
              {result.text}
            </div>

            {/* Queries Triggered */}
            {result.searchQueries && result.searchQueries.length > 0 && (
              <div className="mt-6 pt-4 border-t border-purple-900/40">
                <div className="text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Google Search Queries Executed:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.searchQueries.map((q, qIdx) => (
                    <span
                      key={qIdx}
                      className="px-2.5 py-1 rounded-md bg-[#0f0f1a] text-[11px] text-cyan-300 font-mono border border-purple-900/50"
                    >
                      "{q}"
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Web Citations Card */}
          {result.sources && result.sources.length > 0 && (
            <div className="bg-[#16213e] border border-purple-900/60 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h3 className="font-comic text-xl text-white">
                  VERIFIED WEB SOURCES ({result.sources.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.sources.map((source, sIdx) => {
                  let hostname = '';
                  try {
                    hostname = new URL(source.url).hostname;
                  } catch {
                    hostname = 'web';
                  }

                  return (
                    <a
                      key={sIdx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-[#0f0f1a] border border-purple-900/50 hover:border-cyan-400/80 transition-all flex items-start justify-between gap-2 group shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {source.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          {hostname}
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 transition-colors mt-0.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
