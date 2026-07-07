import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios';
import { Alert, Button, Card, Col, ConfigProvider, Form, Input, Row, Spin, Typography } from 'antd';
import FavoritesList from './FavoritesList';
import MovieCard from './MovieCard';
import { useFavorites } from '../hooks/useFavorites';

const { Text } = Typography;

const MovieList = () => {
  const API_KEY = process.env.REACT_APP_OMDB_API_KEY;
  const API_URL = `https://www.omdbapi.com/`;

  const DEFAULT_MOVIE_NAMES = ['Interstellar', 'Inception', 'Avatar', 'Tenet'];
  const MOVIES_PER_PAGE = 12;
  const FALLBACK_IMAGE = 'https://placehold.co/300x450/111827/FFFFFF?text=No+Image';

  const [movies, setMovies] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const { favorites, favoritesCount, toggleFavorite, isFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    const fetchMovies = async () => {
      if (!API_KEY) {
        setError('OMDB API key is missing. Set REACT_APP_OMDB_API_KEY in your environment.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const query = searchQuery.trim();

        if (!query) {
          const requests = DEFAULT_MOVIE_NAMES.map((movieName) =>
            axios.get(`${API_URL}?apikey=${API_KEY}&s=${movieName}`)
          );

          const responses = await Promise.all(requests);
          const featuredData = responses
            .flatMap((response) => response.data.Search || [])
            .filter((movie, index, self) => index === self.findIndex((item) => item.imdbID === movie.imdbID));

          setMovies(featuredData);
          setTotalResults(featuredData.length);
        } else {
          const response = await axios.get(`${API_URL}?apikey=${API_KEY}&s=${query}&page=${currentPage}`);

          if (response.data.Response === 'True') {
            setMovies(response.data.Search || []);
            setTotalResults(Number(response.data.totalResults || 0));
          } else {
            setError(response.data.Error || 'No movies found.');
            setMovies([]);
            setTotalResults(0);
          }
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Unable to load movies right now. Please try again.');
        setMovies([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [API_KEY, currentPage, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSearchChange = useCallback((value) => {
    const trimmedValue = value.trim();
    setSearchInput(trimmedValue);
    setSearchQuery(trimmedValue);
  }, []);

  const pageSize = useMemo(() => (searchQuery.trim() ? 10 : MOVIES_PER_PAGE), [searchQuery]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalResults / pageSize)), [pageSize, totalResults]);
  const visibleMovies = useMemo(() => {
    if (searchQuery.trim()) return movies;
    return movies.slice((currentPage - 1) * MOVIES_PER_PAGE, currentPage * MOVIES_PER_PAGE);
  }, [currentPage, movies, searchQuery]);

  return (
    <section className="movie-list" style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '16px' }}>Featured Movies</h2>
      <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
        Search movies live, browse pages, and save favorites.
      </Text>

      <ConfigProvider
        theme={{
          components: {
            Input: {
              colorBgContainer: 'var(--secondary)',
              colorBorder: 'var(--primary)',
              colorPrimary: 'var(--primary)',
              colorText: 'var(--primary)',
              colorPrimaryHover: 'var(--primary-hover)',
              addonBg: 'var(--primary)',
            },
            Button: {
              colorPrimary: 'var(--primary)',
              colorPrimaryHover: 'var(--primary-hover)',
              colorPrimaryActive: 'var(--primary-hover)',
              colorBorderPrimary: 'var(--primary)',
              colorBorderPrimaryHover: 'var(--primary-hover)',
              colorBorderPrimaryActive: 'var(--primary-hover)',
            },
          },
        }}
      >
        <Form style={{ marginBottom: '20px', padding: '0 24px' }}>
          <Input.Search
            value={searchInput}
            placeholder="Search for movies..."
            enterButton="Search"
            size="medium"
            onChange={(e) => handleSearchChange(e.target.value)}
            onSearch={handleSearchChange}
          />
        </Form>
      </ConfigProvider>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <Button type="primary" style={{background: 'var(--primary)'}} onClick={() => setShowFavorites(true)}>
            View Favorites ({favoritesCount})
          </Button>
        </div>
      </Card>

      {showFavorites ? (
        <FavoritesList
          favorites={favorites}
          onBack={() => setShowFavorites(false)}
          onRemove={removeFavorite}
        />
      ) : (
        <>
          {loading && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin size="large" tip="Loading movies..." />
        </div>
      )}

      {error && <Alert type="error" message={error} style={{ marginBottom: '16px' }} />}

      {!loading && !error && visibleMovies.length > 0 && (
        <>
          <Row gutter={[16, 24]} wrap>
            {visibleMovies.map((movie) => (
              <Col key={movie.imdbID} xs={24} sm={12} md={8} lg={6}>
                <MovieCard
                  movie={movie}
                  isFavorite={isFavorite(movie)}
                  onToggleFavorite={toggleFavorite}
                  fallbackImage={FALLBACK_IMAGE}
                  actionLabel={isFavorite(movie) ? '★ Favorited' : '☆ Favorite'}
                  actionType={isFavorite(movie) ? 'primary' : 'default'}
                />
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                Previous
              </Button>
              <Text strong>
                Page {currentPage} of {totalPages}
              </Text>
              <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

          {!loading && !error && visibleMovies.length === 0 && (
            <Alert type="info" message="No movies matched your search yet." />
          )}
        </>
      )}
    </section>
  );
};

export default MovieList