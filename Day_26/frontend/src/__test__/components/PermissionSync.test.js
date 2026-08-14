import { act, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import PermissionSync from '../../components/PermissionSync';
import { fetchMyPermissions } from '../../api/queries';
import store from '../../store/store';
import { setAuth, logout } from '../../store/slices/authSlice';

jest.mock('../../api/queries',()=>({fetchMyPermissions:jest.fn()}));

describe('PermissionSync',()=>{
 beforeEach(()=>{jest.clearAllMocks();jest.useFakeTimers();store.dispatch(setAuth({token:'token',role:'Member',permissions:[]}));});
 afterEach(()=>jest.useRealTimers());
 test('refreshes permissions when authenticated',async()=>{fetchMyPermissions.mockResolvedValue({role:{name:'Manager'},permissions:['view']});render(<Provider store={store}><PermissionSync/></Provider>);await act(async()=>{});expect(fetchMyPermissions).toHaveBeenCalled();expect(store.getState().auth.permissions).toEqual(['view']);});
 test('does not fetch when no token',()=>{store.dispatch(logout());render(<Provider store={store}><PermissionSync/></Provider>);expect(fetchMyPermissions).not.toHaveBeenCalled();});
 test('keeps state when permission refresh fails',async()=>{fetchMyPermissions.mockRejectedValue(new Error('network'));render(<Provider store={store}><PermissionSync/></Provider>);await act(async()=>{});expect(fetchMyPermissions).toHaveBeenCalled();});
 test('clears interval on unmount',async()=>{fetchMyPermissions.mockResolvedValue({role:'Manager',permissions:[]});const {unmount}=render(<Provider store={store}><PermissionSync/></Provider>);await act(async()=>{});unmount();act(()=>jest.advanceTimersByTime(15000));expect(fetchMyPermissions).toHaveBeenCalledTimes(1);});
});
