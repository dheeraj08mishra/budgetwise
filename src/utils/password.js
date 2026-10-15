// Same rules as the server (validator.isStrongPassword defaults)
export const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: "8+ characters" },
  { test: (p) => /[a-z]/.test(p), label: "Lowercase" },
  { test: (p) => /[A-Z]/.test(p), label: "Uppercase" },
  { test: (p) => /\d/.test(p), label: "Number" },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: "Symbol" },
];

export const isStrongPassword = (p) => PASSWORD_RULES.every((r) => r.test(p));
