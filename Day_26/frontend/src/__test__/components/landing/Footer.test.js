import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../../../components/landing/Footer';
import { subscribeToNewsletter } from '../../../api/queries';

jest.mock('../../../api/queries',()=>({subscribeToNewsletter:jest.fn()}));

describe('Footer',()=>{
 test('renders contact and subscription controls',()=>{render(<MemoryRouter><Footer/></MemoryRouter>);expect(screen.getByText('Contact Us')).toBeInTheDocument();expect(screen.getByLabelText('Subscription email')).toBeInTheDocument();});
 test('shows validation error for invalid email',()=>{render(<MemoryRouter><Footer/></MemoryRouter>);fireEvent.click(screen.getByRole('button',{name:'Subscribe'}));expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();});
 test('subscribes successfully and clears input',async()=>{subscribeToNewsletter.mockResolvedValue({message:'Subscribed'});render(<MemoryRouter><Footer/></MemoryRouter>);const input=screen.getByLabelText('Subscription email');fireEvent.change(input,{target:{value:'user@example.com'}});fireEvent.click(screen.getByRole('button',{name:'Subscribe'}));await waitFor(()=>expect(subscribeToNewsletter).toHaveBeenCalledWith('user@example.com'));await waitFor(()=>expect(input).toHaveValue(''));});
 test('shows API error message',async()=>{subscribeToNewsletter.mockRejectedValue({response:{data:{message:'Already subscribed'}}});render(<MemoryRouter><Footer/></MemoryRouter>);fireEvent.change(screen.getByLabelText('Subscription email'),{target:{value:'user@example.com'}});fireEvent.click(screen.getByRole('button',{name:'Subscribe'}));await waitFor(()=>expect(screen.getByText('Already subscribed')).toBeInTheDocument());});
});
