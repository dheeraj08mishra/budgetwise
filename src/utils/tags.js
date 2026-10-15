// Same rules as the server (utils/tags/normalizeTags.js).
// \p{M} matters: Hindi vowel signs (matras) are marks, not letters.
export const MAX_TAGS = 10;
const TAG_RE = /^[\p{L}\p{N}][\p{L}\p{M}\p{N} &'-]{0,19}$/u;

export const normalizeTag = (tag) =>
  typeof tag === "string" ? tag.trim().replace(/\s+/g, " ").toLowerCase() : "";

export const isValidTag = (tag) => TAG_RE.test(tag);
