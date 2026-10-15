// Installable app / offline checks against a production build (the service
// worker only exists there). Builds, starts `vite preview` on PWA_PORT
// (default 4173) proxying /api to API_PROXY_TARGET, runs, stops it.
//
// Needs the local API running with the demo account seeded (see flows.mjs):
//   API_PROXY_TARGET=http://localhost:3001 npm run test:pwa
import { chromium } from "playwright-core";
import { spawn, execSync } from "node:child_process";

const PORT = Number(process.env.PWA_PORT) || 4173;
const APP = `http://localhost:${PORT}`;
const DEMO = { email: "demo@budgetwise.app", password: "Demo@1234" };

execSync("npx vite build", { stdio: "ignore" });
const preview = spawn(
  "npx",
  ["vite", "preview", "--port", String(PORT), "--strictPort"],
  { stdio: "ignore", detached: true }
);
const stopPreview = () => {
  try {
    process.kill(-preview.pid);
  } catch {
    /* already gone */
  }
};
process.on("exit", stopPreview);

// wait for the preview server
for (let i = 0; ; i++) {
  try {
    if ((await fetch(APP)).ok) break;
  } catch {
    /* not up yet */
  }
  if (i > 50) throw new Error("vite preview did not start");
  await new Promise((r) => setTimeout(r, 200));
}

const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: "chrome" }
);
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

let pass = 0;
let fail = 0;
const text = () => page.evaluate(() => document.body.innerText);
const waitText = (re, timeout = 8000) =>
  page.waitForFunction(
    (src) => new RegExp(src).test(document.body.innerText),
    re.source,
    { timeout }
  );
async function step(name, fn) {
  try {
    await fn();
    pass++;
    console.log("PASS ", name);
  } catch (e) {
    fail++;
    console.log("FAIL ", name, "—", e.message.split("\n")[0]);
    await page.screenshot({ path: "e2e-pwa-failure.png" }).catch(() => {});
  }
}
const apiCacheSize = () =>
  page.evaluate(async () =>
    (await caches.has("bw-api"))
      ? (await (await caches.open("bw-api")).keys()).length
      : 0
  );

await step("manifest and icons are served", async () => {
  const m = await (await fetch(`${APP}/manifest.webmanifest`)).json();
  if (m.name !== "BudgetWise" || m.display !== "standalone")
    throw new Error("bad manifest");
  for (const icon of m.icons) {
    const r = await fetch(APP + icon.src);
    if (!r.ok || r.headers.get("content-type") !== "image/png")
      throw new Error(`icon ${icon.src}`);
  }
});

await step("the service worker installs and controls the page", async () => {
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.fill("#email", DEMO.email);
  await page.fill("#password", DEMO.password);
  await page.keyboard.press("Enter");
  await waitText(/Good (morning|afternoon|evening)/);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: "networkidle" });
  if (!(await page.evaluate(() => !!navigator.serviceWorker.controller)))
    throw new Error("page not controlled");
  // the next build's files are already cached
  const shell = await page.evaluate(async () =>
    (await caches.keys()).find((k) => k.startsWith("bw-shell-"))
  );
  if (!shell) throw new Error("no shell cache");
});

await step(
  "offline: last-loaded pages still show data, with a banner",
  async () => {
    await page.goto(APP + "/transactions", { waitUntil: "networkidle" });
    await waitText(/\d+ transactions/);
    await page.goto(APP + "/recurring", { waitUntil: "networkidle" });
    await waitText(/House rent/);
    if ((await apiCacheSize()) === 0) throw new Error("nothing cached");

    await context.setOffline(true);
    await page.reload({ waitUntil: "load" });
    await waitText(/You’re offline/);
    await waitText(/House rent/);
    await page.click('aside a[href="/transactions"]');
    await waitText(/\d+ transactions/);
  }
);

await step("offline: saving explains it needs a connection", async () => {
  await page.click('aside a[href="/add"]');
  await page.waitForSelector("#amount");
  await page.type("#amount", "99");
  await page.click('button:has-text("Save expense")');
  await waitText(/Can't reach the server/);
  await context.setOffline(false);
});

await step("sign out wipes the data saved for offline", async () => {
  await page.goto(APP + "/transactions", { waitUntil: "networkidle" });
  if ((await apiCacheSize()) === 0) throw new Error("expected cached data");
  await page.click('aside button[aria-label="Sign out"]');
  await waitText(/Welcome back/);
  const left = await apiCacheSize();
  if (left !== 0) throw new Error(`${left} cached answers left`);
  // and offline now shows the sign-in page, not the old account
  await context.setOffline(true);
  await page.goto(APP + "/transactions").catch(() => {});
  await waitText(/Welcome back/);
  if (/House rent|Demo User/.test(await text()))
    throw new Error("previous account visible offline");
  await context.setOffline(false);
});

await step(
  "a new deploy offers Reload, then runs the new version",
  async () => {
    await page.goto(APP, { waitUntil: "networkidle" });
    const before = await page.evaluate(async () =>
      (await caches.keys()).find((k) => k.startsWith("bw-shell-"))
    );
    execSync("npx vite build", { stdio: "ignore" }); // a "deploy"
    await page.reload({ waitUntil: "networkidle" });
    await page.evaluate(() =>
      navigator.serviceWorker.getRegistration().then((r) => r.update())
    );
    await waitText(/A new version of BudgetWise is ready/, 15000);
    await Promise.all([
      page.waitForEvent("load"),
      page.click('button:text-is("Reload")'),
    ]);
    await page.waitForFunction(
      async (old) => {
        const keys = await caches.keys();
        return (
          !keys.includes(old) && keys.some((k) => k.startsWith("bw-shell-"))
        );
      },
      before,
      { timeout: 10000 }
    );
  }
);

await browser.close();
stopPreview();
if (errors.length) console.log("Page errors:", errors);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail || errors.length ? 1 : 0);
