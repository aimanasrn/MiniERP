export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: Record<string, string>;
    };

export type LoginInput = {
  email: string;
  password: string;
};

export type MagicLinkInput = {
  email: string;
};

export type InviteAcceptanceInput = {
  fullName: string;
  password: string;
  confirmPassword: string;
  token: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email);
}

export function validateLoginInput(
  input: LoginInput,
): ValidationResult<LoginInput> {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const errors: Record<string, string> = {};

  if (!isValidEmail(email)) {
    errors.email = "Enter a valid work email.";
  }

  if (!password) {
    errors.password = "Enter your password.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      email,
      password: input.password,
    },
  };
}

export function validateMagicLinkInput(
  input: MagicLinkInput,
): ValidationResult<MagicLinkInput> {
  const email = normalizeEmail(input.email);

  if (!isValidEmail(email)) {
    return {
      success: false,
      errors: {
        email: "Enter a valid work email.",
      },
    };
  }

  return {
    success: true,
    data: {
      email,
    },
  };
}

export function validateInviteAcceptanceInput(
  input: InviteAcceptanceInput,
): ValidationResult<InviteAcceptanceInput> {
  const fullName = input.fullName.trim();
  const token = input.token.trim();
  const errors: Record<string, string> = {};

  if (fullName.length < 2) {
    errors.fullName = "Enter your full name.";
  }

  if (input.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!token) {
    errors.token = "This invitation is missing a token.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      fullName,
      password: input.password,
      confirmPassword: input.confirmPassword,
      token,
    },
  };
}
