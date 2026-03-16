import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import TasksPage from "./pages/TasksPage";
import VacationsPage from "./pages/VacationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SmartSearchPage from "./pages/SmartSearchPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardHome /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/tasks" element={<ProtectedRoute><DashboardLayout><TasksPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/vacations" element={<ProtectedRoute><DashboardLayout><VacationsPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute><DashboardLayout><AnalyticsPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/search" element={<ProtectedRoute><DashboardLayout><SmartSearchPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/calendar" element={<ProtectedRoute><DashboardLayout><div className="text-center py-20 text-muted-foreground">Calendar coming soon</div></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardLayout><div className="text-center py-20 text-muted-foreground">Settings coming soon</div></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardLayout><div className="text-center py-20 text-muted-foreground">Profile coming soon</div></DashboardLayout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
