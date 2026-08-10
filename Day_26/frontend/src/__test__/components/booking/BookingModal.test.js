import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingModal from "../../../components/booking/BookingModal";

jest.mock("antd", () => {
  const actual = jest.requireActual("antd");
  return actual;
});

test("renders booking modal fields", () => {
  render(<BookingModal open rooms={[{_id:"r1",type:"Single",roomNumber:1,price:100}]} onCancel={jest.fn()} onSubmit={jest.fn()} />);
  expect(screen.getByText("Choose Room")).toBeInTheDocument();
});

test("renders empty rooms and loading flags", () => {
  render(<BookingModal open rooms={[]} roomsLoading loading onCancel={jest.fn()} onSubmit={jest.fn()} />);
  expect(screen.getByText("Choose Room")).toBeInTheDocument();
});
