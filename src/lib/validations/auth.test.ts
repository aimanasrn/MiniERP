import {
  validateInviteAcceptanceInput,
  validateLoginInput,
  validateMagicLinkInput,
} from "./auth";

describe("auth validation", () => {
  it("requires an email and password for password sign-in", () => {
    expect(validateLoginInput({ email: " ", password: "" })).toEqual({
      success: false,
      errors: {
        email: "Enter a valid work email.",
        password: "Enter your password.",
      },
    });
  });

  it("allows magic link requests with a valid email", () => {
    expect(
      validateMagicLinkInput({
        email: "admin@northwind.test",
      }),
    ).toEqual({
      success: true,
      data: {
        email: "admin@northwind.test",
      },
    });
  });

  it("rejects invite acceptance when passwords do not match", () => {
    expect(
      validateInviteAcceptanceInput({
        fullName: "Alicia Tan",
        password: "secret123",
        confirmPassword: "secret124",
        token: "invite-token",
      }),
    ).toEqual({
      success: false,
      errors: {
        confirmPassword: "Passwords do not match.",
      },
    });
  });
});
