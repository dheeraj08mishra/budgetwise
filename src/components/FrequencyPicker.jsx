import { FREQUENCIES } from "../utils/frequency";

// Wrapping chip group (7 options don't fit a single segmented row on phones)
export default function FrequencyPicker({
  value,
  onChange,
  label = "Frequency",
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {FREQUENCIES.map((f) => {
        const active = f.value === value;
        return (
          <button
            key={f.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(f.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-base-300 text-base-content/70 hover:bg-base-200"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
