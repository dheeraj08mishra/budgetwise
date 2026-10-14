import {
  Home,
  ShoppingBag,
  TrendingUp,
  Ellipsis,
  Target,
  ArrowDownLeft,
} from "lucide-react";

// Display metadata per category. Colours are fixed hex values because
// chart libraries draw SVG and can't read CSS variables in attributes.
export const CATEGORIES = {
  need: { label: "Needs", icon: Home, color: "#10b981", hint: "Rent, groceries, bills" },
  want: { label: "Wants", icon: ShoppingBag, color: "#f59e0b", hint: "Dining, shopping, fun" },
  investment: { label: "Investments", icon: TrendingUp, color: "#3b82f6", hint: "SIPs, stocks" },
  other: { label: "Other", icon: Ellipsis, color: "#94a3b8", hint: "Everything else" },
  goal: { label: "Savings goals", icon: Target, color: "#8b5cf6", hint: "Goal contributions" },
};

export const INCOME_META = { label: "Income", icon: ArrowDownLeft, color: "#10b981" };

// Categories a user can pick for an expense
export const EXPENSE_CATEGORIES = ["need", "want", "investment", "other"];

export const categoryMeta = (txn) =>
  txn.type === "income" || txn.type === "credit"
    ? INCOME_META
    : CATEGORIES[txn.category] || CATEGORIES.other;

export const isIncome = (txn) => txn.type === "income" || txn.type === "credit";
export const isSavings = (txn) => txn.category === "goal";
// Real spending: expenses that are not money moved into a goal
export const isSpending = (txn) => txn.type === "expense" && !isSavings(txn);
