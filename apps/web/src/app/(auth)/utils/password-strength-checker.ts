export function checkPasswordStrength(password = ""): "Strong" | "Medium" | "Weak" {
  const rules = [
    password.length >= 12,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];

  const approve = rules.filter(Boolean).length;

  switch (approve) {
    case 5:
      return "Strong";

    case 4:
    case 3:
      return "Medium";

    default:
      return "Weak";
  }
}
