import { useEffect, useId, useRef } from "react";
import { X, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const Card = ({ className = "", children, ...props }) => (
  <section className={`card-surface ${className}`} {...props}>
    {children}
  </section>
);

export const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-3 px-5 pt-5">
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      {subtitle && <p className="label-muted mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="label-muted mt-1">{subtitle}</p>}
    </div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    )}
  </header>
);

// Change vs a previous period. `goodWhenUp` flips the colour for spending.
export const Delta = ({
  value,
  goodWhenUp = true,
  suffix = "vs last month",
}) => {
  if (value === null || value === undefined || !isFinite(value)) {
    return (
      <span className="text-xs text-base-content/50">No earlier data</span>
    );
  }
  const up = value >= 0;
  const good = up === goodWhenUp;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${good ? "text-success" : "text-error"}`}
    >
      <Icon size={14} aria-hidden />
      <span className="num">{Math.abs(value).toFixed(0)}%</span>
      <span className="font-normal text-base-content/50">{suffix}</span>
    </span>
  );
};

export const StatCard = ({
  label,
  value,
  icon: Icon,
  tone = "primary",
  footer,
}) => {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    error: "bg-error/10 text-error",
    violet: "bg-violet-500/10 text-violet-500",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="label-muted">{label}</span>
        {Icon && (
          <span
            className={`grid size-9 place-items-center rounded-xl ${tones[tone]}`}
          >
            <Icon size={18} aria-hidden />
          </span>
        )}
      </div>
      <p className="num mt-3 text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
        {value}
      </p>
      <div className="mt-2 min-h-5">{footer}</div>
    </Card>
  );
};

export const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center">
    {Icon && (
      <span className="mb-4 grid grid-cols-1 size-12 place-items-center rounded-2xl bg-base-200 text-base-content/50">
        <Icon size={22} aria-hidden />
      </span>
    )}
    <p className="font-medium">{title}</p>
    {text && <p className="label-muted mt-1 max-w-sm">{text}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`skeleton rounded-box bg-base-300/60 ${className}`} />
);

// Accessible modal: Esc and backdrop close it, focus moves inside.
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "max-w-md",
}) {
  const titleId = useId();
  const boxRef = useRef(null);
  // Latest onClose without re-running effects: callers often pass a new
  // function every render, which used to steal focus on each keystroke
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Focus once, when the dialog opens: the first form field, else a button
  useEffect(() => {
    if (!open) return;
    const box = boxRef.current;
    (
      box?.querySelector("input, select, textarea") ||
      box?.querySelector(".modal-action button, button")
    )?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCloseRef.current?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="modal modal-open modal-bottom sm:modal-middle"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div ref={boxRef} className={`modal-box ${size} p-0`}>
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
          <h3 id={titleId} className="font-semibold">
            {title}
          </h3>
          <button
            className="btn btn-ghost btn-sm btn-square"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-base-300 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
      <button
        className="modal-backdrop"
        onClick={onClose}
        aria-label="Close dialog"
      />
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  tone = "error",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="max-w-sm"
      footer={
        <>
          <button
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          {/* full class names so Tailwind can see them */}
          <button
            className={`btn ${tone === "error" ? "btn-error" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner loading-sm" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-base-content/70">{message}</p>
    </Modal>
  );
}

// Pill-style single choice
export const Segmented = ({ options, value, onChange, size = "md", label }) => (
  <div
    role="radiogroup"
    aria-label={label}
    className="inline-flex w-fit rounded-field bg-base-200 p-1"
  >
    {options.map((opt) => {
      const active = opt.value === value;
      return (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(opt.value)}
          className={`rounded-[calc(var(--radius-field)-2px)] font-medium transition-colors ${
            size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
          } ${active ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/60 hover:text-base-content"}`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

export const Field = ({ label, hint, error, children, htmlFor }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
    )}
    {children}
    {error ? (
      <p className="text-xs text-error">{error}</p>
    ) : hint ? (
      <p className="text-xs text-base-content/50">{hint}</p>
    ) : null}
  </div>
);

export const Spinner = ({ className = "" }) => (
  <div className={`flex justify-center py-16 ${className}`}>
    <span
      className="loading loading-spinner loading-lg text-primary"
      aria-label="Loading"
    />
  </div>
);
