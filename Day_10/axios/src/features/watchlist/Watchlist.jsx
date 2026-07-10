import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromWatchlist } from '../../store/watchlistSlice';
import { Row, Col, Card, Button, Typography, Empty } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Watchlist = () => {
  const dispatch = useDispatch();
  const watchlist = useSelector((state) => state.watchlist.items);

  if (watchlist.length === 0) {
    return <Empty description={<Text type="secondary">Your watchlist is empty.</Text>} />;
  }

  return (
    <Row gutter={[24, 24]}>
      {watchlist.map((movie) => (
        <Col xs={24} sm={12} md={8} lg={6} key={movie.imdbID}>
          <Card
            hoverable
            cover={
              <img
                alt={movie.Title}
                src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                style={{ height: 350, objectFit: 'cover' }}
                loading="lazy" /* <--- ADD THIS EXACT LINE */
                />
            }
            actions={[
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => dispatch(removeFromWatchlist(movie.imdbID))}
              >
                Remove
              </Button>
            ]}
          >
            <Card.Meta title={movie.Title} description={`Year: ${movie.Year}`} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default Watchlist;