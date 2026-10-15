import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Repeat,
  Target,
  ChartLine,
  User,
  Plus,
  LogOut,
  Sun,
  Moon,
  MessageSquare,
  Wallet,
  ShieldCheck,
  Settings,
  WifiOff,
} from "lucide-react";
import { logout } from "../utils/redux/profileSlice";
import { removeAllTransactions } from "../utils/redux/transactionSlice";
import { api } from "../utils/api";
import { clearOfflineData, useOnline } from "../utils/pwa";
import {
  THEMES,
  applyTheme,
  initialTheme,
  onThemeChange,
} from "../utils/theme";
import FeedbackModal from "./FeedbackModal";
import SiteFooter from "./SiteFooter";
import { capitalize } from "../utils/format";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/recurring", label: "Recurring", icon: Repeat },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/insights", label: "Insights", icon: ChartLine },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

// Phone tab bar: four destinations around a central Add button
const MOBILE_NAV = [NAV[0], NAV[1], null, NAV[3], NAV[4]];

const Logo = () => (
  <Link
    to="/"
    className="flex items-center gap-2.5 font-semibold tracking-tight"
  >
    <span className="grid grid-cols-1 size-8 place-items-center rounded-lg bg-primary text-primary-content">
      <Wallet size={17} aria-hidden />
    </span>
    <span className="text-lg">BudgetWise</span>
  </Link>
);

const Avatar = ({ user, size = "size-9" }) => {
  const [broken, setBroken] = useState(false);
  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
  return user?.photo && !broken ? (
    <img
      src={user.photo}
      alt=""
      className={`${size} shrink-0 rounded-full object-cover`}
      onError={() => setBroken(true)}
    />
  ) : (
    <span
      className={`${size} grid shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary`}
    >
      {initials || "?"}
    </span>
  );
};
export { Avatar };

const AppShell = () => {
  const user = useSelector((s) => s.profile.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(initialTheme);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const online = useOnline();

  // the Settings page (or the OS, on "system") can change it too
  useEffect(() => onThemeChange(setTheme), []);

  const toggleTheme = () =>
    applyTheme(theme === THEMES.dark ? THEMES.light : THEMES.dark);

  const signOut = async () => {
    await api("/logout", { method: "POST" });
    clearOfflineData();
    dispatch(logout());
    dispatch(removeAllTransactions());
    toast.success("Signed out");
    navigate("/");
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-field px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary/10 text-primary"
        : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
    }`;

  // The Admin page is listed for admins only (the API enforces it too)
  const isAdmin = user?.role === "admin";
  const nav = isAdmin
    ? [...NAV, { to: "/admin", label: "Admin", icon: ShieldCheck }]
    : NAV;

  const fullName =
    capitalize(user?.firstName) + " " + capitalize(user?.lastName);

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-base-300 bg-base-100 lg:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <div className="px-4">
          <Link to="/add" className="btn btn-primary w-full">
            <Plus size={18} aria-hidden /> Add transaction
          </Link>
        </div>
        <nav className="mt-5 flex flex-1 flex-col gap-1 px-3" aria-label="Main">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navClass}>
              <Icon size={18} aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-col gap-1 px-3 pb-3">
          <button
            className="flex items-center gap-3 rounded-field px-3 py-2 text-sm text-base-content/70 hover:bg-base-200"
            onClick={() => setFeedbackOpen(true)}
          >
            <MessageSquare size={18} aria-hidden /> Send feedback
          </button>
          <button
            className="flex items-center gap-3 rounded-field px-3 py-2 text-sm text-base-content/70 hover:bg-base-200"
            onClick={toggleTheme}
          >
            {theme === THEMES.dark ? (
              <Sun size={18} aria-hidden />
            ) : (
              <Moon size={18} aria-hidden />
            )}
            {theme === THEMES.dark ? "Light mode" : "Dark mode"}
          </button>
        </div>
        <div className="flex items-center gap-3 border-t border-base-300 px-4 py-4">
          <Avatar user={user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{fullName}</p>
            <p className="truncate text-xs text-base-content/50">
              {user?.email}
            </p>
          </div>
          <button
            className="btn btn-ghost btn-sm btn-square"
            onClick={signOut}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-base-300 bg-base-100/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <button
            className="btn btn-ghost btn-sm btn-square"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === THEMES.dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Account menu"
            >
              <Avatar user={user} size="size-8" />
            </button>
            <ul
              tabIndex={0}
              className="menu dropdown-content z-40 mt-2 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
            >
              <li>
                <Link to="/profile">
                  <User size={16} /> Profile
                </Link>
              </li>
              <li>
                <Link to="/settings">
                  <Settings size={16} /> Settings
                </Link>
              </li>
              <li>
                <Link to="/recurring">
                  <Repeat size={16} /> Recurring
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin">
                    <ShieldCheck size={16} /> Admin
                  </Link>
                </li>
              )}
              <li>
                <button onClick={() => setFeedbackOpen(true)}>
                  <MessageSquare size={16} /> Send feedback
                </button>
              </li>
              <li>
                <button className="text-error" onClick={signOut}>
                  <LogOut size={16} /> Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
        {!online && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2 rounded-box border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm"
          >
            <WifiOff size={16} className="shrink-0 text-warning" aria-hidden />
            You&rsquo;re offline. Showing what was loaded last; changes
            can&rsquo;t be saved until you&rsquo;re back online.
          </div>
        )}
        <Outlet />
        <SiteFooter className="mt-12 border-t border-base-300 pt-6" />
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-base-300 bg-base-100/95 backdrop-blur lg:hidden"
        aria-label="Main"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
          {MOBILE_NAV.map((item) =>
            item ? (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-1 text-[11px] font-medium ${isActive ? "text-primary" : "text-base-content/55"}`
                }
              >
                <item.icon size={20} aria-hidden />
                {item.label}
              </NavLink>
            ) : (
              <Link
                key="add"
                to="/add"
                className="mx-auto -mt-6 grid grid-cols-1 size-14 place-items-center rounded-full bg-primary text-primary-content shadow-lg shadow-primary/30"
                aria-label="Add transaction"
              >
                <Plus size={26} />
              </Link>
            )
          )}
        </div>
      </nav>

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
};

export default AppShell;
