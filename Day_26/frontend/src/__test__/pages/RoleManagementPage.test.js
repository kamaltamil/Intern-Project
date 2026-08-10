import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../../store/slices/authSlice";

jest.mock("../../components/DashboardLayout", () => ({children}) => <div>{children}</div>);
jest.mock("../../components/PermissionGate", () => ({children}) => <>{children}</>);
jest.mock("../../hooks/usePermission", () => ({usePermission: () => ({canView:true,canCreate:true,canUpdate:true,canDelete:true})}));
jest.mock("../../api/queries", () => ({
 fetchRoles: jest.fn().mockResolvedValue([]),
 createRole: jest.fn().mockResolvedValue({}),
 updateRole: jest.fn().mockResolvedValue({}),
 deleteRole: jest.fn().mockResolvedValue({}),
}));
import RoleManagementPage from "../../pages/RoleManagementPage";

const store = configureStore({
 reducer:{auth:authReducer},
 preloadedState:{auth:{user:null,token:"t",refreshToken:null,role:"Admin",permissions:[{resource:"roles",action:{view:true,create:true,update:true,delete:true}}],theme:"light",loading:false,error:null}}
});

test("renders role management page", async () => {
 render(<Provider store={store}><MemoryRouter><RoleManagementPage /></MemoryRouter></Provider>);
 expect(await screen.findByText(/role management/i)).toBeInTheDocument();
});
