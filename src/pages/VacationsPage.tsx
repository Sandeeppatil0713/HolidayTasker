import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Calendar, DollarSign, Plus, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const destinations = [
  { name: "Bali, Indonesia", rating: 4.8, season: "Jun–Sep", budget: "$1,200", image: "🏝️", tags: ["Beach", "Culture"] },
  { name: "Kyoto, Japan", rating: 4.9, season: "Mar–May", budget: "$2,000", image: "⛩️", tags: ["Culture", "Food"] },
  { name: "Santorini, Greece", rating: 4.7, season: "Apr–Oct", budget: "$1,800", image: "🏛️", tags: ["Beach", "Romance"] },
  { name: "Banff, Canada", rating: 4.6, season: "Dec–Mar", budget: "$1,500", image: "🏔️", tags: ["Nature", "Adventure"] },
  { name: "Marrakech, Morocco", rating: 4.5, season: "Oct–Apr", budget: "$900", image: "🕌", tags: ["Culture", "Shopping"] },
  { name: "Reykjavik, Iceland", rating: 4.8, season: "Jun–Aug", budget: "$2,200", image: "🌋", tags: ["Nature", "Adventure"] },
];

const trips = [
  {
    name: "Bali Adventure",
    dates: "Dec 15–22, 2026",
    budget: 2500,
    spent: 800,
    days: [
      { day: 1, activities: ["Arrive at Denpasar", "Check into villa", "Sunset at Tanah Lot"] },
      { day: 2, activities: ["Ubud rice terraces", "Monkey Forest", "Spa treatment"] },
      { day: 3, activities: ["Snorkeling at Nusa Penida", "Beach lunch", "Night market"] },
    ],
  },
];

const VacationsPage = () => {
  const [search, setSearch] = useState("");
  const [activeTrip, setActiveTrip] = useState(0);

  const filtered = destinations.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const trip = trips[activeTrip];
  const budgetPercent = (trip.spent / trip.budget) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Vacation Planner</h1>
        <p className="text-sm text-muted-foreground">Discover destinations and plan your dream trips</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <Input placeholder="Search destinations, activities..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        <Button variant="outline"><MapPin className="h-4 w-4 mr-1" /> Trending</Button>
      </div>

      {/* Destinations */}
      <div>
        <h2 className="text-lg font-semibold font-heading text-foreground mb-4">Discover Destinations</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d, i) => (
            <motion.div key={d.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-card p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all cursor-pointer group">
              <div className="text-4xl mb-3">{d.image}</div>
              <h3 className="font-semibold font-heading text-foreground group-hover:text-primary transition-colors">{d.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-accent text-accent" /> {d.rating}
                <span>•</span>
                <Calendar className="h-3 w-3" /> {d.season}
                <span>•</span>
                <DollarSign className="h-3 w-3" /> {d.budget}
              </div>
              <div className="flex gap-1.5 mt-3">
                {d.tags.map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trip planner */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-heading text-foreground">My Trips</h2>
          <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> New Trip</Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trip overview */}
          <div className="rounded-xl bg-card p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm font-heading text-foreground">{trip.name}</h3>
                <p className="text-xs text-muted-foreground">{trip.dates}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-medium text-foreground">${trip.spent} / ${trip.budget}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${budgetPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div className="lg:col-span-2 rounded-xl bg-card p-5 shadow-card border border-border/50">
            <h3 className="font-semibold text-sm font-heading text-foreground mb-4">Itinerary</h3>
            <div className="space-y-4">
              {trip.days.map((day) => (
                <div key={day.day}>
                  <div className="text-xs font-semibold text-primary mb-1.5">Day {day.day}</div>
                  <div className="space-y-1.5 pl-3 border-l-2 border-primary/20">
                    {day.activities.map((a) => (
                      <div key={a} className="text-sm text-muted-foreground">{a}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationsPage;
