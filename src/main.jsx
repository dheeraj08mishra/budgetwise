import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import App from "./components/App";
import { startTheme } from "./utils/theme";
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
