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

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<FavouritePlace[]>([]);

  const addFavourite = (place: FavouritePlace) => {
    setFavourites((prev) => {
      if (prev.find((p) => p.placeId === place.placeId)) return prev;
      return [{ ...place, addedAt: new Date().toLocaleDateString() }, ...prev];
    });
  };

  const removeFavourite = (placeId: string) =>
    setFavourites((prev) => prev.filter((p) => p.placeId !== placeId));

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
