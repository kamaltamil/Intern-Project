import { render, screen } from '@testing-library/react';
import AboutSection from '../../../components/landing/AboutSection';

test('renders about section content and service link', () => { render(<AboutSection />); expect(screen.getByText('About HotelPro')).toBeInTheDocument(); expect(screen.getByText('A better stay starts with the right place.')).toBeInTheDocument(); expect(screen.getByRole('link',{name:'Explore our services'})).toHaveAttribute('href','#services'); });
