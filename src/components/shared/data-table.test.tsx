import React from "react";
import { render, screen } from "@testing-library/react";

import { DataTable } from "./data-table";

describe("DataTable", () => {
  it("renders a safe fallback when no valid columns are provided", () => {
    render(
      <DataTable
        columns={["", "   "]}
        rows={[["A"]]}
      />,
    );

    expect(screen.getByText(/table configuration unavailable/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("fills missing row cells instead of rendering malformed rows", () => {
    render(
      <DataTable
        columns={["Name", "Status"]}
        rows={[["Alicia"]]}
      />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "-" })).toBeInTheDocument();
  });
});
