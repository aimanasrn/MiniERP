import React from "react";

type ComingSoonProps = {
  title: string;
  description?: string;
};

export function ComingSoon({
  title,
  description = "This workspace section is part of the information architecture and will be implemented in a later task.",
}: ComingSoonProps) {
  return (
    <section className="coming-soon">
      <p className="coming-soon__eyebrow">Planned module</p>
      <h3 className="coming-soon__title">{title}</h3>
      <p className="coming-soon__description">{description}</p>
    </section>
  );
}
