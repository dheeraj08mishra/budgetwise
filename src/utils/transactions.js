import { dayKey } from "./dates.js";

// order: "newest" | "oldest" by transaction date (ties: when added),
// or "server" to keep the given order (e.g. sorted by amount)
export const sortTransactions = (list, order = "newest") => {
  if (order === "server") return list;
  const dir = order === "oldest" ? -1 : 1;
  return [...list].sort(
    (a, b) =>
      dir * dayKey(b.date).localeCompare(dayKey(a.date)) ||
      dir * (new Date(b.createdAt) - new Date(a.createdAt))
  );
};
