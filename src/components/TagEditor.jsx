import { useId, useState } from "react";
import { X } from "lucide-react";
import { MAX_TAGS, normalizeTag, isValidTag } from "../utils/tags";

// Chips with ×; type and press Enter (or comma) to add. Backspace on an
// empty input removes the last tag. `suggestions` fill a datalist.
export default function TagEditor({ tags, onChange, suggestions = [], id }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const listId = useId();

  const add = (raw) => {
    const tag = normalizeTag(raw);
    if (!tag) return;
    if (!isValidTag(tag)) {
      setError("1-20 letters or numbers (spaces, & ' - allowed).");
      return;
    }
    if (tags.includes(tag)) return setDraft("");
    if (tags.length >= MAX_TAGS) {
      setError(`At most ${MAX_TAGS} tags.`);
      return;
    }
    onChange([...tags, tag]);
    setDraft("");
    setError("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="input flex h-auto min-h-10 w-full flex-wrap items-center gap-1.5 py-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-0.5 pr-1 pl-2.5 text-xs text-primary"
          >
            {tag}
            <button
              type="button"
              className="rounded-full p-0.5 hover:bg-primary/15"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              aria-label={`Remove tag ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          list={listId}
          className="min-w-24 flex-1 bg-transparent outline-none"
          placeholder={tags.length ? "Add another…" : "e.g. food, weekend"}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value.replace(",", ""));
            setError("");
          }}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          maxLength={20}
        />
        <datalist id={listId}>
          {suggestions
            .filter((s) => !tags.includes(s))
            .map((s) => (
              <option key={s} value={s} />
            ))}
        </datalist>
      </div>
      <p
        className={`mt-1 text-xs ${error ? "text-error" : "text-base-content/50"}`}
      >
        {error || "Press Enter to add a tag."}
      </p>
    </div>
  );
}
