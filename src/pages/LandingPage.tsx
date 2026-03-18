import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle2, Plane, BarChart3, Search, PieChart, Star, ArrowRight, Twitter, Github, Linkedin, MapPin, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: CheckCircle2, title: "Smart To-Do Management", desc: "Organize tasks with priorities, categories, and smart reminders that keep you productive.", color: "text-primary" },
  { icon: Plane, title: "Vacation Planner", desc: "Discover destinations, build itineraries, and plan every detail of your dream trips.", color: "text-secondary" },
  { icon: Search, title: "Smart Search", desc: "Find anything instantly — tasks, trips, notes — with powerful filters.", color: "text-primary" },
  { icon: PieChart, title: "Analytics Dashboard", desc: "Beautiful charts showing your productivity trends, travel stats, and spending.", color: "text-secondary" },
  { icon: Calendar, title: "Calendar Integration", desc: "See your tasks and trips in a unified calendar view for perfect planning.", color: "text-accent" },
];

const testimonials = [
  { name: "Sarah Chen", role: "Product Manager", text: "Holiday Tasker transformed how I balance work deadlines with vacation planning. The integrated approach is genius!", avatar: "SC" },
  { name: "Marcus Rivera", role: "Digital Nomad", text: "Finally an app that understands both productivity and travel. The smart search alone saved me hours of planning.", avatar: "MR" },
  { name: "Emily Watson", role: "Travel Blogger", text: "The itinerary builder and smart search make trip planning effortless. I recommend it to all my followers.", avatar: "EW" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const } }),
};

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background font-body">
      {/* SVG Filter for Gooey Effect */}
      <svg style={{ visibility: 'hidden', position: 'absolute' }} width="0" height="0" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-heading text-foreground">Holiday Tasker</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Testimonials</a>
            <ThemeToggle />
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user.user_metadata?.username?.split(' ')[0]}</span>
                </div>
                <Link to="/dashboard">
                  <button className="c-button c-button--gooey">
                    Go to Dashboard
                    <div className="c-button__blobs">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button size="sm" variant="outline" className="mr-2">Log In</Button>
                </Link>
                <Link to="/signup">
                  <button className="c-button c-button--gooey">
                    Get Started
                    <div className="c-button__blobs">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 gradient-mesh opacity-40"></div>
        
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1920&q=80" alt="" className="h-full w-full object-cover" />
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute top-20 left-10 md:left-20 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center animate-float"
          >
            <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="absolute top-32 right-10 md:right-24 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-secondary/20 backdrop-blur-sm flex items-center justify-center animate-float"
            style={{ animationDelay: '1s' }}
          >
            <Plane className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="absolute bottom-32 left-16 md:left-32 w-14 h-14 md:w-16 md:h-16 rounded-xl bg-accent/20 backdrop-blur-sm flex items-center justify-center animate-float"
            style={{ animationDelay: '2s' }}
          >
            <Calendar className="w-7 h-7 md:w-8 md:h-8 text-accent" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="absolute bottom-40 right-20 md:right-40 w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center animate-float"
            style={{ animationDelay: '1.5s' }}
          >
            <BarChart3 className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-secondary/20 backdrop-blur-sm flex items-center justify-center animate-pulse-soft"
          >
            <MapPin className="w-6 h-6 text-secondary" />
          </motion.div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div className="max-w-4xl mx-auto text-center" initial="hidden" animate="visible">
            <motion.h1 variants={fadeUp} custom={0} className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading heading-gradient leading-tight mb-8">
              Plan Your Tasks. Plan Your Trips. Live Balanced.
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              The all-in-one productivity platform that seamlessly combines daily task management with vacation planning.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <button className="c-button c-button--gooey">
                  Get Started
                  <div className="c-button__blobs">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </button>
              </Link>
              <a href="#features">
                <button className="c-button c-button--gooey-outline">
                  Explore Features
                  <div className="c-button__blobs">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </button>
              </a>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible" className="mt-20 grid grid-cols-3 max-w-lg mx-auto gap-8">
            {[{ num: "10K+", label: "Active Users" }, { num: "50K+", label: "Tasks Completed" }, { num: "2K+", label: "Trips Planned" }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold font-heading text-primary">{s.num}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 gradient-soft opacity-30"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold font-heading heading-gradient mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Powerful features designed to help you stay productive at work and adventurous on vacations.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="group rounded-xl bg-card/80 backdrop-blur-sm p-6 shadow-card hover:shadow-glow transition-all duration-300 border border-border/50 hover:border-primary/30">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold font-heading text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold font-heading heading-gradient mb-4">See It In Action</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A glimpse into the beautiful, intuitive dashboard that makes productivity a joy.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-hero border border-primary/20 bg-card/80 backdrop-blur-sm p-6 md:p-10">
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: CheckCircle2, title: "Today's Tasks", items: ["Review Q4 report", "Book flight to Bali", "Team standup at 10am"], color: "bg-primary/10 text-primary" },
                { icon: MapPin, title: "Upcoming Trip", items: ["Bali, Indonesia", "Dec 15 – Dec 22", "7 days adventure"], color: "bg-secondary/10 text-secondary" },
                { icon: BarChart3, title: "This Week", items: ["12 tasks completed", "85% productivity", "2 trips planned"], color: "bg-accent/10 text-accent" },
              ].map((card) => (
                <div key={card.title} className="rounded-xl bg-gradient-to-br from-card to-muted/30 p-4 border border-border/30 hover:border-primary/30 transition-all">
                  <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.color} mb-3`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-sm font-heading text-foreground mb-2">{card.title}</h4>
                  <ul className="space-y-1.5">
                    {card.items.map((item) => (
                      <li key={item} className="text-xs text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 gradient-soft opacity-20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold font-heading heading-gradient mb-4">Loved by Thousands</h2>
            <p className="text-muted-foreground">See what our users have to say about Holiday Tasker.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="rounded-xl bg-card/60 backdrop-blur-md p-6 shadow-card border border-border/50 hover:bg-card/80 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-40"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center rounded-2xl gradient-hero p-12 md:p-16 shadow-hero border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary-foreground mb-4">Ready to Get Started?</h2>
            <p className="text-primary-foreground/90 mb-8">Join thousands of users who manage their tasks and trips in one place.</p>
            <Link to="/signup">
              <button className="c-button c-button--gooey-white">
                Start Free Today
                <div className="c-button__blobs">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
                <Plane className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold font-heading text-foreground">Holiday Tasker</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            </div>
            
            {/* Animated Social Icons */}
            <ul className="flex items-center gap-3 list-none">
              <li className="relative group">
                <a href="#" className="flex items-center justify-center w-12 h-12 bg-card rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 hover:bg-primary">
                  <Twitter className="h-5 w-5 text-foreground group-hover:text-white transition-colors" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 group-hover:-top-12 transition-all duration-300 pointer-events-none whitespace-nowrap after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-primary after:rotate-45">
                    Twitter
                  </span>
                </a>
              </li>
              <li className="relative group">
                <a href="#" className="flex items-center justify-center w-12 h-12 bg-card rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 hover:bg-secondary">
                  <Github className="h-5 w-5 text-foreground group-hover:text-white transition-colors" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 group-hover:-top-12 transition-all duration-300 pointer-events-none whitespace-nowrap after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-secondary after:rotate-45">
                    Github
                  </span>
                </a>
              </li>
              <li className="relative group">
                <a href="#" className="flex items-center justify-center w-12 h-12 bg-card rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 hover:bg-accent">
                  <Linkedin className="h-5 w-5 text-foreground group-hover:text-white transition-colors" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 group-hover:-top-12 transition-all duration-300 pointer-events-none whitespace-nowrap after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-accent after:rotate-45">
                    LinkedIn
                  </span>
                </a>
              </li>
            </ul>
          </div>
          <div className="text-center mt-8 text-xs text-muted-foreground">© 2026 Holiday Tasker. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


