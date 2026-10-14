const KEY = "theme";
export const THEMES = { light: "bw-light", dark: "bw-dark" };

// Saved choice, else the OS preference. (Older versions stored
// "light"/"dark"; those map onto the new theme names.)
export function initialTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {
    /* storage blocked: fall back to the OS preference */
  }
  if (saved === "light" || saved === THEMES.light) return THEMES.light;
  if (saved === "dark" || saved === THEMES.dark) return THEMES.dark;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? THEMES.dark
    : THEMES.light;
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* not critical */
  }
}
