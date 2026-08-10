import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../../store/slices/authSlice";
import TopHeader from "../../components/TopHeader";

jest.mock("../../api/queries", () => ({ logoutUser: jest.fn().mockResolvedValue({}) }));

const makeStore = (auth) => configureStore({ reducer:{auth:authReducer}, preloadedState:{auth} });

const base = {user:{_id:"1",name:"Kamal",role:"Admin"},token:"t",refreshToken:"r",role:"Admin",permissions:[],theme:"light",loading:false,error:null};

test("renders user and toggles theme", () => {
  const store = makeStore(base);
  render(<Provider store={store}><MemoryRouter><TopHeader /></MemoryRouter></Provider>);
  expect(screen.getByText("Welcome Kamal")).toBeInTheDocument();
  expect(screen.getByText("Kamal")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button"));
  expect(store.getState().auth.theme).toBe("dark");
});

test("shows dropdown actions and handles logout", async () => {
  const store = makeStore({ ...base, user:null });
  render(<Provider store={store}><MemoryRouter><TopHeader /></MemoryRouter></Provider>);
  const userArea = screen.getByText("User").closest("div");
  fireEvent.click(userArea);
  expect(await screen.findByText("Profile")).toBeInTheDocument();
  expect(screen.getByText("Logout")).toBeInTheDocument();
});
