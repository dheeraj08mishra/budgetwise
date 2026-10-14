import toast from "react-hot-toast";
import { BASE_URL } from "./constants";
import store from "./redux/appStore";
import { logout } from "./redux/profileSlice";
import { removeAllTransactions } from "./redux/transactionSlice";

// Paths where a 401 is an expected answer, not an expired session
const AUTH_PATHS = ["/login", "/signup", "/me"];

/**
 * fetch wrapper for the BudgetWise API.
 * Always resolves (except on abort) to { ok, status, data, error, res }.
 * On 401 for a logged-in user it logs out and explains why.
 */
export async function api(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    return { ok: false, status: 0, data: null, error: "Can't reach the server. Check your connection." };
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (
    res.status === 401 &&
    !AUTH_PATHS.includes(path) &&
    store.getState().profile.currentUser
  ) {
    store.dispatch(logout());
    store.dispatch(removeAllTransactions());
    toast.error("Your session expired. Please sign in again.", { id: "session-expired" });
  }

  const error = res.ok
    ? null
    : res.status === 429
      ? data?.message || "Too many requests. Please wait a moment."
      : data?.message || data?.error || "Something went wrong. Please try again.";
  return { ok: res.ok, status: res.status, data, error, res };
}
