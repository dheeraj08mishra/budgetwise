import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Sun,
  Moon,
  Monitor,
  User,
  ChevronRight,
  Download,
  CircleCheck,
  Share,
} from "lucide-react";
import { api } from "../utils/api";
import { money } from "../utils/format";
import { CATEGORIES, EXPENSE_CATEGORIES } from "../utils/categories";
import { themeChoice, setThemeChoice, onThemeChange } from "../utils/theme";
import { updateProfile } from "../utils/redux/profileSlice";
import { useInstallState, promptInstall } from "../utils/pwa";
import { Card, CardHeader, PageHeader, Skeleton } from "../components/ui";
import FrequencyPicker from "../components/FrequencyPicker";
import NotificationSettings from "../components/NotificationSettings";
import { BudgetsModal } from "../components/Budgets";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Match system", icon: Monitor },
];

// Light / dark / follow the OS. Kept in this browser only.
function Appearance() {
  const [choice, setChoice] = useState(themeChoice);
  // the sidebar toggle changes it too
  useEffect(() => onThemeChange(() => setChoice(themeChoice())), []);
  const pick = (value) => {
    setThemeChoice(value);
    setChoice(value);
  };
  return (
    <Card>
      <CardHeader
        title="Appearance"
        subtitle="Saved in this browser, so each device can differ."
      />
      <div
        role="radiogroup"
        aria-label="Theme"
        className="grid grid-cols-3 gap-2 p-5"
      >
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = choice === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => pick(value)}
              className={`flex flex-col items-center gap-1.5 rounded-field border px-2 py-3 text-sm transition-colors ${
                active
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-base-300 hover:bg-base-200"
              }`}
            >
              <Icon size={18} aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// Defaults for the Add transaction form; each choice saves straight away
function TransactionDefaults() {
  const dispatch = useDispatch();
  const prefs = useSelector((s) => s.profile.currentUser?.preferences) || {};
  const category = prefs.defaultCategory || "need";
  const frequency = prefs.defaultFrequency || "monthly";

  const save = async (change) => {
    const r = await api("/user/preferences", { method: "PATCH", body: change });
    if (!r.ok) return toast.error(r.error);
    dispatch(updateProfile({ preferences: r.data.preferences }));
    toast.success("Saved", { id: "prefs" });
  };

  return (
    <Card>
      <CardHeader
        title="New transactions"
        subtitle="What the Add transaction form starts with."
      />
      <div className="flex flex-col gap-5 p-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Default category</legend>
          <div
            role="radiogroup"
            aria-label="Default category"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {EXPENSE_CATEGORIES.map((key) => {
              const c = CATEGORIES[key];
              const active = category === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => !active && save({ defaultCategory: key })}
                  className={`flex flex-col items-center gap-1.5 rounded-field border px-2 py-3 text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-base-300 hover:bg-base-200"
                  }`}
                >
                  <c.icon size={18} style={{ color: c.color }} aria-hidden />
                  {c.label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div>
          <p className="mb-2 text-sm font-medium">
            When you switch on &ldquo;Repeat automatically&rdquo;
          </p>
          <FrequencyPicker
            label="Default repeat"
            value={frequency}
            onChange={(f) => f !== frequency && save({ defaultFrequency: f })}
          />
        </div>
      </div>
    </Card>
  );
}

// This month's budgets at a glance, edited in the same dialog as the Dashboard
function BudgetSettings() {
  const [rows, setRows] = useState(null);
  const [income, setIncome] = useState(0);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let alive = true;
    api("/budgets").then(({ ok, data }) => alive && ok && setRows(data.data));
    // for "Suggest from income"
    api("/insights/forecast").then(
      ({ ok, data }) => alive && ok && setIncome(data.income || 0)
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader
        title="Monthly budgets"
        subtitle="A warning at 80%, and when you go over."
        action={
          <button
            className="btn btn-sm btn-ghost border-base-300"
            onClick={() => setEditing(true)}
            disabled={!rows}
          >
            Edit budgets
          </button>
        }
      />
      {!rows ? (
        <div className="p-5">
          <Skeleton className="h-24" />
        </div>
      ) : (
        <ul className="divide-y divide-base-300 pt-2">
          {rows.map((r) => (
            <li
              key={r.category}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span>{CATEGORIES[r.category].label}</span>
              <span
                className={r.limit ? "num font-medium" : "text-base-content/50"}
              >
                {r.limit ? `${money(r.limit)} / month` : "No budget"}
              </span>
            </li>
          ))}
        </ul>
      )}
      {editing && (
        <BudgetsModal
          open
          rows={rows}
          income={income}
          onClose={() => setEditing(false)}
          onSaved={(saved) => {
            setRows(saved);
            setEditing(false);
          }}
        />
      )}
    </Card>
  );
}

// Home-screen app: one tap where the browser allows it, steps on iPhone
function InstallApp() {
  const state = useInstallState();
  const install = async () => {
    if (await promptInstall()) toast.success("BudgetWise was installed");
  };
  const body = {
    installed: (
      <p className="flex items-center gap-2 text-sm">
        <CircleCheck size={16} className="text-success" aria-hidden />
        You&rsquo;re using the installed app.
      </p>
    ),
    available: (
      <button className="btn btn-primary btn-sm" onClick={install}>
        <Download size={16} /> Install BudgetWise
      </button>
    ),
    ios: (
      <p className="text-sm text-base-content/70">
        In Safari, tap <Share size={14} className="inline" aria-label="Share" />{" "}
        Share, then <span className="font-medium">Add to Home Screen</span>.
      </p>
    ),
    unsupported: (
      <p className="text-sm text-base-content/70">
        Open BudgetWise in Chrome or Edge (or Safari on iPhone) to install it.
      </p>
    ),
  }[state];
  return (
    <Card>
      <CardHeader
        title="Install the app"
        subtitle="Opens from your home screen in its own window, and shows your last-loaded data when you're offline."
      />
      <div className="p-5">{body}</div>
    </Card>
  );
}

export default function Settings() {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="How BudgetWise looks, behaves and keeps you posted."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Appearance />
          <TransactionDefaults />
          <InstallApp />
        </div>
        <div className="flex flex-col gap-6">
          <NotificationSettings />
          <BudgetSettings />
          <Link
            to="/profile"
            className="card-surface flex items-center gap-3 px-5 py-4 text-sm hover:bg-base-200/50"
          >
            <User size={18} className="text-base-content/50" aria-hidden />
            <span className="flex-1">
              <span className="block font-medium">Profile and password</span>
              <span className="block text-xs text-base-content/55">
                Name, phone, photo, change password
              </span>
            </span>
            <ChevronRight size={16} className="text-base-content/40" />
          </Link>
        </div>
      </div>
    </div>
  );
}
