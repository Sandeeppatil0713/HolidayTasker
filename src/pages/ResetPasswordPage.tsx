import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plane, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ResetPasswordPage() {
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,         setLoading]         = useState(false);
  const [done,            setDone]            = useState(false);
  const [validSession,    setValidSession]    = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase puts the access token in the URL hash after redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/login"), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-heading text-foreground">Holiday Tasker</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-12 relative">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-5" />
        </div>
        <div className="absolute inset-0 gradient-mesh opacity-30" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">

          {done ? (
            <div className="auth-form text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="heading">PASSWORD UPDATED</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been reset successfully. Redirecting you to sign in...
              </p>
            </div>
          ) : !validSession ? (
            <div className="auth-form text-center space-y-4">
              <h1 className="heading">INVALID LINK</h1>
              <p className="text-sm text-muted-foreground">
                This reset link is invalid or has expired.
              </p>
              <Link to="/forgot-password" className="btn block text-center">
                Request a new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <h1 className="heading">RESET PASSWORD</h1>
              <p className="text-sm text-muted-foreground text-center -mt-2 mb-2">
                Enter your new password below.
              </p>

              <div className="inputGroup">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input"
                />
                <label htmlFor="password">New Password</label>
              </div>

              <div className="inputGroup">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input"
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
              </div>

              <button type="submit" className="btn" disabled={loading}>
                {loading ? "UPDATING..." : "UPDATE PASSWORD"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
