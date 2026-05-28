import { resolveAuthCallbackRedirect } from "./route-utils";

describe("resolveAuthCallbackRedirect", () => {
  it("prefers a safe next path when provided", () => {
    expect(
      resolveAuthCallbackRedirect({
        next: "/employees?filter=active",
      }),
    ).toBe("/employees?filter=active");
  });

  it("sends invite users to company setup when there is no next path", () => {
    expect(
      resolveAuthCallbackRedirect({
        inviteToken: "invite-token",
      }),
    ).toBe("/verify-email?invite=invite-token&verified=1");
  });

  it("ignores unsafe redirect targets", () => {
    expect(
      resolveAuthCallbackRedirect({
        next: "https://evil.test",
      }),
    ).toBe("/dashboard");
  });
});
