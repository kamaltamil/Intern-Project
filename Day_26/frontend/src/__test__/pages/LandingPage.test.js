import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../../pages/LandingPage';

jest.mock('../../components/landing/Navbar',()=>()=> <div>Navbar</div>);
jest.mock('../../components/landing/HeroSection',()=>()=> <div>HeroSection</div>);
jest.mock('../../components/landing/BookingSearch',()=>()=> <div>BookingSearch</div>);
jest.mock('../../components/landing/AboutSection',()=>()=> <div>AboutSection</div>);
jest.mock('../../components/landing/ServicesSection',()=>()=> <div>ServicesSection</div>);
jest.mock('../../components/landing/FeaturedRooms',()=>()=> <div>FeaturedRooms</div>);
jest.mock('../../components/landing/ExperienceSection',()=>()=> <div>ExperienceSection</div>);
jest.mock('../../components/landing/BookingCTA',()=>()=> <div>BookingCTA</div>);
jest.mock('../../components/landing/Footer',()=>()=> <div>Footer</div>);

test('renders all landing page sections',()=>{render(<MemoryRouter><LandingPage/></MemoryRouter>);['Navbar','HeroSection','BookingSearch','AboutSection','ServicesSection','FeaturedRooms','ExperienceSection','BookingCTA','Footer'].forEach((item)=>expect(screen.getByText(item)).toBeInTheDocument());});
