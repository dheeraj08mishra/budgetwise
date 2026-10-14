export const BASE_URL =
  process.env.API_URL ||
  (location.hostname === "localhost" ? "http://localhost:3000" : "/api");
