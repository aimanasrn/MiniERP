import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import { LoginForm } from "./login-form";

const signInWithPassword = vi.fn();
const signInWithOtp = vi.fn();
const originalLocation = window.location;

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword,
      signInWithOtp,
    },
  }),
}));

function stubWindowLocation() {
  const assign = vi.fn();

  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...originalLocation,
      assign,
      origin: "http://localhost:3000",
    },
  });

  return assign;
}

function clearDemoCookie() {
  document.cookie =
    "minierp-demo-role=; Max-Age=0; Path=/; SameSite=Lax";
}

describe("LoginForm", () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
    signInWithOtp.mockReset();
    clearDemoCookie();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    clearDemoCookie();
  });

  it("renders password and magic link actions", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("button", {
        name: /sign in/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /send magic link/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /use demo workspace/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("keeps Supabase actions visible and adds a demo fallback action when enabled", () => {
    render(<LoginForm mode="supabase" showDemoFallback />);

    expect(
      screen.getByRole("button", {
        name: /^sign in$/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /send magic link/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /use demo workspace/i,
      }),
    ).toBeInTheDocument();
  });

  it("lets a local demo user continue with a selected role", async () => {
    const assign = stubWindowLocation();

    render(<LoginForm mode="demo" nextPath="/expenses" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue as finance manager/i,
      }),
    );

    await waitFor(() => {
      expect(document.cookie).toContain("minierp-demo-role=finance_manager");
      expect(assign).toHaveBeenCalledWith("/expenses");
    });
  });

  it("falls back to the dashboard when password sign-in receives an unsafe next path", async () => {
    const assign = stubWindowLocation();

    signInWithPassword.mockResolvedValue({
      error: null,
    });

    render(<LoginForm nextPath="https://evil.test" />);

    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: "admin@northwind.test" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: /^sign in$/i,
      }),
    );

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("sends users to the demo workspace from Supabase mode when fallback is enabled", async () => {
    const assign = stubWindowLocation();

    render(<LoginForm mode="supabase" nextPath="/invoices" showDemoFallback />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /use demo workspace/i,
      }),
    );

    await waitFor(() => {
      expect(document.cookie).toContain("minierp-demo-role=company_admin");
      expect(assign).toHaveBeenCalledWith("/invoices");
    });
  });

  it("cross-disables the magic-link action while password sign-in is running", async () => {
    let resolvePasswordSignIn: ((value: { error: null }) => void) | null = null;
    stubWindowLocation();

    signInWithPassword.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePasswordSignIn = resolve;
        }),
    );

    render(<LoginForm showDemoFallback />);

    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: "admin@northwind.test" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      screen.getByRole("button", {
        name: /send magic link/i,
      }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: /use demo workspace/i,
      }),
    ).toBeDisabled();

    await act(async () => {
      resolvePasswordSignIn?.({ error: null });
    });
  });

  it("requests a magic link and redirects to verify-email", async () => {
    const assign = stubWindowLocation();

    signInWithOtp.mockResolvedValue({
      error: null,
    });

    render(<LoginForm nextPath="/reports" />);

    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: "admin@northwind.test" },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: /send magic link/i,
      }),
    );

    await waitFor(() => {
      expect(signInWithOtp).toHaveBeenCalledWith({
        email: "admin@northwind.test",
        options: {
          emailRedirectTo: "http://localhost:3000/auth/callback?next=%2Freports",
        },
      });
      expect(assign).toHaveBeenCalledWith(
        "http://localhost:3000/verify-email?email=admin%40northwind.test&mode=magic-link",
      );
    });
  });

  it("cross-disables password sign-in while a magic link request is running", async () => {
    let resolveMagicLink: ((value: { error: null }) => void) | null = null;
    stubWindowLocation();

    signInWithOtp.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMagicLink = resolve;
        }),
    );

    render(<LoginForm showDemoFallback />);

    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: "admin@northwind.test" },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: /send magic link/i,
      }),
    );

    expect(
      screen.getByRole("button", {
        name: /^sign in$/i,
      }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: /use demo workspace/i,
      }),
    ).toBeDisabled();

    await act(async () => {
      resolveMagicLink?.({ error: null });
    });
  });
});
