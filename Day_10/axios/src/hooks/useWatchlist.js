import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (movieId) => api.post('/account/watchlist', { movieId }),
    onSuccess: () => {
      // Invalidate cache to force a re-fetch of the watchlist
      queryClient.invalidateQueries(['watchlist']);
    }
  });
};