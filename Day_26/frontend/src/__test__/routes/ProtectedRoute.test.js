import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../../store/slices/authSlice";
import ProtectedRoute from "../../routes/ProtectedRoute";

const renderWithAuth = (auth, resource, action="view") => {
  const store = configureStore({ reducer:{auth:authReducer}, preloadedState:{auth} });
  return render(<Provider store={store}><MemoryRouter><ProtectedRoute resource={resource} action={action}><span>Secret</span></ProtectedRoute></MemoryRouter></Provider>);
};

const base = {user:null,token:"t",refreshToken:null,role:"Member",permissions:[],theme:"light",loading:false,error:null};

test("redirects unauthenticated users", () => {
  renderWithAuth({...base,token:null}, "users");
  expect(screen.queryByText("Secret")).not.toBeInTheDocument();
});

test("allows routes without resource", () => {
  renderWithAuth(base, undefined);
  expect(screen.getByText("Secret")).toBeInTheDocument();
});

test("allows permitted resource", () => {
  renderWithAuth({...base,permissions:[{resource:"users",action:{view:true}}]}, "users");
  expect(screen.getByText("Secret")).toBeInTheDocument();
});

test("blocks forbidden resource", () => {
  renderWithAuth(base, "users");
  expect(screen.queryByText("Secret")).not.toBeInTheDocument();
});
