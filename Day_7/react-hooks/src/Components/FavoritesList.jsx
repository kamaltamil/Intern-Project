import React, { memo, useMemo } from 'react';
import { Alert, Button, Col, Row } from 'antd';
import MovieCard from './MovieCard';

const FavoritesList = ({ favorites, onBack, onRemove }) => {
  const favoriteMovies = useMemo(() => favorites ?? [], [favorites]);
  const hasFavorites = favoriteMovies.length > 0;

  return (
    <div>
      <Button onClick={onBack} type="primary" style={{ marginBottom: '16px' }}>
        ← Back to Movies
      </Button>

      <h3 style={{ marginBottom: '16px' }}>Your Favorite Movies</h3>

      {!hasFavorites ? (
        <Alert type="info" message="No favorites added yet." />
      ) : (
        <Row gutter={[16, 24]} wrap>
          {favoriteMovies.map((movie) => (
            <Col key={movie.imdbID} xs={24} sm={12} md={8} lg={6}>
              <MovieCard
                movie={movie}
                isFavorite={true}
                onToggleFavorite={onRemove}
                fallbackImage="https://placehold.co/300x450/111827/FFFFFF?text=No+Image"
                actionLabel="Remove Favorite"
                actionType="default"
                actionDanger={true}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default memo(FavoritesList);
