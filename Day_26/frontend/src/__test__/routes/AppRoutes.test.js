import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "../../routes/AppRoutes";

jest.mock("../../pages/LoginPage", () => () => <div>Login Page</div>);
jest.mock("../../pages/SignupPage", () => () => <div>Signup Page</div>);
jest.mock("../../pages/UsersManagementPage", () => () => <div>Users Page</div>);
jest.mock("../../pages/RoleManagementPage", () => () => <div>Roles Page</div>);
jest.mock("../../pages/BookingPage", () => () => <div>Bookings Page</div>);
jest.mock("../../pages/ProfilePage", () => () => <div>Profile Page</div>);
jest.mock("../../pages/ReportsPage", () => () => <div>Reports Page</div>);
jest.mock("../../pages/ApprovalPage", () => () => <div>Approval Page</div>);
jest.mock("../../pages/UnauthorizedPage", () => () => <div>Unauthorized Page</div>);
jest.mock("../../routes/ProtectedRoute", () => ({children}) => <>{children}</>);
jest.mock("../../routes/DashboardHome", () => () => <div>Dashboard Home</div>);

test("renders login route", async () => {
  render(<MemoryRouter initialEntries={["/login"]}><AppRoutes /></MemoryRouter>);
  expect(await screen.findByText("Login Page")).toBeInTheDocument();
});

test("renders signup route", async () => {
  render(<MemoryRouter initialEntries={["/signup"]}><AppRoutes /></MemoryRouter>);
  expect(await screen.findByText("Signup Page")).toBeInTheDocument();
});

test("renders dashboard route", async () => {
  render(<MemoryRouter initialEntries={["/"]}><AppRoutes /></MemoryRouter>);
  expect(await screen.findByText("Dashboard Home")).toBeInTheDocument();
});
