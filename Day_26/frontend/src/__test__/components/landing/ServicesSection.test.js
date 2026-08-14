import { render, screen } from '@testing-library/react';
import ServicesSection from '../../../components/landing/ServicesSection';

test('renders all hotel services',()=>{render(<ServicesSection/>);expect(screen.getByText('Everything you need for a relaxing stay.')).toBeInTheDocument();['24/7 Reception','Room Service','Free WiFi','Breakfast','Housekeeping','Parking'].forEach((service)=>expect(screen.getByText(service)).toBeInTheDocument());});
