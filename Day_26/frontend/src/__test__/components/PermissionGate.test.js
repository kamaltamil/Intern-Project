import React from "react";
import { render, screen } from "@testing-library/react";
import PermissionGate from "../../components/PermissionGate";

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));
import { usePermission } from "../../hooks/usePermission";

test("renders children when allowed", () => {
  usePermission.mockReturnValue(true);
  render(<PermissionGate resource="users" action="view"><span>Allowed</span></PermissionGate>);
  expect(screen.getByText("Allowed")).toBeInTheDocument();
});

test("renders fallback when denied", () => {
  usePermission.mockReturnValue(false);
  render(<PermissionGate resource="users" action="delete" fallback={<span>Denied</span>}><span>Allowed</span></PermissionGate>);
  expect(screen.getByText("Denied")).toBeInTheDocument();
  expect(screen.queryByText("Allowed")).not.toBeInTheDocument();
});
