import { useDispatch } from "react-redux";
import { updateProfile, logout } from "../utils/redux/profileSlice";
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";
import { removeAllTransactions } from "../utils/redux/transactionSlice";
import { resetSalary } from "../utils/redux/budgetSlice";

// Restores the session from the auth cookie once on load. Until /me answers
// we show a loader, so a logged-in user never sees the login form flash.
const AuthObserver = ({ children }) => {
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const restoreUser = async () => {
      try {
        const res = await fetch(BASE_URL + "/me", { credentials: "include" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        dispatch(logout());
        dispatch(removeAllTransactions()); // clear previous transactions
        dispatch(resetSalary());
        dispatch(updateProfile(data.user)); // restore into Redux
      } catch (err) {
        console.error("Error restoring user:", err);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    restoreUser();
    return () => {
      cancelled = true; // StrictMode runs effects twice in development
    };
  }, [dispatch]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" aria-label="Loading" />
      </div>
    );
  }
  return children;
};
export default AuthObserver;
