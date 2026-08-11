import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../../store/slices/authSlice";

jest.mock("../../components/DashboardLayout", () => ({children}) => <div>{children}</div>);

import ApprovalPage from "../../pages/ApprovalPage";
import ReportsPage from "../../pages/ReportsPage";
import UnauthorizedPage from "../../pages/UnauthorizedPage";

const wrapper = ({children, theme="light"}) => (
  <Provider store={configureStore({reducer:{auth:authReducer},preloadedState:{auth:{user:null,token:"t",refreshToken:null,role:"Admin",permissions:[],theme,loading:false,error:null}}})}>
    <MemoryRouter>{children}</MemoryRouter>
  </Provider>
);

test("renders approval page", () => { render(wrapper({children:<ApprovalPage/>})); expect(screen.getByText(/approval/i)).toBeInTheDocument(); });
test("renders reports page", () => { render(wrapper({children:<ReportsPage/>})); expect(screen.getByText(/reports/i)).toBeInTheDocument(); });
test("renders unauthorized page", () => { render(wrapper({children:<UnauthorizedPage/>})); expect(screen.getByText(/unauthorized/i)).toBeInTheDocument(); });
