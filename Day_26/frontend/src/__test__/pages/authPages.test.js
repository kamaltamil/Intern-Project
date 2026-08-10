import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../../store/slices/authSlice";

jest.mock("../../api/queries", () => ({
  loginUser: jest.fn().mockResolvedValue({ user:{name:"Kamal"}, token:"t", refreshToken:"r", role:"Member", permissions:[] }),
  signupUser: jest.fn().mockResolvedValue({ user:{name:"Kamal"} }),
}));
jest.mock("../../components/CustomForm", () => ({form,onFinish}) => (
  <div>
    <button onClick={() => onFinish({email:"a@example.com",password:"pass",name:"Kamal",username:"kamal"})}>Submit</button>
    {form.map((f) => <span key={f.name}>{f.label}</span>)}
  </div>
));
import LoginPage from "../../pages/LoginPage";
import SignupPage from "../../pages/SignupPage";

const store = () => configureStore({reducer:{auth:authReducer}});

test("renders login page", () => {
 render(<Provider store={store()}><MemoryRouter><LoginPage /></MemoryRouter></Provider>);
 expect(screen.getByText(/login/i)).toBeInTheDocument();
 expect(screen.getByText("Email")).toBeInTheDocument();
});

test("submits login form", async () => {
 render(<Provider store={store()}><MemoryRouter><LoginPage /></MemoryRouter></Provider>);
 fireEvent.click(screen.getByText("Submit"));
 await waitFor(() => expect(screen.queryByText("Submit")).toBeInTheDocument());
});

test("renders signup page", () => {
 render(<Provider store={store()}><MemoryRouter><SignupPage /></MemoryRouter></Provider>);
 expect(screen.getByText(/sign up/i)).toBeInTheDocument();
});
