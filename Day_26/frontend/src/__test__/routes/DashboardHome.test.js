import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import authReducer from "../../store/slices/authSlice";
import DashboardHome from "../../routes/DashboardHome";

jest.mock("../../pages/AdminDashboardPage", () => () => <div>Admin Dashboard</div>);
jest.mock("../../pages/ManagerDashboardPage", () => () => <div>Manager Dashboard</div>);
jest.mock("../../pages/MemberDashboardPage", () => () => <div>Member Dashboard</div>);

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderRole = (role) => {
  const store = configureStore({ reducer:{auth:authReducer}, preloadedState:{auth:{user:null,token:null,refreshToken:null,role,permissions:[],theme:"light",loading:false,error:null}}});
  render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <DashboardHome />
      </Provider>
    </QueryClientProvider>
  );
};

test("renders admin dashboard", () => { renderRole("Admin"); expect(screen.getByText("Admin Dashboard")).toBeInTheDocument(); });
test("renders manager dashboard", () => { renderRole("Manager"); expect(screen.getByText("Manager Dashboard")).toBeInTheDocument(); });
test("renders member dashboard for other roles", () => { renderRole("Member"); expect(screen.getByText("Member Dashboard")).toBeInTheDocument(); });
