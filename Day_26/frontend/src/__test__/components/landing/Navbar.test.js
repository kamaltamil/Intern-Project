import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../../components/landing/Navbar';

test('renders navigation links and authentication actions',()=>{render(<MemoryRouter><Navbar/></MemoryRouter>);expect(screen.getByText('HotelPro')).toBeInTheDocument();expect(screen.getAllByText('Login').length).toBeGreaterThan(0);expect(screen.getAllByText('Sign up').length).toBeGreaterThan(0);});
test('opens and closes mobile navigation drawer',()=>{render(<MemoryRouter><Navbar/></MemoryRouter>);fireEvent.click(screen.getByLabelText('Open navigation menu'));expect(screen.getByText('Home')).toBeInTheDocument();});
