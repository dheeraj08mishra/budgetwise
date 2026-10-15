// Recurring frequencies the user can pick, in display order
export const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "halfyearly", label: "Every 6 months" },
  { value: "yearly", label: "Yearly" },
];

const BY_VALUE = Object.fromEntries(FREQUENCIES.map((f) => [f.value, f]));

export const frequencyLabel = (value) => BY_VALUE[value]?.label || value;
