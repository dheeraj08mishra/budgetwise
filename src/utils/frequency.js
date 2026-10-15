// Recurring frequencies the user can pick, in display order
export const FREQUENCIES = [
  { value: "daily", label: "Daily", perMonth: 30 },
  { value: "weekly", label: "Weekly", perMonth: 52 / 12 },
  { value: "biweekly", label: "Every 2 weeks", perMonth: 26 / 12 },
  { value: "monthly", label: "Monthly", perMonth: 1 },
  { value: "quarterly", label: "Quarterly", perMonth: 1 / 3 },
  { value: "halfyearly", label: "Every 6 months", perMonth: 1 / 6 },
  { value: "yearly", label: "Yearly", perMonth: 1 / 12 },
];

const BY_VALUE = Object.fromEntries(FREQUENCIES.map((f) => [f.value, f]));

export const frequencyLabel = (value) => BY_VALUE[value]?.label || value;

// Rough monthly amount of a recurring rule, for summaries
export const monthlyAmount = (rule) =>
  rule.amount * (BY_VALUE[rule.frequency]?.perMonth ?? 1);
