import { useCallback, useMemo, useState } from 'react';
import { message } from 'antd';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = useCallback((movie) => {
    setFavorites((prevFavorites) => {
      const isAlreadyFavorite = prevFavorites.some((item) => item.imdbID === movie.imdbID);
      const messageKey = 'favorite-toggle';

      if (isAlreadyFavorite) {
        message.open({
          key: messageKey,
          type: 'info',
          content: `Removed "${movie.Title}" from favorites.`,
          duration: 1.5,
        });
        return prevFavorites.filter((item) => item.imdbID !== movie.imdbID);
      }

      message.open({
        key: messageKey,
        type: 'success',
        content: `Added "${movie.Title}" to favorites.`,
        duration: 1.5,
      });

      return [...prevFavorites, movie];
    });
  }, []);

  const isFavorite = useCallback((movie) => {
    if (!movie?.imdbID) return false;
    return favorites.some((item) => item.imdbID === movie.imdbID);
  }, [favorites]);

  const removeFavorite = useCallback((movie) => {
    setFavorites((prevFavorites) => prevFavorites.filter((item) => item.imdbID !== movie.imdbID));
  }, []);

  const favoritesCount = useMemo(() => favorites.length, [favorites]);

  return {
    favorites,
    favoritesCount,
    toggleFavorite,
    isFavorite,
    removeFavorite,
  };
};
