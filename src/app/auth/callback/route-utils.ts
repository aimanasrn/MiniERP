type RedirectOptions = {
  inviteToken?: string | null;
  next?: string | null;
};

function sanitizeRedirectPath(next: string | null | undefined) {
  if (!next) {
    return null;
  }

  if (!next.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  return next;
}

export function resolveAuthCallbackRedirect({
  inviteToken,
  next,
}: RedirectOptions) {
  return (
    sanitizeRedirectPath(next) ??
    (inviteToken
      ? `/verify-email?invite=${encodeURIComponent(inviteToken)}&verified=1`
      : "/dashboard")
  );
}
