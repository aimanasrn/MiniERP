import React from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
}: EmptyStateProps) {
  return (
    <section className="empty-state">
      <div className="empty-state__panel">
        <p className="empty-state__eyebrow">First step</p>
        <h3 className="empty-state__title">{title}</h3>
        <p className="empty-state__description">{description}</p>
        {actionLabel ? <button className="button-primary" type="button">{actionLabel}</button> : null}
      </div>
    </section>
  );
}
