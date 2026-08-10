import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../components/DashboardLayout", () => ({children}) => <div>{children}</div>);
jest.mock("../../api/queries", () => ({
  fetchMe: jest.fn().mockResolvedValue({user:{_id:"1",name:"Kamal",email:"k@example.com"},role:"Member"}),
  updateUser: jest.fn().mockResolvedValue({user:{_id:"1",name:"Updated"}}),
}));
import authReducer from "../../store/slices/authSlice";
import ProfilePage from "../../pages/ProfilePage";

const store = configureStore({
 reducer:{auth:authReducer},
 preloadedState:{auth:{user:{_id:"1",name:"Kamal",email:"k@example.com",role:"Member"},token:"t",refreshToken:"r",role:"Member",permissions:[],theme:"light",loading:false,error:null}}
});

test("renders profile page", async () => {
 render(<Provider store={store}><MemoryRouter><ProfilePage /></MemoryRouter></Provider>);
 expect(await screen.findByText(/profile/i)).toBeInTheDocument();
 expect(screen.getByText("Kamal")).toBeInTheDocument();
});
