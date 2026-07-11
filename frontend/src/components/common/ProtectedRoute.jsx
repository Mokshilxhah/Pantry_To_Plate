import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import { useState, useEffect } from 'react';

/**
 * ProtectedRoute – Role-based route guard.
 * 
 * Usage:
 *   <ProtectedRoute role="admin">   → only admins
 *   <ProtectedRoute role="member">  → only members
 *   <ProtectedRoute>               → any authenticated user
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, role: userRole } = useAuthStore();
  const { warning } = useToastStore.getState();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Enforce hydration completion check
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setIsHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F]">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    warning(`This page is only accessible to ${role}s.`);
    if (userRole === 'admin') return <Navigate to="/dashboard" replace />;
    if (userRole === 'member') return <Navigate to="/member-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
