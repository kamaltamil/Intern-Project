import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, useLocation } from "react-router-dom";
import RoleSidebar from "../../components/RoleSidebar";
import authReducer from "../../store/slices/authSlice";

const makeStore = (permissions, theme="light") => configureStore({
  reducer: { auth: authReducer },
  preloadedState: { auth: { user:null,token:"t",refreshToken:null,role:"Admin",permissions,theme,loading:false,error:null } }
});

test("shows always-visible items and permitted modules", () => {
  render(
    <Provider store={makeStore([{ resource:"users", action:{view:true} }])}>
      <MemoryRouter initialEntries={["/users"]}><RoleSidebar /></MemoryRouter>
    </Provider>
  );
  expect(screen.getByText("HotelPro")).toBeInTheDocument();
  expect(screen.getByText("Dashboard")).toBeInTheDocument();
  expect(screen.getByText("User Management")).toBeInTheDocument();
  expect(screen.getByText("Profile")).toBeInTheDocument();
  expect(screen.queryByText("Role Management")).not.toBeInTheDocument();
});

test("navigates when a menu item is clicked", () => {
  function Harness() {
    const location = useLocation();
    return <><RoleSidebar /><span data-testid="path">{location.pathname}</span></>;
  }
  render(
    <Provider store={makeStore([{ resource:"users", action:{view:true} }])}>
      <MemoryRouter><Harness /></MemoryRouter>
    </Provider>
  );
  fireEvent.click(screen.getByText("User Management"));
  expect(screen.getByTestId("path")).toHaveTextContent("/users");
});
