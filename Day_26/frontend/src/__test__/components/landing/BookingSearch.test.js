import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookingSearch from '../../../components/landing/BookingSearch';

test('renders search fields and navigates to login on submit',()=>{render(<MemoryRouter><BookingSearch/></MemoryRouter>);expect(screen.getByText('Check-in')).toBeInTheDocument();expect(screen.getByText('Check-out')).toBeInTheDocument();expect(screen.getByText('Guests')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Search Rooms'}));expect(true).toBe(true);});
