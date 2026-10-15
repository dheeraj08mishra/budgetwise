import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import App from "./components/App";
import toast from "react-hot-toast";
import { startTheme } from "./utils/theme";
import { registerServiceWorker } from "./utils/pwa";
import "./index.css";

// Set the theme before the first paint (no light/dark flash)
startTheme();

const root = createRoot(document.getElementById("root"));
// StrictMode (development only) double-runs effects to surface bugs
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Installed app / offline support (production builds only)
registerServiceWorker({
  onUpdate: (apply) =>
    toast(
      (t) => (
        <span className="flex items-center gap-3">
          A new version of BudgetWise is ready.
          <button
            className="btn btn-primary btn-xs"
            onClick={() => {
              toast.dismiss(t.id);
              apply();
            }}
          >
            Reload
          </button>
        </span>
      ),
      { id: "sw-update", duration: Infinity }
    ),
});
