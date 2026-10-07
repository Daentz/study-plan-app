import { ContactMessage, StudyPlan, User } from '../types';
import { DEFAULT_USERS, INITIAL_PLANS } from '../data/initialData';

const USERS_STORAGE_KEY = 'study_plan_users_v1';
const PLANS_STORAGE_KEY = 'study_plan_sessions_v1';
const CURRENT_USER_COOKIE_NAME = 'study_plan_session_user';
const CONTACT_MESSAGES_KEY = 'study_plan_contact_msgs_v1';

const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest',
  email: 'guest@example.com',
  studentYear: 'Not signed in',
  registrationNumber: '',
  avatarSeed: 'guest',
};

// Cookie helpers
function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export const StorageService = {
  init() {
    // Seed users if empty
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    }
    // Seed plans if empty
    if (!localStorage.getItem(PLANS_STORAGE_KEY)) {
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(INITIAL_PLANS));
    }
  },

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  },

  getCurrentUser(): User {
    this.init();
    const cookieUserId = getCookie(CURRENT_USER_COOKIE_NAME);
    const users = this.getUsers();

    if (cookieUserId) {
      const found = users.find((u) => u.id === cookieUserId);
      if (found) return found;
    }

       // Not signed in: use the Guest user
    return GUEST_USER;
  },

  setCurrentUser(user: User) {
    setCookie(CURRENT_USER_COOKIE_NAME, user.id);
  },

    logoutUser(): User {
    deleteCookie(CURRENT_USER_COOKIE_NAME);
    return GUEST_USER;
  },

  registerUser(name: string, email: string, studentYear: string, regNumber?: string): User {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.setCurrentUser(existing);
      return existing;
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      name: name.trim() || ' ',
      email: email.trim().toLowerCase(),
      studentYear: studentYear.trim() || 'Year 1 Computer Science',
      registrationNumber: regNumber?.trim() || `CS/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      avatarSeed: `seed_${Math.random().toString(36).substring(2, 8)}`,
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    this.setCurrentUser(newUser);

    // Seed 2 initial welcome study plans for this new user
    const newPlans: StudyPlan[] = [
      {
        id: 'plan_' + Date.now(),
        userId: newUser.id,
        subject: 'Introduction to Algorithms: Big-O Asymptotic Notation',
        category: 'Computer Studies',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: 60,
        done: false,
        notes: 'Initial study goal setup',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'plan_' + (Date.now() + 1),
        userId: newUser.id,
        subject: 'Calculus: Derivatives and Optimization Problems',
        category: 'Mathematics',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        duration: 90,
        done: false,
        notes: 'Review chain rule and tangent slopes',
        createdAt: new Date().toISOString(),
      },
    ];

    const currentAllPlans = this.getAllPlans();
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify([...currentAllPlans, ...newPlans]));

    return newUser;
  },

  getAllPlans(): StudyPlan[] {
    try {
      const data = localStorage.getItem(PLANS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_PLANS;
    } catch {
      return INITIAL_PLANS;
    }
  },

  getUserPlans(userId: string): StudyPlan[] {
    this.init();
    const all = this.getAllPlans();
    return all.filter((p) => p.userId === userId);
  },

  addPlan(plan: Omit<StudyPlan, 'id' | 'createdAt'>): StudyPlan {
    const newPlan: StudyPlan = {
      ...plan,
      id: 'plan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString(),
    };
    const all = this.getAllPlans();
    const updated = [newPlan, ...all];
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updated));
    return newPlan;
  },

  togglePlanDone(planId: string): StudyPlan | null {
    const all = this.getAllPlans();
    let updatedPlan: StudyPlan | null = null;
    const updated = all.map((p) => {
      if (p.id === planId) {
        updatedPlan = { ...p, done: !p.done };
        return updatedPlan;
      }
      return p;
    });
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updated));
    return updatedPlan;
  },

  updatePlan(updatedPlan: StudyPlan) {
    const all = this.getAllPlans();
    const updated = all.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updated));
  },

  deletePlan(planId: string) {
    const all = this.getAllPlans();
    const updated = all.filter((p) => p.id !== planId);
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updated));
  },

  resetUserPlansToSample(userId: string): StudyPlan[] {
    const all = this.getAllPlans().filter((p) => p.userId !== userId);
    const samplePlans = INITIAL_PLANS.map((p) => ({
      ...p,
      id: 'plan_' + Math.random().toString(36).substring(2, 9),
      userId,
    }));
    const updated = [...all, ...samplePlans];
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updated));
    return samplePlans;
  },

  saveContactMessage(msg: Omit<ContactMessage, 'submittedAt'>) {
    try {
      const existingStr = localStorage.getItem(CONTACT_MESSAGES_KEY);
      const existing: ContactMessage[] = existingStr ? JSON.parse(existingStr) : [];
      const newMsg: ContactMessage = {
        ...msg,
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify([newMsg, ...existing]));
      return true;
    } catch {
      return false;
    }
  },
};
