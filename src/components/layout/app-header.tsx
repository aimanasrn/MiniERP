import React from "react";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function AppHeader({
  title = "Workspace overview",
  subtitle = "Review the operating signals that matter before you dive into each module.",
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="app-header__eyebrow">Control room</p>
        <h1 className="app-header__title">{title}</h1>
        <p className="app-header__subtitle">{subtitle}</p>
      </div>

      <div className="app-header__meta" aria-label="Workspace status">
        <div className="app-header__pill">
          <span className="app-header__dot" aria-hidden="true" />
          Live workspace
        </div>
        <div className="app-header__supporting">Dark ERPFlow workspace</div>
      </div>
    </header>
  );
}
