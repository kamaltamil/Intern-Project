import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UnauthorizedPage from "../../pages/UnauthorizedPage";

test("renders unauthorized page", () => {
 render(<MemoryRouter><UnauthorizedPage /></MemoryRouter>);
 expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
});
