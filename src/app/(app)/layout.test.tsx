import React from "react";
import { render, screen } from "@testing-library/react";

import ProtectedAppLayout from "./layout";

const { requireAuthenticatedSessionMock, appShellMock } = vi.hoisted(() => ({
  requireAuthenticatedSessionMock: vi.fn(),
  appShellMock: vi.fn(),
}));

vi.mock("../../lib/auth/guards", () => ({
  requireAuthenticatedSession: requireAuthenticatedSessionMock,
}));

vi.mock("../../components/layout/app-shell", () => ({
  AppShell: ({ children, role }: { children: React.ReactNode; role: string | null }) => {
    appShellMock(role);

    return (
      <div>
        <span>role:{role === null ? "none" : role}</span>
        {children}
      </div>
    );
  },
}));

describe("ProtectedAppLayout", () => {
  it("passes through a missing session role instead of inventing one", async () => {
    requireAuthenticatedSessionMock.mockResolvedValue({
      role: null,
    });

    render(await ProtectedAppLayout({ children: <div>dashboard</div> }));

    expect(screen.getByText("role:none")).toBeInTheDocument();
    expect(appShellMock).toHaveBeenCalledWith(null);
  });
});
