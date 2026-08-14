import { render, screen } from '@testing-library/react';
import ExperienceSection from '../../../components/landing/ExperienceSection';

test('renders hotel experience content and statistics',()=>{render(<ExperienceSection/>);expect(screen.getByText('The HotelPro experience')).toBeInTheDocument();expect(screen.getByText('Slow down. Settle in. Enjoy the stay.')).toBeInTheDocument();expect(screen.getByText('24/7')).toBeInTheDocument();expect(screen.getByText('4.9')).toBeInTheDocument();});
