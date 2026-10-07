/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CategoryType, StudyPlan, User, ViewMode } from './types';
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { MarqueeBanner } from './components/MarqueeBanner';
import { WelcomeView } from './components/WelcomeView';
import { DashboardView } from './components/DashboardView';
import { PlannerView } from './components/PlannerView';
import { AIChatSensei } from './components/AIChatSensei';
import { AISearchGroundingView } from './components/AISearchGroundingView';
import { AuthModal } from './components/AuthModal';
import { Bot, Sparkles, Globe } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [plans, setPlans] = useState<StudyPlan[]>(() => StorageService.getUserPlans(currentUser.id));
  const [currentView, setCurrentView] = useState<ViewMode>('welcome');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [plannerCategoryPreset, setPlannerCategoryPreset] = useState<CategoryType | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync plans whenever current user changes
  useEffect(() => {
    setPlans(StorageService.getUserPlans(currentUser.id));
  }, [currentUser]);

  // Show transient toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // Hash-based navigation synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'welcome') {
        setCurrentView('welcome');
      } else if (hash === 'home' || hash === 'schedule' || hash === 'subjects' || hash === 'progress' || hash === 'contact') {
        setCurrentView('home');
        if (hash !== 'home') {
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      } else if (hash === 'planner') {
        setCurrentView('planner');
      } else if (hash === 'ai-sensei' || hash === 'chat') {
        setCurrentView('ai-sensei');
      } else if (hash === 'ai-search' || hash === 'search') {
        setCurrentView('ai-search');
      } else if (hash === 'login' || hash === 'register') {
        setIsAuthModalOpen(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation handler
    const handleNavigate = (view: ViewMode, sectionId?: string) => {
    if (currentUser.id === 'guest' && (view === 'home' || view === 'planner')) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView(view);
    if (sectionId) {
      window.location.hash = sectionId;
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.location.hash = view;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Plan CRUD actions
  const handleAddPlan = (newPlanData: Omit<StudyPlan, 'id' | 'createdAt'>) => {
    const created = StorageService.addPlan(newPlanData);
    setPlans(StorageService.getUserPlans(currentUser.id));
    showToast(`Added: "${created.subject}"`);
  };

  const handleTogglePlanDone = (planId: string) => {
    const updated = StorageService.togglePlanDone(planId);
    setPlans(StorageService.getUserPlans(currentUser.id));
    if (updated) {
      showToast(updated.done ? `Completed mission: "${updated.subject}" 🎯` : `Marked pending: "${updated.subject}"`);
    }
  };

  const handleDeletePlan = (planId: string) => {
    const deletedPlan = plans.find((p) => p.id === planId);
    StorageService.deletePlan(planId);
    setPlans(StorageService.getUserPlans(currentUser.id));
    showToast(`Deleted plan${deletedPlan ? `: "${deletedPlan.subject}"` : ''}`);
  };

  const handleUpdatePlan = (updatedPlan: StudyPlan) => {
    StorageService.updatePlan(updatedPlan);
    setPlans(StorageService.getUserPlans(currentUser.id));
    showToast(`Updated: "${updatedPlan.subject}"`);
  };

  const handleResetSamplePlans = () => {
    const refreshed = StorageService.resetUserPlansToSample(currentUser.id);
    setPlans(refreshed);
    showToast('Restored full CS sample study curriculum! 📚');
  };

  const handleQuickAddCategory = (cat: CategoryType) => {
    setPlannerCategoryPreset(cat);
    handleNavigate('planner');
  };

  const handleLogout = () => {
    const defaultUser = StorageService.logoutUser();
    setCurrentUser(defaultUser);
    showToast(`Switched account to ${defaultUser.name}`);
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-slate-100 flex flex-col font-sans selection:bg-[#e94560] selection:text-white">
      {/* Fixed Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Scrolling Marquee Banner with Motivational Quotes */}
      <MarqueeBanner />

      {/* Main View Area */}
      <main className="flex-1 w-full">
        {currentView === 'welcome' && (
          <WelcomeView
            currentUser={currentUser}
            plans={plans}
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentView === 'home' && (
          <DashboardView
            currentUser={currentUser}
            plans={plans}
            onTogglePlanDone={handleTogglePlanDone}
            onNavigate={handleNavigate}
            onQuickAddCategory={handleQuickAddCategory}
          />
        )}

        {currentView === 'planner' && (
          <PlannerView
            currentUser={currentUser}
            plans={plans}
            onAddPlan={handleAddPlan}
            onTogglePlanDone={handleTogglePlanDone}
            onDeletePlan={handleDeletePlan}
            onUpdatePlan={handleUpdatePlan}
            onResetSamplePlans={handleResetSamplePlans}
            initialCategory={plannerCategoryPreset}
          />
        )}

        {currentView === 'ai-sensei' && (
          <AIChatSensei
            currentUser={currentUser}
            onAddPlanFromAI={handleAddPlan}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'ai-search' && (
          <AISearchGroundingView
            currentUser={currentUser}
            onAddPlan={handleAddPlan}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Floating AI Sensei Quick Launcher (Bottom Right) */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        <button
          onClick={() => handleNavigate('ai-sensei')}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#e94560] to-[#f5a623] text-white font-bold text-xs sm:text-sm glow-pink glow-pink-hover shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
          title="Open AI Study Sensei with Gemini"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Ask AI Sensei</span>
        </button>

        <button
          onClick={() => handleNavigate('ai-search')}
          className="p-2.5 rounded-full bg-[#16213e] border border-cyan-400 text-cyan-300 hover:text-white hover:bg-cyan-500/20 shadow-xl transition-all transform hover:scale-105 cursor-pointer"
          title="Search Live Google CS Data"
        >
          <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
        </button>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16213e] border border-amber-400/80 text-white px-4 py-3 rounded-xl shadow-2xl glow-pink text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={(user) => {
          setCurrentUser(user);
          setPlans(StorageService.getUserPlans(user.id));
        }}
        onRedirectToPlanner={() => handleNavigate('planner')}
      />
    </div>
  );
}
