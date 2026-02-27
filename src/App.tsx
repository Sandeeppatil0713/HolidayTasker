import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
          <Route path="/dashboard/tasks" element={<DashboardLayout><TasksPage /></DashboardLayout>} />
          <Route path="/dashboard/vacations" element={<DashboardLayout><VacationsPage /></DashboardLayout>} />
          <Route path="/dashboard/analytics" element={<DashboardLayout><AnalyticsPage /></DashboardLayout>} />
          <Route path="/dashboard/search" element={<DashboardLayout><SmartSearchPage /></DashboardLayout>} />
          <Route path="/dashboard/calendar" element={<DashboardLayout><div className="text-center py-20 text-muted-foreground">Calendar coming soon</div></DashboardLayout>} />
          <Route path="/dashboard/budget" element={<DashboardLayout><div className="text-center py-20 text-muted-foreground">Budget Tracker coming soon</div></DashboardLayout>} />
          <Route path="/dashboard/settings" element={<DashboardLayout><div className="text-center py-20 text-muted-foreground">Settings coming soon</div></DashboardLayout>} />
          <Route path="/dashboard/profile" element={<DashboardLayout><div className="text-center py-20 text-muted-foreground">Profile coming soon</div></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
