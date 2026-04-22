import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, ToggleLeft, ToggleRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="transition-transform hover:scale-110">
      {value ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground/60" />}
    </button>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [maintenance,   setMaintenance]   = useState(false);
  const [emailNotif,    setEmailNotif]    = useState(true);
  const [pushNotif,     setPushNotif]     = useState(false);

  const save = () => toast({ title: "Settings saved" });

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-muted/40 border border-border p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {children}
    </motion.div>
  );

  const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div>
        <p className="text-sm text-white">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading heading-gradient">App Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure global application settings</p>
        </div>
        <Button size="sm" onClick={save} className="gap-2">
          <Save className="h-4 w-4" /> Save All
        </Button>
      </div>

      <Section title="General" icon={Settings}>
        <Row label="Maintenance Mode" desc="Disable access for regular users">
          <Toggle value={maintenance} onChange={() => setMaintenance(p => !p)} />
        </Row>
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Row label="Email Notifications" desc="Send system emails to users">
          <Toggle value={emailNotif} onChange={() => setEmailNotif(p => !p)} />
        </Row>
        <Row label="Push Notifications" desc="Browser push alerts">
          <Toggle value={pushNotif} onChange={() => setPushNotif(p => !p)} />
        </Row>
      </Section>
    </div>
  );
}

