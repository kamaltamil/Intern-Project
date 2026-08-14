import { fireEvent, render, screen } from '@testing-library/react';
import LandingBanner from '../../components/LandingBanner';

test('renders supplied banner content and action',()=>{const action=jest.fn();render(<LandingBanner image='/hero.jpg' alt='Hero' title='Dashboard' subtitle='Welcome' actionLabel='Continue' onAction={action}/>);expect(screen.getByAltText('Hero')).toHaveAttribute('src','/hero.jpg');expect(screen.getByText('Dashboard')).toBeInTheDocument();expect(screen.getByText('Welcome')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Continue'}));expect(action).toHaveBeenCalled();});
test('hides optional content when props are absent',()=>{render(<LandingBanner/>);expect(screen.queryByRole('button')).not.toBeInTheDocument();});
