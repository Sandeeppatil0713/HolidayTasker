import { useEffect, useRef, useState } from "react";

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string;

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.places) { resolve(); return; }
    if (document.getElementById("google-maps-script")) {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) { clearInterval(interval); resolve(); }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface NearbyPlace {
  placeId: string;
  name: string;
  vicinity: string;
  rating?: number;
  totalRatings?: number;
  types: string[];
  photo?: string;
  openNow?: boolean;
  priceLevel?: number;
}

export interface NearbyResults {
  attractions: NearbyPlace[];
  hotels: NearbyPlace[];
  restaurants: NearbyPlace[];
}

function mapResult(p: google.maps.places.PlaceResult): NearbyPlace {
  return {
    placeId: p.place_id ?? "",
    name: p.name ?? "",
    vicinity: p.vicinity ?? "",
    rating: p.rating,
    totalRatings: p.user_ratings_total,
    types: p.types ?? [],
    openNow: p.opening_hours?.isOpen?.(),
    photo: p.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 300 }),
    priceLevel: p.price_level,
  };
}

export function useGooglePlaces() {
  const [suggestions,   setSuggestions]   = useState<PlaceSuggestion[]>([]);
  const [nearby,        setNearby]        = useState<NearbyResults>({ attractions: [], hotels: [], restaurants: [] });
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);

  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesRef       = useRef<google.maps.places.PlacesService | null>(null);
  const mapDivRef       = useRef<HTMLDivElement | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      autocompleteRef.current = new google.maps.places.AutocompleteService();
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      mapDivRef.current = document.createElement("div");
      placesRef.current = new google.maps.places.PlacesService(mapDivRef.current);
    }).catch(console.error);
  }, []);

  const search = (query: string) => {
    if (!query.trim() || !autocompleteRef.current) { setSuggestions([]); return; }
    setLoadingSearch(true);
    autocompleteRef.current.getPlacePredictions(
      { input: query, sessionToken: sessionTokenRef.current ?? undefined },
      (predictions, status) => {
        setLoadingSearch(false);
        if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) { setSuggestions([]); return; }
        setSuggestions(predictions.map((p) => ({
          placeId: p.place_id,
          description: p.description,
          mainText: p.structured_formatting.main_text,
          secondaryText: p.structured_formatting.secondary_text,
        })));
      }
    );
  };

  // Helper: search a single type and return sorted by rating
  const searchType = (
    location: google.maps.LatLng,
    type: string,
    callback: (results: NearbyPlace[]) => void
  ) => {
    placesRef.current!.nearbySearch(
      { location, radius: 10000, type, rankBy: google.maps.places.RankBy.PROMINENCE },
      (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) { callback([]); return; }
        const sorted = results
          .filter(p => (p.rating ?? 0) >= 3.5)
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 8)
          .map(mapResult);
        callback(sorted);
      }
    );
  };

  const fetchNearby = (placeId: string) => {
    if (!placesRef.current) return;
    setLoadingNearby(true);
    setNearby({ attractions: [], hotels: [], restaurants: [] });

    placesRef.current.getDetails(
      { placeId, fields: ["geometry", "name"] },
      (result, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !result?.geometry?.location) {
          setLoadingNearby(false); return;
        }
        const location = result.geometry.location;
        let done = 0;
        const collected: NearbyResults = { attractions: [], hotels: [], restaurants: [] };

        const finish = () => {
          done++;
          if (done === 3) { setNearby(collected); setLoadingNearby(false); }
        };

        searchType(location, "tourist_attraction", (r) => { collected.attractions = r; finish(); });
        searchType(location, "lodging",            (r) => { collected.hotels      = r; finish(); });
        searchType(location, "restaurant",         (r) => { collected.restaurants = r; finish(); });
      }
    );
  };

  const clear      = () => setSuggestions([]);
  const clearNearby = () => setNearby({ attractions: [], hotels: [], restaurants: [] });

  // Keep backward compat — flatten all for components that use nearbyPlaces
  const nearbyPlaces = [...nearby.attractions];

  return {
    search, suggestions, loadingSearch,
    fetchNearby, nearby, nearbyPlaces, loadingNearby,
    clear, clearNearby,
  };
}
