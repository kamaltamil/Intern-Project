import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PublicHome from '../../routes/PublicHome';
import authReducer from '../../store/slices/authSlice';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('../../pages/LandingPage',()=>()=> <div>Landing Page</div>);
const renderRoute=(token)=>{const store=configureStore({reducer:{auth:authReducer},preloadedState:{auth:{user:null,token,refreshToken:null,role:null,permissions:[],theme:'light',loading:false,error:null}}});return render(<Provider store={store}><MemoryRouter initialEntries={['/']}><Routes><Route path='/' element={<PublicHome/>}/><Route path='/dashboard' element={<div>Dashboard</div>}/></Routes></MemoryRouter></Provider>);};

test('renders landing page for guests',()=>{renderRoute(null);expect(screen.getByText('Landing Page')).toBeInTheDocument();});
test('redirects authenticated users to dashboard',()=>{renderRoute('token');expect(screen.getByText('Dashboard')).toBeInTheDocument();});
