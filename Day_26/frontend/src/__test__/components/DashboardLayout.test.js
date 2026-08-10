import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../store/slices/authSlice";
import DashboardLayout from "../../components/DashboardLayout";

jest.mock("../../components/RoleSidebar", () => () => <div>Sidebar</div>);
jest.mock("../../components/TopHeader", () => () => <div>Header</div>);

const makeStore = (theme) => configureStore({
  reducer: { auth: authReducer },
  preloadedState: { auth:{user:null,token:null,refreshToken:null,role:null,permissions:[],theme,loading:false,error:null} }
});

test("renders children in light theme", () => {
  render(<Provider store={makeStore("light")}><DashboardLayout><div>Content</div></DashboardLayout></Provider>);
  expect(screen.getByText("Sidebar")).toBeInTheDocument();
  expect(screen.getByText("Header")).toBeInTheDocument();
  expect(screen.getByText("Content")).toBeInTheDocument();
});

test("renders dark theme", () => {
  render(<Provider store={makeStore("dark")}><DashboardLayout><div>Dark Content</div></DashboardLayout></Provider>);
  expect(screen.getByText("Dark Content")).toBeInTheDocument();
});
