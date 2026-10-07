import React, { useState, useRef, useEffect } from 'react';
import { AIChatMessage, AIModelTier, AIMentorRole, CategoryType, StudyPlan, User, ViewMode } from '../types';
import { AI_MENTORS } from '../data/aiMentors';
import { AIService } from '../services/aiService';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Globe,
  Zap,
  Cpu,
  Brain,
  Trash2,
  CalendarPlus,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Copy,
  Check,
  Search,
  MessageSquare
} from 'lucide-react';

interface AIChatSenseiProps {
  currentUser: User;
  onAddPlanFromAI: (plan: Omit<StudyPlan, 'id' | 'createdAt'>) => void;
  onNavigate: (view: ViewMode) => void;
}

export const AIChatSensei: React.FC<AIChatSenseiProps> = ({
  currentUser,
  onAddPlanFromAI,
  onNavigate,
}) => {
  const [selectedRole, setSelectedRole] = useState<AIMentorRole>('algorithms');
  const [modelTier, setModelTier] = useState<AIModelTier>('general');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeMentor = AI_MENTORS[selectedRole];

  // Conversation history state
  const [messages, setMessages] = useState<AIChatMessage[]>(() => {
    return [
      {
        id: 'msg_welcome',
        role: 'model',
        text: activeMentor.welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash',
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle role switch
  const handleRoleSwitch = (newRole: AIMentorRole) => {
    if (newRole === selectedRole) return;
    soundEffects.playClick();
    setSelectedRole(newRole);
    const mentor = AI_MENTORS[newRole];
    setMessages((prev) => [
      ...prev,
      {
        id: 'msg_' + Date.now(),
        role: 'model',
        text: `Switched mentor to **${mentor.name}** (${mentor.title}). ${mentor.welcomeMessage}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash',
      },
    ]);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    soundEffects.playClick();
    const userMsg: AIChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Build multi-turn context
      const apiMessages = newMessages
        .filter((m) => m.id !== 'msg_welcome')
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));

      // Fallback if empty
      if (apiMessages.length === 0) {
        apiMessages.push({ role: 'user', parts: [{ text: textToSend }] });
      }

      const response = await AIService.sendChatMessage({
        messages: apiMessages,
        systemInstruction: activeMentor.systemInstruction,
        modelTier,
        useSearchGrounding,
      });

      soundEffects.playComplete();

      const aiMsg: AIChatMessage = {
        id: 'msg_' + Date.now(),
        role: 'model',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: response.modelUsed,
        sources: response.sources,
        searchQueries: response.searchQueries,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Failed to reach Gemini API';
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          role: 'model',
          text: `⚠️ **Transmission Error:** ${errMsg}. Please ensure the GEMINI_API_KEY is configured in your project settings.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundEffects.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    soundEffects.playClick();
    setMessages([
      {
        id: 'msg_reset_' + Date.now(),
        role: 'model',
        text: `Study session reset. Ready for your next inquiry, challenger!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash',
      },
    ]);
  };

  const handleQuickAddSessionFromTopic = (topic: string, category: CategoryType, duration = 60) => {
    soundEffects.playLevelUp();
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });

    onAddPlanFromAI({
      userId: currentUser.id,
      subject: topic,
      category,
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration,
      done: false,
      notes: `Suggested by ${activeMentor.name} during AI study mentoring.`,
    });
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Background orbs */}
      <div className="fixed top-24 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-[#e94560]/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#e94560] mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>GEMINI INTELLIGENCE NEXUS</span>
          </div>
          <h1 className="font-comic text-4xl sm:text-5xl text-white flex items-center gap-2">
            AI STUDY SENSEI
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Multi-turn interactive study mentoring powered by Gemini with real-time Google Search Grounding.
          </p>
        </div>

        {/* Model Tier Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-[#16213e] p-1 rounded-xl border border-purple-900/60 flex items-center text-xs">
            <button
              onClick={() => {
                soundEffects.playClick();
                setModelTier('general');
              }}
              title="gemini-3.5-flash for general tasks"
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                modelTier === 'general'
                  ? 'bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>General (3.5 Flash)</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setModelTier('fast');
              }}
              title="gemini-3.1-flash-lite for fast tasks"
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                modelTier === 'fast'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Fast (3.1 Lite)</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setModelTier('complex');
              }}
              title="gemini-3.1-pro-preview for complex tasks"
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                modelTier === 'complex'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-cyan-300" />
              <span>Complex (3.1 Pro)</span>
            </button>
          </div>

          {/* Search Grounding toggle */}
          <button
            onClick={() => {
              soundEffects.playClick();
              setUseSearchGrounding(!useSearchGrounding);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              useSearchGrounding
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-[#16213e] border-purple-900/60 text-slate-400 hover:text-white'
            }`}
            title="Search Grounding with Google Search via gemini-3.5-flash"
          >
            <Globe className={`w-3.5 h-3.5 ${useSearchGrounding ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            <span>Google Search: {useSearchGrounding ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Mentor Persona Selector Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(Object.keys(AI_MENTORS) as AIMentorRole[]).map((roleKey) => {
          const mentor = AI_MENTORS[roleKey];
          const isSelected = selectedRole === roleKey;
          return (
            <button
              key={roleKey}
              onClick={() => handleRoleSwitch(roleKey)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                isSelected
                  ? `${mentor.borderColor} bg-gradient-to-r ${mentor.bgGradient} shadow-lg ring-1 ring-white/20`
                  : 'border-purple-900/40 bg-[#16213e]/70 hover:border-purple-600/60'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl p-0.5 bg-[#0f0f1a] border flex-shrink-0"
                style={{ borderColor: mentor.color }}
              >
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-full h-full rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{mentor.name}</span>
                </div>
                <div className="text-[10px] text-purple-300/80 truncate">{mentor.title}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5 truncate" style={{ color: mentor.color }}>
                  {mentor.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-[#16213e] border border-purple-900/60 rounded-2xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-purple-900/50 bg-[#0f0f1a]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#16213e] p-0.5 border-2" style={{ borderColor: activeMentor.color }}>
              <img
                src={activeMentor.avatar}
                alt={activeMentor.name}
                className="w-full h-full rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-comic text-lg text-white">{activeMentor.name}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50">
                  {activeMentor.specialty}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Online · Model: <span className="text-amber-400 font-mono">{useSearchGrounding ? 'gemini-3.5-flash (Google Grounded)' : modelTier === 'fast' ? 'gemini-3.1-flash-lite' : modelTier === 'complex' ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              title="Reset conversation"
              className="p-2 rounded-lg bg-[#16213e] border border-purple-900/40 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              onClick={() => onNavigate('ai-search')}
              className="p-2 rounded-lg bg-[#16213e] border border-purple-900/40 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/50 transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search Hub</span>
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center p-0.5 border ${
                    isUser
                      ? 'border-[#e94560] bg-gradient-to-tr from-[#e94560] to-[#f5a623]'
                      : 'border-purple-500 bg-[#0f0f1a]'
                  }`}
                >
                  {isUser ? (
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.avatarSeed}&backgroundColor=16213e`}
                      alt="You"
                      className="w-full h-full rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <img
                      src={activeMentor.avatar}
                      alt={activeMentor.name}
                      className="w-full h-full rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                {/* Message Body */}
                <div className={`space-y-2 max-w-[85%]`}>
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                      isUser
                        ? 'bg-gradient-to-r from-[#e94560] to-rose-700 text-white rounded-tr-none'
                        : 'bg-[#0f0f1a] border border-purple-900/60 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-3 pb-1 mb-2 border-b border-white/10 text-[11px] opacity-80">
                      <span className="font-bold">{isUser ? currentUser.name : activeMentor.name}</span>
                      <span className="font-mono text-[10px]">{msg.timestamp}</span>
                    </div>

                    {/* Formatted Markdown-like Content */}
                    <div className="space-y-2 whitespace-pre-wrap font-sans">
                      {msg.text}
                    </div>

                    {/* Grounding Citations & Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-purple-900/50 text-xs">
                        <div className="flex items-center gap-1 text-cyan-400 font-bold mb-2 uppercase tracking-wider text-[11px]">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Google Search Grounding Sources ({msg.sources.length}):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.sources.slice(0, 4).map((source, sIdx) => (
                            <a
                              key={sIdx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-[#16213e] border border-purple-900/40 hover:border-cyan-400/60 text-slate-300 hover:text-white transition-colors flex items-center justify-between gap-1 group"
                            >
                              <span className="truncate text-[11px] font-medium">{source.title}</span>
                              <ExternalLink className="w-3 h-3 text-cyan-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Google Search Queries */}
                    {msg.searchQueries && msg.searchQueries.length > 0 && (
                      <div className="mt-2 text-[10px] text-purple-300/70 font-mono">
                        Queries: {msg.searchQueries.join(' · ')}
                      </div>
                    )}
                  </div>

                  {/* Message Action Bar (Copy, Quick Plan Conversion) */}
                  {!isUser && (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="px-2.5 py-1 rounded-md bg-[#0f0f1a] border border-purple-900/40 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {/* Quick Add To Study Plan Button */}
                      <button
                        onClick={() => {
                          const topicExcerpt = msg.text.slice(0, 60).replace(/[*#]/g, '').trim();
                          handleQuickAddSessionFromTopic(
                            `${activeMentor.name} Quest: ${topicExcerpt}...`,
                            selectedRole === 'math' ? 'Mathematics' : 'Computer Studies',
                            60
                          );
                        }}
                        className="px-2.5 py-1 rounded-md bg-purple-900/40 border border-purple-700/50 text-[#f5a623] hover:text-white hover:border-[#f5a623] transition-colors flex items-center gap-1 text-[11px] cursor-pointer font-bold"
                      >
                        <CalendarPlus className="w-3 h-3" />
                        <span>+ Add to Planner</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-md mr-auto">
              <div className="w-8 h-8 rounded-full border border-purple-500 bg-[#0f0f1a] flex items-center justify-center p-0.5">
                <img
                  src={activeMentor.avatar}
                  alt={activeMentor.name}
                  className="w-full h-full rounded-full animate-pulse"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="bg-[#0f0f1a] border border-purple-900/60 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-300 flex items-center gap-2 shadow-lg">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{activeMentor.name} is synthesizing response with Gemini...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 bg-[#0f0f1a]/80 border-t border-purple-900/40 overflow-x-auto flex items-center gap-2 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Suggested:</span>
          {activeMentor.samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-[#16213e] border border-purple-900/60 text-purple-200 hover:text-white hover:border-[#e94560] whitespace-nowrap text-[11px] transition-colors cursor-pointer"
            >
              ⚡ {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#0f0f1a] border-t border-purple-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={`Ask ${activeMentor.name} anything about ${activeMentor.specialty}...`}
              disabled={isLoading}
              className="flex-1 bg-[#16213e] border border-purple-900/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]"
            />

            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white font-bold text-sm glow-pink glow-pink-hover transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>Transmit</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
