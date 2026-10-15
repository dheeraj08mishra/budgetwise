import { format } from "date-fns";

// Today's date in the user's own timezone, as "YYYY-MM-DD".
// (toISOString() gives the UTC date, which is yesterday in IST before 05:30.)
export const todayString = () => format(new Date(), "yyyy-MM-dd");

// Transaction dates are calendar days stored as UTC midnight. Read them in
// UTC, or users west of UTC would see the previous day.
export const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

export const formatDay = (date, options = {}) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
    timeZone: "UTC",
  });

export const firstOfMonthString = () => todayString().slice(0, 8) + "01";
