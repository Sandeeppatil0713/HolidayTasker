import { createContext, useContext, useState, ReactNode } from "react";

export interface FavouritePlace {
  placeId: string;
  name: string;
  vicinity: string;
  rating?: number;
  photo?: string;
  types: string[];
  addedAt: string;
}

interface FavouritesContextType {
  favourites: FavouritePlace[];
  addFavourite: (place: FavouritePlace) => void;
  removeFavourite: (placeId: string) => void;
  isFavourite: (placeId: string) => boolean;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

const STORAGE_KEY = "favourite_places";

function loadFromStorage(): FavouritePlace[] {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (_e) {
    return [];
  }
}

function saveToStorage(places: FavouritePlace[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(places));
  } catch (_e) { /* ignore */ }
}

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<FavouritePlace[]>(loadFromStorage);

  const addFavourite = (place: FavouritePlace) => {
    setFavourites((prev) => {
      if (prev.find((p) => p.placeId === place.placeId)) return prev;
      const updated = [{ ...place, addedAt: new Date().toLocaleDateString() }, ...prev];
      saveToStorage(updated);
      return updated;
    });
  };

  const removeFavourite = (placeId: string) =>
    setFavourites((prev) => {
      const updated = prev.filter((p) => p.placeId !== placeId);
      saveToStorage(updated);
      return updated;
    });

  const isFavourite = (placeId: string) =>
    favourites.some((p) => p.placeId === placeId);

  return (
    <FavouritesContext.Provider value={{ favourites, addFavourite, removeFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error("useFavourites must be used within FavouritesProvider");
  return ctx;
}
