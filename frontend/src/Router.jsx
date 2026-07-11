import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import AdminAuthPage from './pages/auth/AdminAuthPage';
import MemberAuthPage from './pages/auth/MemberAuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import PantryPage from './pages/pantry/PantryPage';
import ToBuyPage from './pages/buylist/ToBuyPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import FamilyChatPage from './pages/chat/FamilyChatPage';
import AlertCenter from './pages/alerts/AlertCenter';
import RecipesPage from './pages/recipes/RecipesPage';
import MealPlannerPage from './pages/mealplanner/MealPlannerPage';
import BudgetPage from './pages/analytics/BudgetPage';
import BillingPage from './pages/billing/BillingPage';
import ProfileSettingsPage from './pages/settings/ProfileSettingsPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AIRecipePage from './pages/recipes/AIRecipePage';
import NotFoundPage from './pages/error/NotFoundPage';

const router = createBrowserRouter([
  /* ── Public ── */
  { path: '/',                element: <LandingPage /> },
  { path: '/register',        element: <AdminAuthPage /> },
  { path: '/admin/login',     element: <AdminAuthPage /> },
  { path: '/admin/register',  element: <AdminAuthPage /> },
  { path: '/member/login',    element: <MemberAuthPage /> },
  { path: '/member/register', element: <MemberAuthPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  {
    path: '/dashboard',
    element: <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>,
  },
  {
    path: '/billing',
    element: <ProtectedRoute role="admin"><BillingPage /></ProtectedRoute>,
  },
  {
    path: '/recipes',
    element: <ProtectedRoute role="admin"><RecipesPage /></ProtectedRoute>,
  },
  {
    path: '/meal-planner',
    element: <ProtectedRoute role="admin"><MealPlannerPage /></ProtectedRoute>,
  },

  {
    path: '/member-dashboard',
    element: <ProtectedRoute role="member"><MemberDashboard /></ProtectedRoute>,
  },

  /* ── Any Authenticated ── */
  {
    path: '/pantry',
    element: <ProtectedRoute><PantryPage /></ProtectedRoute>,
  },
  {
    path: '/shopping-list',
    element: <ProtectedRoute><ToBuyPage /></ProtectedRoute>,
  },
  {
    path: '/chat',
    element: <ProtectedRoute><FamilyChatPage /></ProtectedRoute>,
  },
  {
    path: '/ai-recipe-generator',
    element: <ProtectedRoute><AIRecipePage /></ProtectedRoute>,
  },
  {
    path: '/alerts',
    element: <ProtectedRoute><AlertCenter /></ProtectedRoute>,
  },
  {
    path: '/budget',
    element: <ProtectedRoute><BudgetPage /></ProtectedRoute>,
  },
  {
    path: '/settings/profile',
    element: <ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
