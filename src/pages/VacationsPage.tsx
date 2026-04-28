import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, Calendar, Plane, Search, Loader2, X, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";
import { useFavourites } from "@/contexts/FavouritesContext";

const destinations = [
  { name: "Bali, Indonesia",    searchQuery: "Bali, Indonesia",    rating: 4.8, season: "Jun–Sep", duration: "7 days", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",  tags: ["Beach", "Culture"] },
  { name: "Kyoto, Japan",       searchQuery: "Kyoto, Japan",       rating: 4.9, season: "Mar–May", duration: "5 days", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80",  tags: ["Culture", "Food"] },
  { name: "Santorini, Greece",  searchQuery: "Santorini, Greece",  rating: 4.7, season: "Apr–Oct", duration: "6 days", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&q=80",  tags: ["Beach", "Romance"] },
  { name: "Banff, Canada",      searchQuery: "Banff, Canada",      rating: 4.6, season: "Dec–Mar", duration: "4 days", image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&q=80",  tags: ["Nature", "Adventure"] },
  { name: "Marrakech, Morocco", searchQuery: "Marrakech, Morocco", rating: 4.5, season: "Oct–Apr", duration: "5 days", image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=400&q=80",  tags: ["Culture", "Shopping"] },
  { name: "Reykjavik, Iceland", searchQuery: "Reykjavik, Iceland", rating: 4.8, season: "Jun–Aug", duration: "6 days", image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400&q=80",  tags: ["Nature", "Adventure"] },
];

const PRICE = ["", "₹", "₹₹", "₹₹₹", "₹₹₹₹"];

interface Place {
  placeId: string;
  name: string;
  vicinity: string;
  rating?: number;
  totalRatings?: number;
  photo?: string;
  types?: string[];
  openNow?: boolean;
  priceLevel?: number;
}

interface PlaceSectionProps {
  title: string;
  emoji: string;
  places: Place[];
  isFavourite: (id: string) => boolean;
  addFavourite: (p: Place & { addedAt: string }) => void;
  removeFavourite: (id: string) => void;
  showPrice?: boolean;
}

function PlaceSection({ title, emoji, places, isFavourite, addFavourite, removeFavourite, showPrice }: PlaceSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold font-heading heading-gradient mb-4">{emoji} {title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {places.map((place, i) => (
          <motion.div key={place.placeId}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-xl card-glass overflow-hidden hover:shadow-card-hover transition-all cursor-pointer group">
            <div className="relative h-36 overflow-hidden bg-muted">
              {place.photo
                ? <img src={place.photo} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                : <div className="w-full h-full flex items-center justify-center"><MapPin className="h-8 w-8 text-muted-foreground/30" /></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFavourite(place.placeId)) {
                    removeFavourite(place.placeId);
                  } else {
                    addFavourite({ placeId: place.placeId, name: place.name, vicinity: place.vicinity, rating: place.rating, photo: place.photo, types: place.types, addedAt: new Date().toLocaleDateString() });
                  }
                }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all">
                <Heart className={`h-3.5 w-3.5 ${isFavourite(place.placeId) ? "fill-red-400 text-red-400" : "text-white"}`} />
              </button>
              {place.openNow !== undefined && (
                <span className={`absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${place.openNow ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
                  {place.openNow ? "Open" : "Closed"}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm font-heading text-foreground group-hover:text-primary transition-colors truncate">{place.name}</h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{place.vicinity}</span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                {place.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-foreground">{place.rating}</span>
                    {place.totalRatings && <span className="text-[10px] text-muted-foreground">({place.totalRatings.toLocaleString()})</span>}
                  </div>
                )}
                {showPrice && place.priceLevel && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{PRICE[place.priceLevel]}</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const VacationsPage = () => {
  const [search, setSearch]           = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef      = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    search: searchPlaces, suggestions, loadingSearch,
    fetchNearby, nearby, loadingNearby,
    clear, clearNearby,
  } = useGooglePlaces();
  const { addFavourite, removeFavourite, isFavourite } = useFavourites();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setSelectedPlace("");
    clearNearby();
    if (val.length > 1) { searchPlaces(val); setShowSuggestions(true); }
    else { clear(); setShowSuggestions(false); }
  };

  const handleSelectSuggestion = (placeId: string, description: string) => {
    setSearch(description);
    setSelectedPlace(description);
    clear();
    setShowSuggestions(false);
    fetchNearby(placeId);
  };

  const handleClear = () => {
    setSearch(""); setSelectedPlace("");
    clear(); clearNearby(); setShowSuggestions(false);
  };

  const handleDestinationClick = (dest: typeof destinations[0]) => {
    setSearch(dest.searchQuery);
    setSelectedPlace("");
    clearNearby();
    searchPlaces(dest.searchQuery);
    setShowSuggestions(true);
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => searchInputRef.current?.focus(), 400);
  };

  const filtered = destinations.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Vacation Planner</h1>
        <p className="text-sm text-muted-foreground">Discover destinations and plan your dream trips</p>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search any city, region or country..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="pl-10 pr-10"
          />
          {loadingSearch
            ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            : search && (
              <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )
          }
        </div>

        {/* Autocomplete dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl card-glass border border-border/50 shadow-xl overflow-hidden"
            >
              {suggestions.map((s) => (
                <button key={s.placeId}
                  onClick={() => handleSelectSuggestion(s.placeId, s.description)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left border-b border-border/30 last:border-0">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.mainText}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.secondaryText}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nearby places from Google */}
      <AnimatePresence>
        {(loadingNearby || nearby.attractions.length > 0 || nearby.hotels.length > 0 || nearby.restaurants.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            {loadingNearby ? (
              <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Fetching places near {selectedPlace}...</span>
              </div>
            ) : (
              <>
                {nearby.attractions.length > 0 && (
                  <PlaceSection title={`Top Attractions near ${selectedPlace}`} emoji="🏛️"
                    places={nearby.attractions} isFavourite={isFavourite}
                    addFavourite={addFavourite} removeFavourite={removeFavourite} />
                )}
                {nearby.hotels.length > 0 && (
                  <PlaceSection title="Top Rated Hotels" emoji="🏨"
                    places={nearby.hotels} isFavourite={isFavourite}
                    addFavourite={addFavourite} removeFavourite={removeFavourite} showPrice />
                )}
                {nearby.restaurants.length > 0 && (
                  <PlaceSection title="Top Rated Restaurants" emoji="🍽️"
                    places={nearby.restaurants} isFavourite={isFavourite}
                    addFavourite={addFavourite} removeFavourite={removeFavourite} showPrice />
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Destination cards */}
      {!selectedPlace && !loadingNearby && (
        <div>
          <h2 className="text-lg font-semibold font-heading text-foreground mb-1">Discover Destinations</h2>
          <p className="text-xs text-muted-foreground mb-4">Click a destination to explore nearby attractions, hotels & restaurants</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((d, i) => (
              <motion.div key={d.name}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => handleDestinationClick(d)}
                className="rounded-xl card-glass overflow-hidden hover:shadow-card-hover transition-all cursor-pointer group">
                <div className="relative h-40 overflow-hidden">
                  <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      Click to explore
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold font-heading text-foreground group-hover:text-primary transition-colors">{d.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-accent text-accent" /> {d.rating}
                    <span>•</span><Calendar className="h-3 w-3" /> {d.season}
                    <span>•</span><Plane className="h-3 w-3" /> {d.duration}
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
      )}
    </div>
  );
};

export default VacationsPage;
