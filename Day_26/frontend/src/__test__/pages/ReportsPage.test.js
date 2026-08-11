import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../store/slices/authSlice";
import { MemoryRouter } from "react-router-dom";
import ReportsPage from "../../pages/ReportsPage";

jest.mock("../../components/DashboardLayout", () => ({children}) => <div>{children}</div>);

test("renders reports page", () => {
 const store = configureStore({reducer:{auth:authReducer},preloadedState:{auth:{user:null,token:"t",refreshToken:null,role:"Admin",permissions:[],theme:"light",loading:false,error:null}}});
 render(<Provider store={store}><MemoryRouter><ReportsPage /></MemoryRouter></Provider>);
 expect(screen.getByText(/reports/i)).toBeInTheDocument();
});
