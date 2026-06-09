import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import LoginPage from "./page";

const pageTestDoubles = vi.hoisted(() => ({
  authModeMock: vi.fn(),
  isDemoModeEnabledMock: vi.fn(),
  getSessionMock: vi.fn(),
  redirectSentinel: new Error("NEXT_REDIRECT"),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: pageTestDoubles.redirectMock,
}));

vi.mock("@/lib/auth/mode", () => ({
  getAuthMode: pageTestDoubles.authModeMock,
  isDemoModeEnabled: pageTestDoubles.isDemoModeEnabledMock,
}));

vi.mock("@/lib/auth/session", () => ({
  getSession: pageTestDoubles.getSessionMock,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    pageTestDoubles.authModeMock.mockReset();
    pageTestDoubles.isDemoModeEnabledMock.mockReset();
    pageTestDoubles.getSessionMock.mockReset();
    pageTestDoubles.redirectMock.mockReset();
    pageTestDoubles.redirectMock.mockImplementation(() => {
      throw pageTestDoubles.redirectSentinel;
    });
  });

  it("renders callback errors from the query string", async () => {
    pageTestDoubles.authModeMock.mockReturnValue("supabase");
    pageTestDoubles.isDemoModeEnabledMock.mockReturnValue(false);
    pageTestDoubles.getSessionMock.mockResolvedValue(null);

    render(
      await LoginPage({
        searchParams: Promise.resolve({
          error: "Magic link expired.",
        }),
      }),
    );

    expect(screen.getByText("Magic link expired.")).toBeInTheDocument();
    expect(screen.getByText(/authentication issue/i)).toBeInTheDocument();
  });

  it("renders the demo login entrypoint when auth mode falls back to local demo", async () => {
    pageTestDoubles.authModeMock.mockReturnValue("demo");
    pageTestDoubles.isDemoModeEnabledMock.mockReturnValue(true);

    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("button", { name: /continue as finance manager/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /open the erpflow demo workspace locally/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /^sign in$/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders setup guidance when Supabase is unavailable and demo mode is disabled", async () => {
    pageTestDoubles.authModeMock.mockReturnValue("setup");
    pageTestDoubles.isDemoModeEnabledMock.mockReturnValue(false);

    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getAllByRole("heading", {
        name: /complete auth setup to unlock workspace sign in/i,
      }),
    ).toHaveLength(2);
    expect(
      screen.getByText("NEXT_PUBLIC_SUPABASE_URL"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /^sign in$/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("redirects signed-in Supabase users to their default authorized path", async () => {
    pageTestDoubles.authModeMock.mockReturnValue("supabase");
    pageTestDoubles.isDemoModeEnabledMock.mockReturnValue(false);
    pageTestDoubles.getSessionMock.mockResolvedValue({
      role: "super_admin",
    });

    await expect(
      LoginPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toBe(pageTestDoubles.redirectSentinel);

    expect(pageTestDoubles.redirectMock).toHaveBeenCalledWith("/companies");
  });
});
