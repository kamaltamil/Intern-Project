import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookingCTA from '../../../components/landing/BookingCTA';

test('renders booking call to action and login link',()=>{render(<MemoryRouter><BookingCTA/></MemoryRouter>);expect(screen.getByText('Ready for your next stay?')).toBeInTheDocument();expect(screen.getByRole('link',{name:/Book Now/i})).toHaveAttribute('href','/login');});
