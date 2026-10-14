import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";

const container = document.getElementById("root");
const root = createRoot(container);
// StrictMode (development only) double-runs effects to surface bugs
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
