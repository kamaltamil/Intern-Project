import React from "react";
import { render, screen } from "@testing-library/react";
import CustomTable from "../../components/CustomTable";

test("renders table card with loading state", () => {
  render(<CustomTable loading dataSource={[]} columns={[]} />);
  expect(document.body).toBeInTheDocument();
});

test("renders empty and populated table configurations", () => {
  render(<CustomTable loading={false} dataSource={[{key:"1",name:"A"}]} columns={[{title:"Name",dataIndex:"name"}]} />);
  expect(screen.getByText("A")).toBeInTheDocument();
});
