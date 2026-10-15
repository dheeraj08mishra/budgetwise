const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const inr2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// ₹85,000 — paise shown only when present
export const money = (n, { exact = false } = {}) =>
  (exact ? inr2 : inr0).format(Number(n) || 0);

// ₹1.2L / ₹85k style, for chart axes
export const moneyShort = (n) => {
  const v = Math.abs(Number(n) || 0);
  const sign = n < 0 ? "-" : "";
  if (v >= 1e7) return `${sign}₹${(v / 1e7).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (v >= 1e5) return `${sign}₹${(v / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  if (v >= 1e3) return `${sign}₹${(v / 1e3).toFixed(0)}k`;
  return `${sign}₹${v}`;
};

export const percent = (n, digits = 0) =>
  `${(Number(n) || 0).toFixed(digits)}%`;

// Percentage change a -> b, or null when there is nothing to compare
export const change = (current, previous) =>
  previous ? ((current - previous) / previous) * 100 : null;

export const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Month numbers as a label: "Jan–Sep", "Feb", or "5 months" when they
// aren't one unbroken run
export function periodLabel(period) {
  if (!period?.length) return "";
  const short = (m) => MONTHS[m - 1].slice(0, 3);
  const first = period[0];
  const last = period[period.length - 1];
  if (last - first + 1 !== period.length) return `${period.length} months`;
  return first === last ? short(first) : `${short(first)}–${short(last)}`;
}

// "just now", "5 min ago", "3 h ago", "2 days ago", then a date
export function timeAgo(date, now = Date.now()) {
  const mins = Math.floor((now - new Date(date)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
