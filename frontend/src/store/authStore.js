import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Namespaced key to avoid collisions between different users/sessions
const STORAGE_KEY = 'ptp_auth_v2';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,         // 'admin' | 'member'
      kitchenId: null,    // Scopes all API data
      plan: 'free',       // 'free' | 'pro' | 'premium'
      memberLimit: 2,     // 2 | 5 | -1 (unlimited)
      isAuthenticated: false,

      login: (userData, token) => set({
        user: userData,
        token,
        role: userData.role,
        kitchenId: userData.kitchen_id || null,
        plan: userData.plan || 'free',
        memberLimit: userData.member_limit || 2,
        isAuthenticated: true,
      }),

      // Update plan after upgrade (keeps user/token intact)
      updatePlan: (plan, memberLimit) => set({
        plan,
        memberLimit,
        user: { ...get().user, plan, member_limit: memberLimit },
      }),

      // Update basic user profile information
      updateUser: (updatedUserData) => set({
        user: { ...get().user, ...updatedUserData },
      }),

      logout: () => {
        // Completely wipe active session storage key on logout
        localStorage.removeItem(STORAGE_KEY);
        set({
          user: null,
          token: null,
          role: null,
          kitchenId: null,
          plan: 'free',
          memberLimit: 2,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      // Only persist these fields — never persist sensitive in-flight state
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        kitchenId: state.kitchenId,
        plan: state.plan,
        memberLimit: state.memberLimit,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const getStorageKey = (key) => {
  try {
    const authSaved = localStorage.getItem(STORAGE_KEY);
    if (authSaved) {
      const auth = JSON.parse(authSaved);
      const userId = auth?.state?.user?.id || 'guest';
      return `ptp_${userId}_${key}`;
    }
  } catch (e) {}
  return `ptp_guest_${key}`;
};
