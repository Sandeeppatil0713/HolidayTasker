import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Calendar, Plus, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const destinations = [
  { name: "Bali, Indonesia", rating: 4.8, season: "Jun–Sep", duration: "7 days", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80", tags: ["Beach", "Culture"] },
  { name: "Kyoto, Japan", rating: 4.9, season: "Mar–May", duration: "5 days", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80", tags: ["Culture", "Food"] },
  { name: "Santorini, Greece", rating: 4.7, season: "Apr–Oct", duration: "6 days", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&q=80", tags: ["Beach", "Romance"] },
  { name: "Banff, Canada", rating: 4.6, season: "Dec–Mar", duration: "4 days", image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&q=80", tags: ["Nature", "Adventure"] },
  { name: "Marrakech, Morocco", rating: 4.5, season: "Oct–Apr", duration: "5 days", image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=400&q=80", tags: ["Culture", "Shopping"] },
  { name: "Reykjavik, Iceland", rating: 4.8, season: "Jun–Aug", duration: "6 days", image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400&q=80", tags: ["Nature", "Adventure"] },
];

const trips = [
  {
    name: "Bali Adventure",
    dates: "Dec 15–22, 2026",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Vacation Planner</h1>
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
              className="rounded-xl card-glass overflow-hidden  hover:shadow-card-hover transition-all cursor-pointer group">
              <div className="relative h-40 overflow-hidden">
                <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold font-heading text-foreground group-hover:text-primary transition-colors">{d.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-accent text-accent" /> {d.rating}
                  <span>•</span>
                  <Calendar className="h-3 w-3" /> {d.season}
                  <span>•</span>
                  <Plane className="h-3 w-3" /> {d.duration}
                </div>
                <div className="flex gap-1.5 mt-3">
                  {d.tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                  ))}
                </div>
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
          <div className="rounded-xl card-glass p-5 ">
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
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>7 days of adventure</span>
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div className="lg:col-span-2 rounded-xl card-glass p-5 ">
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


