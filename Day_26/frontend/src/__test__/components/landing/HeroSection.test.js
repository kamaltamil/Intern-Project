import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeroSection from '../../../components/landing/HeroSection';

test('renders hero content and navigation actions',()=>{render(<MemoryRouter><HeroSection/></MemoryRouter>);expect(screen.getByText('Welcome to HotelPro')).toBeInTheDocument();expect(screen.getByText('Comfortable stays,')).toBeInTheDocument();expect(screen.getByRole('link',{name:'Book Now'})).toHaveAttribute('href','/login');expect(screen.getByRole('link',{name:'Explore Rooms'})).toHaveAttribute('href','#rooms');});
