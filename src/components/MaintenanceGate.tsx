import { useAuth } from "@/contexts/AuthContext";
import { useMaintenance } from "@/contexts/MaintenanceContext";
import { ShieldAlert, Wrench, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { isAdmin, signOut } = useAuth();
  const { maintenance, checked } = useMaintenance();
  const navigate = useNavigate();

  if (!checked) return null;
  if (!maintenance || isAdmin) return <>{children}</>;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <Wrench className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading heading-gradient">Under Maintenance</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Holiday Tasker is currently undergoing scheduled maintenance. We'll be back shortly!
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Only administrators can access the app during this time.</span>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-1.5" /> Back to Home
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
