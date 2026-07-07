import { act, renderHook } from '@testing-library/react';
import { useFavorites } from './useFavorites';

jest.mock('antd', () => ({
  message: {
    open: jest.fn(),
  },
}));

describe('useFavorites', () => {
  it('adds and removes favorites for a movie', () => {
    const movie = { imdbID: 'tt123', Title: 'Interstellar' };
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite(movie);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.isFavorite(movie)).toBe(true);
    expect(result.current.favoritesCount).toBe(1);

    act(() => {
      result.current.toggleFavorite(movie);
    });

    expect(result.current.favorites).toHaveLength(0);
    expect(result.current.isFavorite(movie)).toBe(false);
    expect(result.current.favoritesCount).toBe(0);
  });
});
