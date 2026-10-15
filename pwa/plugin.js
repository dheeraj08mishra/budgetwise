import { readFileSync } from "node:fs";

// Emits build/sw.js from pwa/sw.js with this build's file list, so the
// worker changes (and updates) on every deploy. Dev builds get no worker.
export default function serviceWorker() {
  return {
    name: "budgetwise-sw",
    apply: "build",
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle)
        .filter((f) => !f.endsWith(".map") && f !== "index.html")
        // Inter ships every script; the app only needs Latin
        .filter((f) => !/inter-.*\.woff2?$/.test(f) || /-latin-/.test(f))
        .map((f) => "/" + f);
      const icons = ["/favicon.svg", "/icon-192.png", "/icon-512.png"];
      const build = Date.now().toString(36);
      const source = readFileSync(new URL("./sw.js", import.meta.url), "utf8")
        .replace("= __BUILD__;", `= ${JSON.stringify(build)};`)
        .replace(
          "= __PRECACHE__;",
          `= ${JSON.stringify([...icons, ...files])};`
        );
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}
