import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchMovies } from '../../hooks/useMovies';
import { addToWatchlist, removeFromWatchlist } from '../../store/watchlistSlice';
import { setAllMovies } from '../../store/moviesSlice'; // 1. Imported the new action
import { Input, Row, Col, Card, Button, Spin, Alert, Typography } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';

const { Text } = Typography;

const MovieList = () => {
  const [search, setSearch] = useState('Marvel');
  
  // Pull the Infinite Query methods
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    isError, 
    error 
  } = useSearchMovies(search);
  
  const dispatch = useDispatch();
  const watchlist = useSelector((state) => state.watchlist.items);
  const isMovieInWatchlist = (imdbID) => watchlist.some((m) => m.imdbID === imdbID);

  // Flatten the pages array into a single array of movies for the UI
  const movies = data?.pages.flatMap((page) => page.Search) || [];

  // 2. Synchronize React Query data with Redux Store
  // We use 'data' in the dependency array to ensure this only runs when the API actually fetches new results
  useEffect(() => {
    if (data) {
      const allFetchedMovies = data.pages.flatMap((page) => page.Search) || [];
      if (allFetchedMovies.length > 0) {
        dispatch(setAllMovies(allFetchedMovies));
      }
    }
  }, [data, dispatch]);

  // Intersection Observer setup to detect when we reach the bottom
  const observer = useRef();
  const lastMovieElementRef = useCallback((node) => {
    if (isLoading || isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver((entries) => {
      // If the last element is on screen and more pages exist, fetch next!
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <div>
      <Input.Search
        placeholder="Search for movies..."
        enterButton="Search"
        size="large"
        defaultValue={search}
        onSearch={(value) => setSearch(value)}
        style={{ marginBottom: 30, maxWidth: 600 }}
      />

      {isLoading && (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 10 }}><Text type="secondary">Fetching movies...</Text></div>
        </div>
      )}

      {isError && (
        <Alert message="Search Error" description={error.message} type="error" showIcon style={{ marginBottom: 20 }} />
      )}

      <Row gutter={[24, 24]}>
        {movies.map((movie, index) => {
          // Attach the observer ref to the very last item in the array
          const isLastElement = movies.length === index + 1;
          
          return (
            <Col xs={24} sm={12} md={8} lg={6} key={`${movie.imdbID}-${index}`} ref={isLastElement ? lastMovieElementRef : null}>
              <Card
                hoverable
                cover={
                  <img
                    alt={movie.Title}
                    src={movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                    loading="lazy"
                    style={{ height: 350, objectFit: 'cover' }}
                  />
                }
                actions={[
                  isMovieInWatchlist(movie.imdbID) ? (
                    <Button type="text" danger icon={<HeartFilled />} onClick={() => dispatch(removeFromWatchlist(movie.imdbID))}>
                      Saved
                    </Button>
                  ) : (
                    <Button type="text" icon={<HeartOutlined />} onClick={() => dispatch(addToWatchlist(movie))}>
                      Watchlist
                    </Button>
                  )
                ]}
              >
                <Card.Meta title={movie.Title} description={`Year: ${movie.Year}`} />
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Show a spinner at the bottom while loading the next page */}
      {isFetchingNextPage && (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 10 }}><Text type="secondary">Loading more movies...</Text></div>
        </div>
      )}
    </div>
  );
};

export default MovieList;