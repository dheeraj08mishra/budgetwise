import { Check } from "lucide-react";
import { PASSWORD_RULES } from "../utils/password";

export default function PasswordStrength({ password }) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const levels = [
    "bg-error",
    "bg-error",
    "bg-warning",
    "bg-warning",
    "bg-success",
    "bg-success",
  ];
  const words = ["Too weak", "Too weak", "Weak", "Fair", "Good", "Strong"];
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {PASSWORD_RULES.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${i < passed ? levels[passed] : "bg-base-300"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <span className="font-medium">
          {password ? words[passed] : "Password strength"}
        </span>
        {PASSWORD_RULES.map((r) => (
          <span
            key={r.label}
            className={`flex items-center gap-1 ${r.test(password) ? "text-success" : "text-base-content/45"}`}
          >
            <Check size={12} aria-hidden /> {r.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Kept here too so existing imports keep working
export { isStrongPassword } from "../utils/password";
