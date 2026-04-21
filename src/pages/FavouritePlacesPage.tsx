<<<<<<< HEAD
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Star, Trash2, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavourites } from "@/contexts/FavouritesContext";
import { Button } from "@/components/ui/button";

const formatType = (type: string) =>
  type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function FavouritePlacesPage() {
  const { favourites, removeFavourite } = useFavourites();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
=======
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MapPin, Star, Plane, Calendar, Wand2,
  Clock, Utensils, Hotel, Landmark, ChevronDown, ChevronUp, Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFavourites, FavouritePlace } from "@/contexts/FavouritesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ── helpers ── */
const formatType = (t: string) =>
  t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function daysBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / 86400000) + 1);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getTypeIcon(types: string[]) {
  if (types.some(t => t.includes("lodging") || t.includes("hotel"))) return Hotel;
  if (types.some(t => t.includes("restaurant") || t.includes("food"))) return Utensils;
  return Landmark;
}

/* ── Itinerary generator ── */
interface DayPlan {
  date: string;
  morning: FavouritePlace | null;
  afternoon: FavouritePlace | null;
  evening: FavouritePlace | null;
  hotel: FavouritePlace | null;
  restaurant: FavouritePlace | null;
}

function generateItinerary(places: FavouritePlace[], startDate: string, endDate: string): DayPlan[] {
  const days = daysBetween(startDate, endDate);

  // Separate by type
  const hotels      = places.filter(p => p.types.some(t => t.includes("lodging")));
  const restaurants = places.filter(p => p.types.some(t => t.includes("restaurant") || t.includes("food")));
  const attractions = places.filter(p => !p.types.some(t => t.includes("lodging") || t.includes("restaurant") || t.includes("food")));

  // Cycle through attractions — 3 slots per day (morning, afternoon, evening)
  let attrIdx = 0;
  const plans: DayPlan[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    plans.push({
      date: date.toISOString().split("T")[0],
      morning:   attractions[attrIdx++ % Math.max(attractions.length, 1)] ?? null,
      afternoon: attractions[attrIdx++ % Math.max(attractions.length, 1)] ?? null,
      evening:   attractions[attrIdx++ % Math.max(attractions.length, 1)] ?? null,
      hotel:      hotels[i % Math.max(hotels.length, 1)] ?? null,
      restaurant: restaurants[i % Math.max(restaurants.length, 1)] ?? null,
    });
  }
  return plans;
}

