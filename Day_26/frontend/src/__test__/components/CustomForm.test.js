import React from "react";
import { render, screen } from "@testing-library/react";
import CustomForm from "../../components/CustomForm";

test("renders all supported field types", () => {
  const fields = [
    { type: "input", name: "name", label: "Name", placeholder: "Name" },
    { type: "password", name: "password", label: "Password", placeholder: "Password" },
    { type: "textarea", name: "bio", label: "Bio", placeholder: "Bio" },
    { type: "number", name: "age", label: "Age", placeholder: "Age" },
    { type: "select", name: "role", label: "Role", options: [{ value: "Admin", label: "Admin" }] },
    { type: "datepicker", name: "date", label: "Date" },
    { type: "rangepicker", name: "range", label: "Range" },
    { type: "upload", name: "file", label: "File", children: <button>Upload</button> },
    { type: "switch", name: "active", label: "Active" },
    { type: "checkbox", name: "agree", label: "Agree", text: "Agree" },
    { type: "radio", name: "gender", label: "Gender", options: [{ label: "A", value: "a" }] },
    { type: "submit", label: "Submit", buttonProps: { htmlType: "submit" } },
  ];
  render(<CustomForm form={fields} />);
  expect(screen.getByText("Name")).toBeInTheDocument();
  expect(screen.getByText("Password")).toBeInTheDocument();
  expect(screen.getByText("Bio")).toBeInTheDocument();
  expect(screen.getByText("Upload")).toBeInTheDocument();
  expect(screen.getByText("Agree")).toBeInTheDocument();
  expect(screen.getByText("Submit")).toBeInTheDocument();
});

test("accepts custom layout and class", () => {
  const { container } = render(<CustomForm form={[]} layout="horizontal" className="custom-form" />);
  expect(container.querySelector(".custom-form")).toBeInTheDocument();
});
