import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../api/api';

export const useSearchMovies = (searchTerm) => {
  return useInfiniteQuery({
    queryKey: ['movies', searchTerm],
    
    // 1. pageParam is automatically provided by React Query (defaults to 1)
    queryFn: async ({ pageParam = 1 }) => {
      if (!searchTerm) return { Search: [], totalResults: 0 };

      const { data } = await api.get('', {
        // Send the page number to the OMDb API
        params: { s: searchTerm, type: 'movie', page: pageParam },
      });
      
      if (data.Response === 'False') {
        throw new Error(data.Error || 'No movies found');
      }
      
      // Return the data along with pagination details
      return {
        Search: data.Search || [],
        totalResults: parseInt(data.totalResults, 10) || 0,
        nextPage: pageParam + 1,
      };
    },
    
    // 2. Determine if there is another page to fetch
    getNextPageParam: (lastPage, allPages) => {
      const loadedMoviesCount = allPages.reduce((total, page) => total + page.Search.length, 0);
      
      // If the movies we have are less than the total available, fetch the next page
      if (loadedMoviesCount < lastPage.totalResults) {
        return lastPage.nextPage;
      }
      return undefined; // No more pages
    },
    
    enabled: searchTerm.length > 2, 
    staleTime: 1000 * 60 * 10, 
  });
};