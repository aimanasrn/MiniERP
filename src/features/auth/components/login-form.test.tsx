import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { LoginForm } from "./login-form";

const signInWithPassword = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword,
      signInWithOtp: vi.fn(),
    },
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
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
  });

  it("falls back to the dashboard when password sign-in receives an unsafe next path", async () => {
    const assign = vi.fn();

    signInWithPassword.mockResolvedValue({
      error: null,
    });

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        assign,
      },
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
});
