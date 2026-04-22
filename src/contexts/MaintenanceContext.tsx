import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface MaintenanceContextType {
  maintenance: boolean;
  checked: boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType>({ maintenance: false, checked: false });

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState(false);
  const [checked,     setChecked]     = useState(false);

  useEffect(() => {
    // Initial fetch for both keys
    supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["maintenance_mode"])
      .then(({ data }) => {
        data?.forEach(({ key, value }) => {
          if (key === "maintenance_mode") setMaintenance(value === "true");
        });
        setChecked(true);
      });

    // Realtime — watch all app_settings changes
    const channel = supabase
      .channel("app_settings_global")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "app_settings",
      }, (payload: any) => {
        const { key, value } = payload.new ?? {};
        if (key === "maintenance_mode") setMaintenance(value === "true");
        if (key === "force_signout" && value === "true") {
          // Sign out this user session immediately
          supabase.auth.signOut();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <MaintenanceContext.Provider value={{ maintenance, checked }}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance() {
  return useContext(MaintenanceContext);
}
