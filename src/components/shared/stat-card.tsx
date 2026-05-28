import React, { type ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  detail?: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, change, detail, icon }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card__top">
        <p className="stat-card__label">{label}</p>
        {icon ? <div className="stat-card__icon">{icon}</div> : null}
      </div>
      <p className="stat-card__value">{value}</p>
      {change ? <p className="stat-card__change">{change}</p> : null}
      {detail ? <p className="stat-card__detail">{detail}</p> : null}
    </article>
  );
}
