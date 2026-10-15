import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, ArrowLeft, Link2Off } from "lucide-react";
import { api } from "../utils/api";
import { Field } from "../components/ui";
import AuthLayout from "../components/AuthLayout";
import PasswordStrength from "../components/PasswordStrength";
import { isStrongPassword } from "../utils/password";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [form, setForm] = useState({ next: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [linkBroken, setLinkBroken] = useState(!/^[a-f0-9]{64}$/.test(token));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isStrongPassword(form.next))
      errs.next = "Doesn’t meet all the rules below.";
    else if (form.next !== form.next.trim())
      errs.next = "Can’t start or end with a space.";
    if (form.confirm !== form.next) errs.confirm = "Passwords don’t match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    const r = await api("/password/reset", {
      method: "POST",
      body: { token, newPassword: form.next },
    });
    setSaving(false);
    if (!r.ok) {
      if (/invalid or has expired/.test(r.error)) return setLinkBroken(true);
      return setErrors({ next: r.error }); // e.g. one of the last 3 passwords
    }
    toast.success(r.data.message);
    navigate("/", { replace: true });
  };

  const type = show ? "text" : "password";
  return (
    <AuthLayout>
      {linkBroken ? (
        <div>
          <span className="mb-5 grid size-12 grid-cols-1 place-items-center rounded-2xl bg-warning/15 text-warning">
            <Link2Off size={22} />
          </span>
          <h2 className="text-2xl font-semibold tracking-tight">
            This link has expired
          </h2>
          <p className="label-muted mt-2">
            Reset links work once and expire after 30 minutes. Ask for a new one
            and use it straight away.
          </p>
          <Link to="/forgot-password" className="btn btn-primary mt-6 w-full">
            Send a new link
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold tracking-tight">
            Choose a new password
          </h2>
          <p className="label-muted mt-1">
            You’ll be signed out everywhere and can sign in with the new one.
          </p>
          <form
            onSubmit={submit}
            className="mt-6 flex flex-col gap-4"
            noValidate
          >
            <Field
              label="New password"
              hint="Can’t be one of your last 3 passwords."
              error={errors.next}
              htmlFor="reset-new"
            >
              <label
                className={`input w-full ${errors.next ? "input-error" : ""}`}
              >
                <Lock size={16} className="text-base-content/40" aria-hidden />
                <input
                  id="reset-new"
                  type={type}
                  autoComplete="new-password"
                  autoFocus
                  value={form.next}
                  onChange={set("next")}
                />
                <button
                  type="button"
                  className="text-base-content/50 hover:text-base-content"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide passwords" : "Show passwords"}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>
              <PasswordStrength password={form.next} />
            </Field>
            <Field
              label="Confirm new password"
              error={errors.confirm}
              htmlFor="reset-confirm"
            >
              <input
                id="reset-confirm"
                type={type}
                autoComplete="new-password"
                className={`input w-full ${errors.confirm ? "input-error" : ""}`}
                value={form.confirm}
                onChange={set("confirm")}
              />
            </Field>
            <button className="btn btn-primary w-full" disabled={saving}>
              {saving && (
                <span className="loading loading-spinner loading-sm" />
              )}
              Reset password
            </button>
          </form>
        </>
      )}
      <Link
        to="/"
        className="link link-hover mt-6 inline-flex items-center gap-1 text-sm text-base-content/65"
      >
        <ArrowLeft size={14} /> Back to sign in
      </Link>
    </AuthLayout>
  );
}
