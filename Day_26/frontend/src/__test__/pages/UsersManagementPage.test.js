import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../../store/slices/authSlice";

jest.mock("../../components/DashboardLayout", () => ({children}) => <div>{children}</div>);
jest.mock("../../components/CustomCard", () => ({title,value}) => <div>{title}:{value}</div>);
jest.mock("../../components/CustomTable", () => () => <div>User Table</div>);
jest.mock("../../components/PermissionGate", () => ({children}) => <>{children}</>);
jest.mock("../../hooks/usePermission", () => ({usePermission: () => ({canView:true,canCreate:true,canUpdate:true,canDelete:true})}));
jest.mock("../../api/queries", () => ({
 fetchUsers: jest.fn().mockResolvedValue([]),
 fetchRoles: jest.fn().mockResolvedValue([]),
 createUser: jest.fn().mockResolvedValue({}),
 updateUser: jest.fn().mockResolvedValue({}),
 deleteUser: jest.fn().mockResolvedValue({}),
}));
import UsersManagementPage from "../../pages/UsersManagementPage";

const store = configureStore({
 reducer:{auth:authReducer},
 preloadedState:{auth:{user:null,token:"t",refreshToken:null,role:"Admin",permissions:[],theme:"light",loading:false,error:null}}
});

test("renders user management page", async () => {
 render(<Provider store={store}><MemoryRouter><UsersManagementPage /></MemoryRouter></Provider>);
 expect(await screen.findByText(/user management/i)).toBeInTheDocument();
});
