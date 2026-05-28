import React, { type ReactNode } from "react";

type DataTableProps = {
  columns: Array<string | null | undefined>;
  rows: ReactNode[][];
  caption?: string;
};

function normalizeColumns(columns: DataTableProps["columns"]) {
  if (!Array.isArray(columns)) {
    return [];
  }

  return columns
    .map((column) => (typeof column === "string" ? column.trim() : ""))
    .filter((column) => column.length > 0);
}

function normalizeRows(rows: DataTableProps["rows"], columnCount: number) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => {
    const safeRow = Array.isArray(row) ? row.slice(0, columnCount) : [];

    return Array.from({ length: columnCount }, (_, index) => safeRow[index] ?? "-");
  });
}

export function DataTable({ columns, rows, caption }: DataTableProps) {
  const normalizedColumns = normalizeColumns(columns);

  if (normalizedColumns.length === 0) {
    return (
      <div className="data-table" role="status">
        {caption ? <p className="data-table__caption">{caption}</p> : null}
        <p className="data-table__empty-cell">Table configuration unavailable.</p>
      </div>
    );
  }

  const normalizedRows = normalizeRows(rows, normalizedColumns.length);

  return (
    <div className="data-table">
      <table>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {normalizedColumns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {normalizedRows.length === 0 ? (
            <tr>
              <td className="data-table__empty-cell" colSpan={normalizedColumns.length}>
                No data available yet.
              </td>
            </tr>
          ) : (
            normalizedRows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`cell-${rowIndex}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
