import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../store/slices/authSlice";
import { MemoryRouter } from "react-router-dom";
import ApprovalPage from "../../pages/ApprovalPage";

jest.mock("../../components/DashboardLayout", () => ({children}) => <div>{children}</div>);

test("renders approval content in light and dark themes", () => {
 for (const theme of ["light","dark"]) {
   const store = configureStore({reducer:{auth:authReducer},preloadedState:{auth:{user:null,token:"t",refreshToken:null,role:"Admin",permissions:[],theme,loading:false,error:null}}});
   const {unmount} = render(<Provider store={store}><MemoryRouter><ApprovalPage /></MemoryRouter></Provider>);
   expect(screen.getByRole("heading", {name:/approval/i})).toBeInTheDocument();
   unmount();
 }
});
