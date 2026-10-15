// API base URL. The app always calls /api on its own origin: nginx proxies
// it in production, the Vite dev server proxies it in development.
// VITE_API_URL overrides it (e.g. to call a remote API directly).
export const BASE_URL = import.meta.env.VITE_API_URL || "/api";
