import { useEffect, useState } from "react";

// Must match pwa/sw.js
const API_CACHE = "bw-api";

// Production builds only: dev and the e2e run without a service worker.
// onUpdate(apply) fires when a new version is downloaded and waiting;
// apply() switches to it and reloads.
export function registerServiceWorker({ onUpdate }) {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", async () => {
    let reg;
    try {
      reg = await navigator.serviceWorker.register("/sw.js");
    } catch (err) {
      console.error("Service worker not registered:", err);
      return;
    }
    const offer = (worker) =>
      onUpdate(() => {
        navigator.serviceWorker.addEventListener("controllerchange", () =>
          window.location.reload()
        );
        worker.postMessage("skip-waiting");
      });
    // only an update if a worker already controls this page
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const worker = reg.installing;
      worker?.addEventListener("statechange", () => {
        if (
          worker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          offer(worker);
        }
      });
    });
  });
}

// Data the app showed offline belongs to whoever was signed in: wipe it on
// sign-in, sign-out and session expiry, so the next person never sees it
export function clearOfflineData() {
  if (typeof caches !== "undefined") caches.delete(API_CACHE).catch(() => {});
}

// ---------- install ----------
let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

// Chrome / Edge / Android fire this when the app can be installed
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault(); // we show our own button in Settings
  deferredPrompt = e;
  notify();
});
window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  notify();
});

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;
const isIos = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// "installed" | "available" (one-tap install) | "ios" (Share menu) |
// "unsupported" (this browser can't install apps)
export function installState() {
  if (isStandalone()) return "installed";
  if (deferredPrompt) return "available";
  if (isIos()) return "ios";
  return "unsupported";
}

export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notify();
  return outcome === "accepted";
}

export function useInstallState() {
  const [state, setState] = useState(installState);
  useEffect(() => {
    const update = () => setState(installState());
    listeners.add(update);
    return () => listeners.delete(update);
  }, []);
  return state;
}

export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}
