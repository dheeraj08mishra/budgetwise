import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import isEmail from "validator/es/lib/isEmail";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  User,
  Wallet,
  ChartLine,
  Repeat,
  Target,
  ShieldCheck,
} from "lucide-react";
import { updateProfile, logout } from "../utils/redux/profileSlice";
import { removeAllTransactions } from "../utils/redux/transactionSlice";
import { resetSalary } from "../utils/redux/budgetSlice";
import { api } from "../utils/api";
import { Segmented, Field } from "../components/ui";
import SiteFooter from "../components/SiteFooter";
import PasswordStrength, {
  isStrongPassword,
} from "../components/PasswordStrength";

const NAME_RE = /^[a-zA-Z ]{3,20}$/;

const IconInput = ({ icon: Icon, right, invalid, ...props }) => (
  <label className={`input w-full ${invalid ? "input-error" : ""}`}>
    <Icon size={16} className="text-base-content/40" aria-hidden />
    <input {...props} aria-invalid={invalid || undefined} />
    {right}
  </label>
);

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const signup = mode === "signup";
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!isEmail(form.email.trim())) e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Enter your password.";
    if (signup) {
      if (!NAME_RE.test(form.firstName.trim())) e.firstName = "3–20 letters.";
      if (!NAME_RE.test(form.lastName.trim())) e.lastName = "3–20 letters.";
      if (!/^\d{10}$/.test(form.phone))
        e.phone = "Enter a 10-digit mobile number.";
      if (!isStrongPassword(form.password))
        e.password = "Password doesn't meet all the rules below.";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);
    const body = signup
      ? {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          phoneNumber: form.phone,
        }
      : { email: form.email.trim(), password: form.password };
    const { ok, data, error } = await api(signup ? "/signup" : "/login", {
      method: "POST",
      body,
    });
    setLoading(false);
    if (!ok) return toast.error(error);
    dispatch(logout());
    dispatch(removeAllTransactions());
    dispatch(resetSalary());
    dispatch(updateProfile(data.user));
    toast.success(data.message);
    navigate("/");
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
  };

  return (
    <div className="grid grid-cols-1 min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-2.5 text-lg font-semibold">
          <span className="grid grid-cols-1 size-9 place-items-center rounded-lg bg-white/15">
            <Wallet size={18} />
          </span>
          BudgetWise
        </div>
        <div className="my-auto max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Know where every rupee goes.
          </h1>
          <p className="mt-4 text-lg text-indigo-100">
            Track spending, automate the bills that repeat, and watch your
            savings goals grow.
          </p>
          <ul className="mt-10 space-y-4">
            {[
              [ChartLine, "Monthly insights that flag unusual spending"],
              [Repeat, "Recurring payments added for you, with reminders"],
              [Target, "Savings goals with progress you can see"],
              [ShieldCheck, "Secure sessions, nothing stored in your browser"],
            ].map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-3 text-indigo-50">
                <span className="grid grid-cols-1 size-9 place-items-center rounded-lg bg-white/10">
                  <Icon size={17} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 right-32 size-40 rounded-full bg-white/5" />
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center bg-base-100 px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 text-lg font-semibold lg:hidden">
            <span className="grid grid-cols-1 size-9 place-items-center rounded-lg bg-primary text-primary-content">
              <Wallet size={18} />
            </span>
            BudgetWise
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {signup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="label-muted mt-1">
            {signup
              ? "It takes less than a minute."
              : "Sign in to see your money at a glance."}
          </p>

          <div className="mt-6">
            <Segmented
              label="Sign in or sign up"
              options={[
                { value: "signin", label: "Sign in" },
                { value: "signup", label: "Create account" },
              ]}
              value={mode}
              onChange={switchMode}
            />
          </div>

          <form
            onSubmit={submit}
            className="mt-6 flex flex-col gap-4"
            noValidate
          >
            {signup && (
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First name"
                  error={errors.firstName}
                  htmlFor="first"
                >
                  <IconInput
                    id="first"
                    icon={User}
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={set("firstName")}
                    invalid={!!errors.firstName}
                  />
                </Field>
                <Field label="Last name" error={errors.lastName} htmlFor="last">
                  <IconInput
                    id="last"
                    icon={User}
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={set("lastName")}
                    invalid={!!errors.lastName}
                  />
                </Field>
              </div>
            )}
            <Field label="Email" error={errors.email} htmlFor="email">
              <IconInput
                id="email"
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                invalid={!!errors.email}
              />
            </Field>
            {signup && (
              <Field label="Mobile number" error={errors.phone} htmlFor="phone">
                <IconInput
                  id="phone"
                  icon={Phone}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="10 digits"
                  value={form.phone}
                  onChange={(e) =>
                    /^\d{0,10}$/.test(e.target.value) && set("phone")(e)
                  }
                  invalid={!!errors.phone}
                />
              </Field>
            )}
            <Field label="Password" error={errors.password} htmlFor="password">
              <IconInput
                id="password"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                autoComplete={signup ? "new-password" : "current-password"}
                value={form.password}
                onChange={set("password")}
                invalid={!!errors.password}
                right={
                  <button
                    type="button"
                    className="text-base-content/50 hover:text-base-content"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              {signup && <PasswordStrength password={form.password} />}
            </Field>
            <button
              type="submit"
              className="btn btn-primary mt-2 w-full"
              disabled={loading}
            >
              {loading && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {signup ? "Create account" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-base-content/60">
            {signup ? "Already have an account? " : "New to BudgetWise? "}
            <button
              className="link link-primary font-medium"
              onClick={() => switchMode(signup ? "signin" : "signup")}
            >
              {signup ? "Sign in" : "Create an account"}
            </button>
          </p>
          <SiteFooter className="mt-10 border-t border-base-300 pt-6" />
        </div>
      </main>
    </div>
  );
}
