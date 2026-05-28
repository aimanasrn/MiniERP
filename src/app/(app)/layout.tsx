import React, { type ReactNode } from "react";

import { AppShell } from "../../components/layout/app-shell";
import { requireAuthenticatedSession } from "../../lib/auth/guards";

type ProtectedAppLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function ProtectedAppLayout({
  children,
}: ProtectedAppLayoutProps) {
  const session = await requireAuthenticatedSession();

  return <AppShell role={session.role}>{children}</AppShell>;
}
