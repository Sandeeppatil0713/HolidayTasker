import { useState } from "react";
import { Shield, Bell, Globe, Lock, Save, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminSettings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Holiday Tasker",
    supportEmail: "support@holidaytasker.com",
    maxUsersPerPlan: "100",
    maintenanceMode: false,
    emailNotifications: true,
    pushNotifications: true,
    twoFactor: false,
    sessionTimeout: "30",
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-100 flex items-center gap-2">
        <Icon className="w-4 h-4 text-indigo-500" /> {title}
      </h3>
      {children}
    </div>
  );

  const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm text-slate-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );

  const Toggle = ({ label, desc, value, onToggle }: { label: string; desc: string; value: boolean; onToggle: () => void }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-gray-300">{label}</p>
        <p className="text-xs text-slate-400 dark:text-gray-500">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? "bg-indigo-600" : "bg-slate-200 dark:bg-gray-700"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">Manage app configuration and admin profile</p>
      </div>

      {/* Admin profile */}
      <Section icon={User} title="Admin Profile">
        <div className="flex items-center gap-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-gray-100">
              {user?.user_metadata?.username || "Admin"}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              Super Admin
            </span>
          </div>
        </div>
      </Section>

      {/* General */}
      <Section icon={Globe} title="General">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Site Name"      value={settings.siteName}        onChange={(v) => setSettings((p) => ({ ...p, siteName: v }))} />
          <Field label="Support Email"  value={settings.supportEmail}    onChange={(v) => setSettings((p) => ({ ...p, supportEmail: v }))} />
          <Field label="Max Users/Plan" value={settings.maxUsersPerPlan} onChange={(v) => setSettings((p) => ({ ...p, maxUsersPerPlan: v }))} />
          <Field label="Session Timeout (min)" value={settings.sessionTimeout} onChange={(v) => setSettings((p) => ({ ...p, sessionTimeout: v }))} />
        </div>
        <Toggle label="Maintenance Mode" desc="Temporarily disable access for regular users" value={settings.maintenanceMode} onToggle={() => toggle("maintenanceMode")} />
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <Toggle label="Email Notifications" desc="Send system alerts via email"        value={settings.emailNotifications} onToggle={() => toggle("emailNotifications")} />
        <Toggle label="Push Notifications"  desc="Enable browser push notifications"  value={settings.pushNotifications}  onToggle={() => toggle("pushNotifications")} />
      </Section>

      {/* Security */}
      <Section icon={Lock} title="Security">
        <Toggle label="Two-Factor Authentication" desc="Require 2FA for all admin accounts" value={settings.twoFactor} onToggle={() => toggle("twoFactor")} />
      </Section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
        {saved && <span className="text-sm text-emerald-500 font-medium">Saved successfully ✓</span>}
      </div>
    </div>
  );
}
