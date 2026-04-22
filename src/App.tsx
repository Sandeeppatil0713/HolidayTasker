import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FavouritesProvider } from "./contexts/FavouritesContext";
import { MaintenanceProvider } from "./contexts/MaintenanceContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import MaintenanceGate from "./components/MaintenanceGate";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import TasksPage from "./pages/TasksPage";
import VacationsPage from "./pages/VacationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SmartSearchPage from "./pages/SmartSearchPage";
import FavouritePlacesPage from "./pages/FavouritePlacesPage";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <MaintenanceProvider>
        <FavouritesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><MaintenanceGate><DashboardLayout><TasksPage /></DashboardLayout></MaintenanceGate></ProtectedRoute>} />
              <Route path="/dashboard/tasks" element={<ProtectedRoute><MaintenanceGate><DashboardLayout><TasksPage /></DashboardLayout></MaintenanceGate></ProtectedRoute>} />
              <Route path="/dashboard/vacations" element={<ProtectedRoute><MaintenanceGate><DashboardLayout><VacationsPage /></DashboardLayout></MaintenanceGate></ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute><MaintenanceGate><DashboardLayout><AnalyticsPage /></DashboardLayout></MaintenanceGate></ProtectedRoute>} />
              <Route path="/dashboard/search" element={<ProtectedRoute><MaintenanceGate><DashboardLayout><SmartSearchPage /></DashboardLayout></MaintenanceGate></ProtectedRoute>} />
              <Route path="/dashboard/favourites" element={<ProtectedRoute><MaintenanceGate><DashboardLayout><FavouritePlacesPage /></DashboardLayout></MaintenanceGate></ProtectedRoute>} />
              <Route path="/dashboard/calendar" element={<ProtectedRoute><MaintenanceGate><DashboardLayout><CalendarPage /></DashboardLayout></MaintenanceGate></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><MaintenanceGate><DashboardLayout><SettingsPage /></DashboardLayout></MaintenanceGate></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><MaintenanceGate><DashboardLayout><ProfilePage /></DashboardLayout></MaintenanceGate></ProtectedRoute>} />
              {/* Admin routes */}
              <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
              <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminLayout><AdminAnalytics /></AdminLayout></AdminRoute>} />
              <Route path="/admin/notifications" element={<AdminRoute><AdminLayout><AdminNotifications /></AdminLayout></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
              <Route path="/admin/profile" element={<AdminRoute><AdminLayout><AdminProfile /></AdminLayout></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </FavouritesProvider>
        </MaintenanceProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
