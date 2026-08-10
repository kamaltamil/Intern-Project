import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../../store/slices/authSlice";

jest.mock("../../components/DashboardLayout", () => ({children}) => <div>{children}</div>);
jest.mock("../../components/CustomCard", () => ({title,value}) => <div>{title}:{value}</div>);
jest.mock("../../components/CustomTable", () => () => <div>Booking Table</div>);
jest.mock("../../components/booking/BookingModal", () => () => <div>Booking Modal</div>);
jest.mock("../../components/booking/BookingDetailsModal", () => () => <div>Details Modal</div>);
jest.mock("../../components/booking/BookingStats", () => () => []);
jest.mock("../../api/queries", () => ({
 fetchRooms: jest.fn().mockResolvedValue([]),
 fetchBookings: jest.fn().mockResolvedValue([]),
 createBooking: jest.fn().mockResolvedValue({}),
}));
import BookingPage from "../../pages/BookingPage";

const store = configureStore({
 reducer:{auth:authReducer},
 preloadedState:{auth:{user:null,token:"t",refreshToken:null,role:"Member",permissions:[],theme:"light",loading:false,error:null}}
});

test("renders booking page", async () => {
 render(<Provider store={store}><MemoryRouter><BookingPage /></MemoryRouter></Provider>);
 expect(await screen.findByText(/booking/i)).toBeInTheDocument();
});