/* ── Sub-components ── */
function PlaceChip({ place, slot }: { place: FavouritePlace | null; slot: string }) {
  if (!place) return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground italic">
      <Clock className="h-3.5 w-3.5 shrink-0" /> {slot} — Free time
    </div>
  );
  const Icon = getTypeIcon(place.types);
  return (
    <div className="flex items-center gap-3 rounded-lg bg-card/60 border border-border/40 px-3 py-2.5 hover:border-primary/30 transition-all">
      {place.photo
        ? <img src={place.photo} alt={place.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
        : <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
      }
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{place.name}</p>
        <p className="text-xs text-muted-foreground truncate">{place.vicinity}</p>
      </div>
      {place.rating && (
        <div className="flex items-center gap-1 shrink-0">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-foreground">{place.rating}</span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════ */
export default function FavouritePlacesPage() {
  const { favourites, removeFavourite } = useFavourites();
  const [startDate, setStartDate]       = useState("");
  const [endDate,   setEndDate]         = useState("");
  const [itinerary, setItinerary]       = useState<DayPlan[]>([]);
  const [expanded,  setExpanded]        = useState<number | null>(0);
  const [generated, setGenerated]       = useState(false);

  const canGenerate = favourites.length > 0 && startDate && endDate && endDate >= startDate;

  const handleGenerate = () => {
    const plan = generateItinerary(favourites, startDate, endDate);
    setItinerary(plan);
    setGenerated(true);
    setExpanded(0);
  };

  const handleReset = () => { setItinerary([]); setGenerated(false); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
>>>>>>> main
        <div>
          <h1 className="text-2xl font-bold font-heading heading-gradient">Favourite Places</h1>
          <p className="text-sm text-muted-foreground">
            {favourites.length} saved {favourites.length === 1 ? "place" : "places"}
          </p>
        </div>
<<<<<<< HEAD
        {favourites.length > 0 && (
          <Link to="/dashboard/vacations">
            <Button size="sm" variant="outline">
              <Plane className="h-4 w-4 mr-1" /> Explore More
            </Button>
          </Link>
        )}
      </div>

      {favourites.length === 0 ? (
=======
        <Link to="/dashboard/vacations">
          <Button size="sm" variant="outline">
            <Plane className="h-4 w-4 mr-1" /> Explore More
          </Button>
        </Link>
      </div>

      {favourites.length === 0 ? (
        /* Empty state */
>>>>>>> main
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-primary/40" />
          </div>
          <h3 className="text-lg font-semibold font-heading text-foreground mb-2">No favourites yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Search for a destination in the Vacation Planner and tap the heart icon to save places here.
          </p>
          <Link to="/dashboard/vacations">
            <Button><Plane className="h-4 w-4 mr-1" /> Go to Vacation Planner</Button>
          </Link>
        </motion.div>
      ) : (
<<<<<<< HEAD
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {favourites.map((place, i) => (
              <motion.div key={place.placeId}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl card-glass overflow-hidden group hover:shadow-card-hover transition-all">
                {/* Photo */}
                <div className="relative h-44 overflow-hidden bg-muted">
                  {place.photo
                    ? <img src={place.photo} alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* Remove button */}
                  <button
                    onClick={() => removeFavourite(place.placeId)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/80 transition-colors group/btn">
                    <Heart className="h-4 w-4 fill-red-400 text-red-400 group-hover/btn:fill-white group-hover/btn:text-white transition-colors" />
                  </button>
                  {/* Added date */}
                  <span className="absolute bottom-2 left-3 text-[10px] text-white/70">
                    Saved {place.addedAt}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold font-heading text-foreground truncate group-hover:text-primary transition-colors">
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{place.vicinity}</span>
                  </div>
                  {place.rating && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-foreground">{place.rating}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {place.types
                      .filter((t) => t !== "point_of_interest" && t !== "establishment")
                      .slice(0, 2)
                      .map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {formatType(t)}
                        </span>
                      ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
=======
        <>
          {/* ── Saved places grid ── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {favourites.map((place, i) => (
                <motion.div key={place.placeId}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                  className="rounded-xl card-glass overflow-hidden group hover:shadow-card-hover transition-all">
                  <div className="relative h-40 overflow-hidden bg-muted">
                    {place.photo
                      ? <img src={place.photo} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button onClick={() => removeFavourite(place.placeId)}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/80 transition-colors group/btn">
                      <Heart className="h-4 w-4 fill-red-400 text-red-400 group-hover/btn:fill-white group-hover/btn:text-white transition-colors" />
                    </button>
                    <span className="absolute bottom-2 left-3 text-[10px] text-white/70">Saved {place.addedAt}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold font-heading text-foreground truncate group-hover:text-primary transition-colors">{place.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{place.vicinity}</span>
                    </div>
                    {place.rating && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-foreground">{place.rating}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {place.types.filter(t => t !== "point_of_interest" && t !== "establishment").slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{formatType(t)}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Itinerary Generator ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl card-glass p-6 border border-primary/20">
            <h2 className="text-lg font-semibold font-heading heading-gradient mb-1 flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" /> Generate Itinerary
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Pick your travel dates and we'll build a day-by-day plan using your saved places.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Start Date
                </label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> End Date
                </label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]} />
              </div>
              <Button onClick={handleGenerate} disabled={!canGenerate} className="gap-2 shrink-0">
                <Wand2 className="h-4 w-4" /> Generate
              </Button>
              {generated && (
                <Button variant="outline" onClick={handleReset} className="shrink-0">Reset</Button>
              )}
            </div>

            {startDate && endDate && endDate >= startDate && (
              <p className="text-xs text-muted-foreground mt-2">
                {daysBetween(startDate, endDate)} day{daysBetween(startDate, endDate) > 1 ? "s" : ""} trip
                · {formatDate(startDate)} → {formatDate(endDate)}
              </p>
            )}
          </motion.div>

          {/* ── Generated Itinerary ── */}
          <AnimatePresence>
            {generated && itinerary.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold font-heading heading-gradient">
                    Your {itinerary.length}-Day Itinerary
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(startDate)} – {formatDate(endDate)}
                  </span>
                </div>

                {itinerary.map((day, i) => (
                  <motion.div key={day.date}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="rounded-xl card-glass border border-border/50 overflow-hidden">
                    {/* Day header */}
                    <button onClick={() => setExpanded(expanded === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-primary/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold font-heading text-primary">{i + 1}</span>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-foreground">Day {i + 1}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(day.date)}</p>
                        </div>
                      </div>
                      {expanded === i
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>

                    {/* Day detail */}
                    <AnimatePresence>
                      {expanded === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                          className="overflow-hidden">
                          <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">

                            {/* Slots */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Attractions</p>
                              <div className="grid sm:grid-cols-3 gap-2">
                                {[
                                  { slot: "🌅 Morning",   place: day.morning },
                                  { slot: "☀️ Afternoon", place: day.afternoon },
                                  { slot: "🌆 Evening",   place: day.evening },
                                ].map(({ slot, place }) => (
                                  <PlaceChip key={slot} slot={slot} place={place} />
                                ))}
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3 pt-1">
                              {/* Hotel */}
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                  <Hotel className="h-3.5 w-3.5" /> Stay
                                </p>
                                <PlaceChip slot="🏨 Hotel" place={day.hotel} />
                              </div>
                              {/* Restaurant */}
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                  <Utensils className="h-3.5 w-3.5" /> Dining
                                </p>
                                <PlaceChip slot="🍽️ Restaurant" place={day.restaurant} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
>>>>>>> main
      )}
    </div>
  );
}
