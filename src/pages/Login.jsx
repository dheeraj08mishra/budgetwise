import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import isEmail from "validator/es/lib/isEmail";
import { Eye, EyeOff, Mail, Lock, Phone, User } from "lucide-react";
import { updateProfile, logout } from "../utils/redux/profileSlice";
import { removeAllTransactions } from "../utils/redux/transactionSlice";
import { resetSalary } from "../utils/redux/budgetSlice";
import { api } from "../utils/api";
import { Segmented, Field } from "../components/ui";
import AuthLayout from "../components/AuthLayout";
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
    // Admins start on the Admin page; everyone else on their Dashboard
    navigate(data.user.role === "admin" ? "/admin" : "/");
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
  };

  return (
    <AuthLayout>
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

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
        {signup && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" error={errors.firstName} htmlFor="first">
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
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          {signup && <PasswordStrength password={form.password} />}
          {!signup && (
            <Link
              to="/forgot-password"
              className="link link-hover mt-1 self-end text-xs text-base-content/65"
            >
              Forgot password?
            </Link>
          )}
        </Field>
        <button
          type="submit"
          className="btn btn-primary mt-2 w-full"
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner loading-sm" />}
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
    </AuthLayout>
  );
}
