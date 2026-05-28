import React from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          MiniERP
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight">
          Modern ERP for growing companies.
        </h1>
      </section>
    </main>
  );
}
