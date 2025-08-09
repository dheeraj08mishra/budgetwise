import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/redux/profileSlice";
import { toast } from "react-hot-toast";
import { BASE_URL } from "../utils/constants";

const Header = () => {
  const user = useSelector((store) => store.profile.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // Apply theme on load
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const logoutUser = async () => {
    if (user) {
      try {
        const response = await fetch(BASE_URL + "/logout", {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          toast.error("Failed to log out. Please try again.");
          return;
        }
        const data = await response.json();
        toast.success(data.message);
        dispatch(logout());
        navigate("/");
      } catch (err) {
        console.error("Error signing out:", err);
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-md sticky top-0 z-50 px-2 sm:px-4">
      <div className="flex-1">
        <Link
          to="/"
          className="btn btn-ghost normal-case text-lg sm:text-2xl hover:underline px-1 sm:px-4 min-h-0"
        >
          <h1 className="text-3xl font-extrabold">Budget Wise</h1>
        </Link>
        <span className="hidden sm:inline text-sm text-muted-foreground mt-1 sm:mt-0">
          Smarter budgeting. Clearer insights.
        </span>
      </div>

      {/* Theme Toggle */}
      <div className="px-10">
        <label className="flex cursor-pointer gap-2 items-center">
          <span className="label-text">🌙</span>
          <input
            type="checkbox"
            className="toggle"
            onChange={toggleTheme}
            checked={theme === "light"}
          />
          <span className="label-text">☀️</span>
        </label>
      </div>

      {/* User Menu */}
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle avatar hover:scale-105 transition-transform min-h-0"
        >
          <div className="w-8 sm:w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img
              alt="User avatar"
              src={
                user?.photo ||
                "https://s3.amazonaws.com/37assets/svn/765-default-avatar.png"
              }
            />
          </div>
        </div>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-40 sm:w-52"
        >
          <li>
            <Link to="/" className="py-2">
              🏠 Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className="py-2 flex items-center justify-between"
            >
              <span>👤 Profile</span>
            </Link>
          </li>
          <li>
            <Link to="/transactions" className="py-2">
              ➕ Add Transaction
            </Link>
          </li>
          <li>
            <Link
              to="/recurring"
              className="py-2 flex items-center justify-between"
            >
              <span>🔁 Recurring</span>
            </Link>
          </li>

          <li>
            <Link to="/goals" className="py-2 items-center justify-between">
              🎯 Goals
              <span className="badge badge-primary ml-2">New</span>
            </Link>
          </li>
          <li>
            <Link to="/history" className="py-2">
              📜 History
            </Link>
          </li>
          <li>
            <button
              onClick={logoutUser}
              className="text-error hover:text-red-700 py-2 text-left w-full"
            >
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;
