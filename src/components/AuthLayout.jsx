import { Wallet, ChartLine, Repeat, Target, ShieldCheck } from "lucide-react";
import SiteFooter from "./SiteFooter";

const FEATURES = [
  [ChartLine, "Monthly insights that flag unusual spending"],
  [Repeat, "Recurring payments added for you, with reminders"],
  [Target, "Savings goals with progress you can see"],
  [ShieldCheck, "Secure sessions, nothing stored in your browser"],
];

// Signed-out pages (sign in, forgot / reset password): brand panel + form
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-2.5 text-lg font-semibold">
          <span className="grid size-9 grid-cols-1 place-items-center rounded-lg bg-white/15">
            <Wallet size={18} />
          </span>
          BudgetWise
        </div>
        <div className="my-auto max-w-md">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight">
            Know where every rupee goes.
          </h1>
          <p className="mt-4 text-lg text-indigo-100">
            Track spending, automate the bills that repeat, and watch your
            savings goals grow.
          </p>
          <ul className="mt-10 space-y-4">
            {FEATURES.map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-3 text-indigo-50">
                <span className="grid size-9 grid-cols-1 place-items-center rounded-lg bg-white/10">
                  <Icon size={17} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute right-32 -bottom-10 size-40 rounded-full bg-white/5" />
      </aside>

      <main className="flex items-center justify-center bg-base-100 px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 text-lg font-semibold lg:hidden">
            <span className="grid size-9 grid-cols-1 place-items-center rounded-lg bg-primary text-primary-content">
              <Wallet size={18} />
            </span>
            BudgetWise
          </div>
          {children}
          <SiteFooter className="mt-10 border-t border-base-300 pt-6" />
        </div>
      </main>
    </div>
  );
}
