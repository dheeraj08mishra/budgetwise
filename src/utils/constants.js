// API base URL.
// - API_URL at build time wins (e.g. API_URL=http://localhost:3001)
// - production build: same origin, nginx proxies /api to the server
// - development: the API on port 3000 of whatever host served the page
//   (works for localhost, 127.0.0.1 and LAN IPs alike)
export const BASE_URL =
  process.env.API_URL ||
  (process.env.NODE_ENV === "production"
    ? "/api"
    : `${location.protocol}//${location.hostname}:3000`);
