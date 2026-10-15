const KEY = "theme";
const EVENT = "bw-theme-change";
export const THEMES = { light: "bw-light", dark: "bw-dark" };

const osTheme = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? THEMES.dark
    : THEMES.light;

// What the user picked on this device: "light", "dark" or "system".
// (Older versions stored "light"/"dark"; nothing saved means "system".)
export function themeChoice() {
  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {
    /* storage blocked: follow the OS */
  }
  if (saved === "light" || saved === THEMES.light) return "light";
  if (saved === "dark" || saved === THEMES.dark) return "dark";
  return "system";
}

// The theme to show right now
export function initialTheme() {
  const choice = themeChoice();
  return choice === "system" ? osTheme() : THEMES[choice];
}

// Shows a theme without saving it, and tells every theme control
const show = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: theme }));
};

// On page load: show the chosen (or OS) theme without saving anything,
// so "Match system" stays "Match system"
export const startTheme = () =>
  document.documentElement.setAttribute("data-theme", initialTheme());

// Shows and saves an explicit theme (the light/dark toggle)
export function applyTheme(theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* not critical */
  }
  show(theme);
}

// Settings page: "light", "dark", or "system" to follow the OS again
export function setThemeChoice(choice) {
  if (choice !== "system") return applyTheme(THEMES[choice]);
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* not critical */
  }
  show(osTheme());
}

// Keeps a component in sync with theme changes made anywhere, and follows
// the OS while the choice is "system". Returns an unsubscribe function.
export function onThemeChange(callback) {
  const onEvent = (e) => callback(e.detail);
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  const onOs = () => themeChoice() === "system" && show(osTheme());
  window.addEventListener(EVENT, onEvent);
  mq?.addEventListener?.("change", onOs);
  return () => {
    window.removeEventListener(EVENT, onEvent);
    mq?.removeEventListener?.("change", onOs);
  };
}
