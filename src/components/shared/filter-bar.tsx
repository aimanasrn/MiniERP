import React, { type ReactNode } from "react";

type FilterBarProps = {
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
};

export function FilterBar({
  searchPlaceholder = "Search records",
  filters,
  actions,
}: FilterBarProps) {
  return (
    <section className="filter-bar">
      <label className="filter-bar__search">
        <span className="sr-only">Search</span>
        <input
          defaultValue=""
          name="search"
          placeholder={searchPlaceholder}
          type="search"
        />
      </label>
      {filters ? <div className="filter-bar__filters">{filters}</div> : null}
      {actions ? <div className="filter-bar__actions">{actions}</div> : null}
    </section>
  );
}
