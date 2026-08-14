import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FeaturedRooms from '../../../components/landing/FeaturedRooms';

test('renders all featured room types and booking links',()=>{render(<MemoryRouter><FeaturedRooms/></MemoryRouter>);expect(screen.getByText('Comfort Single')).toBeInTheDocument();expect(screen.getByText('Classic Double')).toBeInTheDocument();expect(screen.getByText('Signature Suite')).toBeInTheDocument();expect(screen.getAllByRole('link',{name:'Book this room'})).toHaveLength(3);});
