import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plane, Mail, Lock, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }

    if (username.trim().length < 3) {
      toast({
        title: "Error",
        description: "Username must be at least 3 characters",
        variant: "destructive",
      });
      return;
    }

    if (username.trim().length > 30) {
      toast({
        title: "Error",
        description: "Username must be 30 characters or less",
        variant: "destructive",
      });
      return;
    }

    // Validate email format and block disposable/fake domains
    const lowerEmail = email.toLowerCase();
    const emailFormatRegex = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;
    if (!emailFormatRegex.test(lowerEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    const disposableDomains = [
      "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
      "fakeinbox.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
      "guerrillamail.info", "spam4.me", "trashmail.com", "yopmail.com",
      "maildrop.cc", "dispostable.com", "mailnull.com", "spamgourmet.com",
      "trashmail.me", "discard.email", "spamfree24.org", "getairmail.com",
      "filzmail.com", "throwam.com", "tempr.email", "dispostable.com",
      "mailnesia.com", "spamgourmet.net", "spamgourmet.org", "trashmail.at",
      "trashmail.io", "trashmail.xyz", "temp-mail.org", "tempinbox.com",
    ];

    const emailDomain = lowerEmail.split("@")[1];
    if (disposableDomains.includes(emailDomain)) {
      toast({
        title: "Invalid Email",
        description: "Disposable or temporary email addresses are not allowed",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, username);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account created! Please check your email to verify your account.",
      });
      navigate("/login");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-12 relative">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-5" />
        </div>
        <div className="absolute inset-0 gradient-mesh opacity-30"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <form onSubmit={handleSubmit} className="auth-form">
            <h1 className="heading">CREATE ACCOUNT</h1>

            <div className="inputGroup">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input"
              />
              <label htmlFor="username">Username</label>
            </div>

            <div className="inputGroup">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
              <label htmlFor="email">Email Address</label>
            </div>

            <div className="inputGroup">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
              <label htmlFor="password">Password</label>
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

            <button
              type="submit"
              className="btn"
              disabled={loading}
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;


