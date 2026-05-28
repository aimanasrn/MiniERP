import React from "react";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function AppHeader({
  title = "Workspace overview",
  subtitle = "Track the health of your company operations from one place.",
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="app-header__eyebrow">Today&apos;s focus</p>
        <h1 className="app-header__title">{title}</h1>
        <p className="app-header__subtitle">{subtitle}</p>
      </div>

      <div className="app-header__meta" aria-label="Workspace status">
        <div className="app-header__pill">
          <span className="app-header__dot" aria-hidden="true" />
          Live workspace
        </div>
        <div className="app-header__supporting">Light enterprise shell</div>
      </div>
    </header>
  );
}
