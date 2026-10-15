import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import isEmail from "validator/es/lib/isEmail";
import { Mail, MailCheck, ArrowLeft } from "lucide-react";
import { api } from "../utils/api";
import { Field } from "../components/ui";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(email.trim())) return setError("Enter a valid email address.");
    setError("");
    setSending(true);
    const r = await api("/password/forgot", {
      method: "POST",
      body: { email: email.trim() },
    });
    setSending(false);
    if (!r.ok) return toast.error(r.error);
    setSentTo(email.trim());
  };

  return (
    <AuthLayout>
      {sentTo ? (
        <div>
          <span className="mb-5 grid size-12 grid-cols-1 place-items-center rounded-2xl bg-success/10 text-success">
            <MailCheck size={22} />
          </span>
          <h2 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h2>
          <p className="label-muted mt-2">
            If an account exists for <strong>{sentTo}</strong>, we’ve sent a
            link to reset your password. It works once and expires in 30
            minutes.
          </p>
          <p className="label-muted mt-4">
            Nothing arrived? Check spam, or{" "}
            <button
              className="link link-primary"
              onClick={() => setSentTo(null)}
            >
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold tracking-tight">
            Forgot your password?
          </h2>
          <p className="label-muted mt-1">
            Enter your account email and we’ll send you a reset link.
          </p>
          <form
            onSubmit={submit}
            className="mt-6 flex flex-col gap-4"
            noValidate
          >
            <Field label="Email" error={error} htmlFor="forgot-email">
              <label className={`input w-full ${error ? "input-error" : ""}`}>
                <Mail size={16} className="text-base-content/40" aria-hidden />
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </Field>
            <button className="btn btn-primary w-full" disabled={sending}>
              {sending && (
                <span className="loading loading-spinner loading-sm" />
              )}
              Send reset link
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
