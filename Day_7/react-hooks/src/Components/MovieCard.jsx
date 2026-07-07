import React from 'react';
import { Button, Card } from 'antd';

const MovieCard = ({ movie, isFavorite, onToggleFavorite, fallbackImage, actionLabel, actionType = 'default', actionDanger = false }) => {
  return (
    <Card
      hoverable
      variant="borderless"
      style={{ width: '100%', height: '100%' }}
      cover={
        <img
          draggable={false}
          alt={movie.Title}
          src={movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : fallbackImage}
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
          style={{ height: '320px', objectFit: 'cover' }}
        />
      }
      actions={[
        <Button
          key="action"
          type={actionType}
          danger={actionDanger}
          onClick={() => onToggleFavorite(movie)}
        >
          {actionLabel}
        </Button>,
      ]}
    >
      <Card.Meta
        title={<div style={{ whiteSpace: 'normal', fontWeight: 'bold' }}>{movie.Title}</div>}
        description={`Year: ${movie.Year}`}
      />
    </Card>
  );
};

export default MovieCard;