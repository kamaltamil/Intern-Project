import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Breadcrumb from '../../../components/common/Breadcrumb';

const renderWithState=(pathname,permissions,theme='light')=>{const state={auth:{permissions,theme}};const store={getState:()=>state,subscribe:()=>()=>{},dispatch:jest.fn()};return render(<Provider store={store}><MemoryRouter initialEntries={[pathname]}><Breadcrumb/></MemoryRouter></Provider>);};

test('renders dashboard breadcrumb when permitted',()=>{renderWithState('/dashboard',[{resource:'dashboard',action:{view:true}}]);expect(screen.getByText('Dashboard')).toBeInTheDocument();});
test('renders nested breadcrumb when current route is permitted',()=>{renderWithState('/users',[{resource:'dashboard',action:{view:true}},{resource:'users',action:{view:true}}]);expect(screen.getByText('Dashboard')).toBeInTheDocument();expect(screen.getByText('User Management')).toBeInTheDocument();});
test('hides breadcrumb for unknown route or missing permission',()=>{const {container}=renderWithState('/unknown',[]);expect(container.querySelector('.ant-breadcrumb')).not.toBeInTheDocument();});
