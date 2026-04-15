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
        <div>
          <h1 className="text-2xl font-bold font-heading heading-gradient">Favourite Places</h1>
          <p className="text-sm text-muted-foreground">
            {favourites.length} saved {favourites.length === 1 ? "place" : "places"}
          </p>
        </div>
        {favourites.length > 0 && (
          <Link to="/dashboard/vacations">
            <Button size="sm" variant="outline">
              <Plane className="h-4 w-4 mr-1" /> Explore More
            </Button>
          </Link>
        )}
      </div>

      {favourites.length === 0 ? (
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
      )}
    </div>
  );
}
