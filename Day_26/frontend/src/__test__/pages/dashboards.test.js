import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../store/slices/authSlice";

jest.mock("../../components/DashboardLayout", () => ({children}) => <div>{children}</div>);
jest.mock("../../components/CustomCard", () => ({title,value}) => <div>{title}:{value}</div>);
jest.mock("../../components/CustomTable", () => () => <div>Table</div>);
jest.mock("../../api/queries", () => ({ fetchUsers: jest.fn().mockResolvedValue([]) }));

import AdminDashboardPage from "../../pages/AdminDashboardPage";
import ManagerDashboardPage from "../../pages/ManagerDashboardPage";
import MemberDashboardPage from "../../pages/MemberDashboardPage";

const makeStore = (user={name:"Kamal",upcomingBookings:[],bookingHistory:[]}) => configureStore({
 reducer:{auth:authReducer},
 preloadedState:{auth:{user,token:"t",refreshToken:null,role:"Admin",permissions:[],theme:"light",loading:false,error:null}}
});

test("renders admin dashboard", async () => {
 render(<MemoryRouter><Provider store={makeStore()}><AdminDashboardPage /></Provider></MemoryRouter>);
 expect(await screen.findByText(/admin/i)).toBeInTheDocument();
});

test("renders manager dashboard", async () => {
 render(<MemoryRouter><Provider store={makeStore()}><ManagerDashboardPage /></Provider></MemoryRouter>);
 expect(await screen.findByText(/manager/i)).toBeInTheDocument();
});

test("renders member dashboard", () => {
 render(<MemoryRouter><Provider store={makeStore({name:"Kamal",upcomingBookings:[1],bookingHistory:[2]})}><MemberDashboardPage /></Provider></MemoryRouter>);
 expect(screen.getByText(/member/i)).toBeInTheDocument();
});
