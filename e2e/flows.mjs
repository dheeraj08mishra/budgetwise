// End-to-end flows through the real UI, in Chrome via Playwright.
//
// Needs the full local stack running and the demo account seeded:
//   server: MONGODB_URI=<local db> PORT=3001 npm run dev && npm run seed:demo
//   app:    API_PROXY_TARGET=http://localhost:3001 npm run dev
// Then:     npm run test:e2e
// E2E_URL (default http://localhost:1234) and CHROME_PATH can be overridden.
// E2E_SERVER_LOG = the API's log file: lets the forgot-password flow read the
// reset link the server prints locally (that flow is skipped without it).
// It changes the demo account's data: re-run `npm run seed:demo` afterwards.
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

const APP = process.env.E2E_URL || "http://localhost:1234";
const DEMO = { email: "demo@budgetwise.app", password: "Demo@1234" };
const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: "chrome" }
);
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on(
  "console",
  (m) =>
    m.type() === "error" &&
    !/40[013]|429/.test(m.text()) &&
    errors.push(m.text())
);

let pass = 0;
let fail = 0;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const text = () => page.evaluate(() => document.body.innerText);
const waitText = (re, timeout = 6000, p = page) =>
  p.waitForFunction(
    (src) => new RegExp(src).test(document.body.innerText),
    re.source,
    { timeout }
  );
const clickText = (tag, re) =>
  page.evaluate(
    ({ tag, src }) => {
      const el = [...document.querySelectorAll(tag)].find(
        (e) =>
          new RegExp(src).test(e.textContent.trim()) ||
          new RegExp(src).test(e.getAttribute("aria-label") || "")
      );
      if (!el) throw new Error(`no ${tag} matching ${src}`);
      el.click();
    },
    { tag, src: re.source }
  );
async function step(name, fn) {
  try {
    await fn();
    pass++;
    console.log("PASS ", name);
  } catch (e) {
    fail++;
    console.log("FAIL ", name, "—", e.message.split("\n")[0]);
    await page.screenshot({ path: "e2e-failure.png" }).catch(() => {});
  }
}

await step("sign in via the form", async () => {
  await context.clearCookies();
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.type("#email", DEMO.email);
  await page.type("#password", DEMO.password);
  await page.keyboard.press("Enter");
  await waitText(/Good (morning|afternoon|evening)/);
});

const note = `UI test ${Date.now() % 100000}`;
await step("footer with GitHub and LinkedIn links on every page", async () => {
  for (const path of ["/", "/transactions", "/goals"]) {
    await page.goto(APP + path, { waitUntil: "networkidle" });
    const links = await page.$$eval("footer a", (as) =>
      as.map((a) => [
        a.getAttribute("aria-label") || a.textContent,
        a.href,
        a.rel,
      ])
    );
    const hrefs = links.map((l) => l[1]).join(" ");
    if (!hrefs.includes("github.com/dheeraj08mishra/budgetwise"))
      throw new Error(`${path}: no GitHub link`);
    if (!hrefs.includes("linkedin.com/in/dheerajmishra462"))
      throw new Error(`${path}: no LinkedIn link`);
    if (!links.every((l) => l[2].includes("noopener")))
      throw new Error("external links need rel=noopener");
  }
});

await step("add an expense (amount, category chip, note)", async () => {
  await clickText("a", /^Add transaction$/);
  await waitText(/Record money coming in/);
  await page.type("#amount", "432.50");
  await clickText("button", /^Wants$/);
  await page.type("#note", note);
  await clickText("button", /^Save expense$/);
  await waitText(new RegExp(note));
  if (!(await text()).includes("₹432.5"))
    throw new Error("amount not shown on dashboard");
});

await step("validation: empty amount shows inline error", async () => {
  await page.goto(APP + "/add", { waitUntil: "networkidle" });
  await clickText("button", /^Save expense$/);
  await waitText(/Enter an amount greater than zero/);
});

await step("edit it on the Transactions page", async () => {
  await page.goto(APP + "/transactions", { waitUntil: "networkidle" });
  await waitText(new RegExp(note));
  await clickText("button", new RegExp(`^Edit ${note}$`));
  await waitText(/Edit transaction/);
  await page.click("#edit-amount", { clickCount: 3 });
  await page.type("#edit-amount", "500");
  await clickText("button", /^Save changes$/);
  await waitText(/Transaction updated/);
  if (!(await text()).includes("₹500")) throw new Error("new amount not shown");
});

await step("search filters the list", async () => {
  await page.type('input[type="search"]', note.replace(/\d+$/, "").trim());
  await wait(700);
  await waitText(/^[\s\S]*1 transaction\b/);
});

await step("delete asks for confirmation, cancel keeps it", async () => {
  await clickText("button", new RegExp(`^Delete ${note}$`));
  await waitText(/Delete transaction\?/);
  await clickText("button", /^Cancel$/);
  await wait(300);
  if (!(await text()).includes(note)) throw new Error("deleted on cancel");
});

await step("delete after confirming", async () => {
  await clickText("button", new RegExp(`^Delete ${note}$`));
  await waitText(/Delete transaction\?/);
  await page.evaluate(() =>
    [...document.querySelectorAll(".modal-box button")]
      .find((b) => b.textContent.trim() === "Delete")
      .click()
  );
  await waitText(/Transaction deleted/);
  await wait(300);
  if ((await text()).includes(note)) throw new Error("still listed");
});

await step(
  "Transactions loads 25 at a time; Load more appends the next 25",
  async () => {
    await page.goto(APP + "/transactions", { waitUntil: "networkidle" });
    await waitText(/Load more \(\d+ left\)/);
    const rows = () =>
      page.$$eval('button[aria-label^="Edit "]', (b) => b.length);
    const total = Number((await text()).match(/(\d+) transactions/)[1]);
    if ((await rows()) !== 25)
      throw new Error(`first page has ${await rows()} rows`);
    await clickText("button", /^Load more/);
    await page.waitForFunction(
      () => document.querySelectorAll('button[aria-label^="Edit "]').length > 25
    );
    const after = await rows();
    if (after !== Math.min(50, total))
      throw new Error(`after load more: ${after}`);
    const t2 = Number((await text()).match(/(\d+) transactions/)[1]);
    if (t2 !== total) throw new Error("total changed");
    console.log(`      ${total} total, ${after} loaded`);
  }
);

await step("deleting from a paged list keeps the count exact", async () => {
  const total = Number((await text()).match(/(\d+) transactions/)[1]);
  await page.evaluate(() =>
    document.querySelectorAll('button[aria-label^="Delete "]')[30].click()
  );
  await waitText(/Delete transaction\?/);
  await page.evaluate(() =>
    [...document.querySelectorAll(".modal-box button")]
      .find((b) => b.textContent.trim() === "Delete")
      .click()
  );
  await waitText(/Transaction deleted/);
  await wait(300);
  const t2 = Number((await text()).match(/(\d+) transactions/)[1]);
  if (t2 !== total - 1) throw new Error(`${total} -> ${t2}`);
});

await step(
  "tags: add one in the edit dialog, then filter by clicking it",
  async () => {
    await page.goto(APP + "/transactions", { waitUntil: "networkidle" });
    await clickText("button", /^Edit Electricity bill$/);
    await waitText(/Edit transaction/);
    await page.fill("#edit-tags", "bills to check");
    await page.keyboard.press("Enter");
    await clickText("button", /^Save changes$/);
    await waitText(/Transaction updated/);
    await clickText("button", /^Show transactions tagged bills to check$/);
    await waitText(/^[\s\S]*\b1 transaction\b/);
    const tagFilter = await page.$eval(
      'select[aria-label="Tag"]',
      (s) => s.value
    );
    if (tagFilter !== "bills to check")
      throw new Error(`tag filter is "${tagFilter}"`);
    await clickText("button", /Clear filters/);
  }
);

await step("past months: only tags can be edited", async () => {
  const d = new Date();
  const lastOfPrev = new Date(
    d.getFullYear(),
    d.getMonth(),
    0
  ).toLocaleDateString("en-CA");
  await page.goto(APP + "/transactions", { waitUntil: "networkidle" });
  await page.fill('input[aria-label="To date"]', lastOfPrev);
  await wait(800);
  await page.evaluate(() =>
    document.querySelector('button[aria-label^="Edit "]').click()
  );
  await waitText(/only its tags can be changed/);
  // a <fieldset disabled> locks its inputs without setting .disabled on them
  if (!(await page.$eval("#edit-amount", (i) => i.matches(":disabled"))))
    throw new Error("amount editable");
  await page.fill("#edit-tags", "archive");
  await page.keyboard.press("Enter");
  await clickText("button", /^Save changes$/);
  await waitText(/Transaction updated/);
  await clickText("button", /Clear filters/);
  await page.selectOption('select[aria-label="Tag"]', "archive");
  await waitText(/^[\s\S]*\b1 transaction\b/);
  await clickText("button", /Clear filters/);
});

await step(
  "budgets: set them, see the bars, banner and add-time warning",
  async () => {
    await page.goto(APP, { waitUntil: "networkidle" });
    await clickText("button", /^Set budgets$/);
    await waitText(/Monthly budgets/);
    await clickText("button", /Suggest from income/);
    if (!(await page.inputValue("#budget-need")))
      throw new Error("no suggestion filled");
    await page.fill("#budget-want", "2000"); // demo wants this month are higher
    await clickText("button", /^Save budgets$/);
    await waitText(/Budgets saved/);
    await waitText(/Over budget this month/);
    await waitText(/Wants: \d+% of ₹2,000/);
    if (!(await page.$('progress[aria-label^="Wants:"]')))
      throw new Error("no Wants bar");

    await page.goto(APP + "/add", { waitUntil: "networkidle" });
    await page.fill("#amount", "150");
    await clickText("button", /^Wants$/);
    await clickText("button", /^Save expense$/);
    await waitText(/Wants is over budget/);
  }
);

await step(
  "email settings on Profile persist; the budget alert was emailed",
  async () => {
    await page.goto(APP + "/profile", { waitUntil: "networkidle" });
    await waitText(/Email notifications/);
    const box = 'input[aria-label="Monthly summary"]';
    if (!(await page.isChecked(box))) throw new Error("should start on");
    await page.click(box);
    await waitText(/Turned off/);
    await page.reload({ waitUntil: "networkidle" });
    if (await page.isChecked(box)) throw new Error("setting not saved");
    await page.click(box); // back on
    await waitText(/Turned on/);

    if (process.env.E2E_SERVER_LOG) {
      const log = readFileSync(process.env.E2E_SERVER_LOG, "utf8");
      if (
        !/\[EMAIL\] to=demo@budgetwise\.app subject="You're over your Wants budget/.test(
          log
        )
      )
        throw new Error("over-budget email not found in the server log");
    }
  }
);

await step("month-end forecast on the current month only", async () => {
  await page.goto(APP, { waitUntil: "networkidle" });
  await waitText(/Month-end forecast/);
  await waitText(/Everyday spending, ₹[\d,]+\/day × \d+ days/);
  const months = await page.$$eval('select[aria-label="Month"] option', (o) =>
    o.map((x) => x.value)
  );
  if (months.length < 2) throw new Error("demo should have past months");
  await page.selectOption('select[aria-label="Month"]', months[1]);
  await waitText(/Looking back at/);
  if ((await text()).includes("Month-end forecast"))
    throw new Error("forecast shown for a past month");
});

await step("Insights: compare this year with last year", async () => {
  await page.goto(APP + "/insights", { waitUntil: "networkidle" });
  await waitText(/2026 vs 2025/);
  // the unfinished current month is left out of the totals
  await waitText(/Totals cover Jan–\w{3}: finished months/);
  await waitText(/₹[\d,]+ in 2025/);
  await waitText(/Spending by category, Jan–\w{3}/);
  // goal saving only started in 2026
  await waitText(/New in 2026/);
  await page.click('[role="radiogroup"][aria-label="Compare"] >> text=Income');
  await page.waitForSelector(
    '[role="radiogroup"][aria-label="Compare"] [aria-checked="true"]:text-is("Income")'
  );
});

await step("Escape closes a dialog", async () => {
  await page.goto(APP + "/goals", { waitUntil: "networkidle" });
  await clickText("button", /^New goal$/);
  await waitText(/Target amount/);
  await page.keyboard.press("Escape");
  await wait(300);
  if (await page.$(".modal-open")) throw new Error("modal still open");
});

await step("add money to a goal updates its progress", async () => {
  const before = await text();
  await clickText("button", /Add money/);
  await waitText(/left to reach the target/);
  await page.type('input[aria-label="Amount to add"]', "1000");
  await page.evaluate(() =>
    [...document.querySelectorAll(".modal-box button")]
      .find((b) => b.textContent.trim() === "Add money")
      .click()
  );
  await waitText(/Goal updated successfully/);
  if (before === (await text())) throw new Error("page did not change");
});

await step("recurring insights: price change and next 30 days", async () => {
  await page.goto(APP + "/recurring", { waitUntil: "networkidle" });
  // the demo's Netflix went from ₹499 to ₹649 in August
  await waitText(
    /Netflix subscription went up from ₹499 to ₹649 \(\+30%\) on 7 Aug/
  );
  await waitText(/Next 30 days/);
  await waitText(/\d+ payments? · ₹[\d,]+ going out/);
});

await step("pause (with confirm) and resume a recurring payment", async () => {
  await page.goto(APP + "/recurring", { waitUntil: "networkidle" });
  await clickText("button", /^Pause Netflix subscription$/);
  await waitText(/Pause this recurring transaction\?/);
  await page.evaluate(() =>
    [...document.querySelectorAll(".modal-box button")]
      .find((b) => b.textContent.trim() === "Pause")
      .click()
  );
  await waitText(/Paused\. No new transactions/);
  await clickText("button", /^Resume Netflix subscription$/);
  await waitText(/Resumed/);
});

// Click a menu item inside one recurring row (every row has its own menu)
const clickInRow = (name, label) =>
  page.evaluate(
    ({ name, label }) => {
      const row = [...document.querySelectorAll("li")].find((li) =>
        li.querySelector(`button[aria-label="More actions for ${name}"]`)
      );
      if (!row) throw new Error(`no row for ${name}`);
      const b = [...row.querySelectorAll("button")].find(
        (x) => x.textContent.trim() === label
      );
      if (!b) throw new Error(`no ${label} in row ${name}`);
      b.click();
    },
    { name, label }
  );

const confirmInModal = (label) =>
  page.evaluate((label) => {
    const b = [...document.querySelectorAll(".modal-box button")].find(
      (x) => x.textContent.trim() === label
    );
    if (!b) throw new Error(`no modal button ${label}`);
    b.click();
  }, label);

await step("edit a recurring series (amount + end date)", async () => {
  await page.goto(APP + "/recurring", { waitUntil: "networkidle" });
  await clickInRow("House rent", "Edit");
  await waitText(/Edit recurring payment/);
  await page.fill("#rule-amount", "23000");
  const nextYear = `${new Date().getFullYear() + 1}-12-31`;
  await page.fill("#rule-end", nextYear);
  await confirmInModal("Save changes");
  await waitText(/Recurring payment updated/);
  const t = await text();
  if (!t.includes("₹23,000")) throw new Error("new amount not shown");
  if (!/until 31 Dec/.test(t)) throw new Error("end date not shown");
  // the next payment will cost more than the last one
  await waitText(
    /House rent will be ₹23,000 from \d+ \w{3}, was ₹22,000 \(\+5%\)/
  );
});

await step("skip the next payment of a series", async () => {
  await clickInRow("Mutual fund SIP", "Skip next payment");
  await waitText(/Skip the next payment\?/);
  await confirmInModal("Skip it");
  // The SIP is due on the 5th: proves the right series was skipped
  await waitText(/Skipped 5 \w{3}\. Next payment: 5 \w{3}\./);
});

await step("delete a series (with confirmation)", async () => {
  await clickInRow("Netflix subscription", "Delete series");
  await waitText(/Delete this recurring series\?/);
  await confirmInModal("Delete series");
  await waitText(/Past transactions were kept/);
  await wait(500);
  if ((await text()).includes("Netflix subscription"))
    throw new Error("still listed");
});

await step("add a quarterly payment with an end date", async () => {
  await page.goto(APP + "/add", { waitUntil: "networkidle" });
  await page.fill("#amount", "4500");
  await page.fill("#note", "Water purifier service");
  await page.evaluate(() => document.querySelector("input.toggle").click());
  await clickText("button", /^Quarterly$/);
  await page.fill("#end-date", `${new Date().getFullYear() + 2}-06-30`);
  await clickText("button", /^Save expense$/);
  await waitText(/Expense added/);
  await page.goto(APP + "/recurring", { waitUntil: "networkidle" });
  await waitText(/Water purifier service/);
  if (!/Quarterly/.test(await text())) throw new Error("frequency not shown");
});

await step("theme toggle switches and persists across reload", async () => {
  const before = await page.evaluate(
    () => document.documentElement.dataset.theme
  );
  await clickText("button", /^(Dark|Light) mode$/);
  const after = await page.evaluate(
    () => document.documentElement.dataset.theme
  );
  if (before === after) throw new Error("theme unchanged");
  await page.reload({ waitUntil: "networkidle" });
  if (
    (await page.evaluate(() => document.documentElement.dataset.theme)) !==
    after
  )
    throw new Error("not persisted");
  await clickText("button", /^(Dark|Light) mode$/); // restore
});

await step("expired session logs out with a message", async () => {
  await page.goto(APP + "/transactions", { waitUntil: "networkidle" });
  await context.clearCookies(); // simulate expiry
  await page.type('input[type="search"]', "rent");
  await waitText(/session expired/i, 6000);
  await waitText(/Welcome back/);
});

await step(
  "/history redirects to /transactions (old links keep working)",
  async () => {
    await page.type("#email", DEMO.email);
    await page.type("#password", DEMO.password);
    await page.keyboard.press("Enter");
    await waitText(/Good (morning|afternoon|evening)/);
    await page.goto(APP + "/history", { waitUntil: "networkidle" });
    if (!page.url().endsWith("/transactions")) throw new Error(page.url());
  }
);

await step(
  "change password signs out the other device, keeps this one",
  async () => {
    const email = `pw_${Date.now()}@example.com`;
    // fresh account through the sign-up form
    await context.clearCookies();
    await page.goto(APP, { waitUntil: "networkidle" });
    await clickText("button", /^Create account$/);
    await page.type("#first", "Pass");
    await page.type("#last", "Word");
    await page.type("#email", email);
    await page.type(
      "#phone",
      String(9300000000 + Math.floor(Math.random() * 699999999))
    );
    await page.type("#password", "OldPass1@");
    await page.evaluate(() =>
      document.querySelector("form button[type=submit]").click()
    );
    await waitText(/Good (morning|afternoon|evening)/);

    // second "device": separate browser context, same account
    const ctx = await browser.newContext();
    const other = await ctx.newPage();
    await other.goto(APP, { waitUntil: "networkidle" });
    await other.type("#email", email);
    await other.type("#password", "OldPass1@");
    await other.keyboard.press("Enter");
    await waitText(/Good (morning|afternoon|evening)/, 8000, other);

    await page.goto(APP + "/profile", { waitUntil: "networkidle" });
    await clickText("button", /Change password/);
    await waitText(/Confirm new password/);
    await page.type("#pw-current", "WrongPass1@");
    await page.type("#pw-new", "NewPass2@");
    await page.type("#pw-confirm", "NewPass2@");
    await page.evaluate(() =>
      document.querySelector('button[form="change-password"]').click()
    );
    await waitText(/Current password is incorrect/);
    await page.click("#pw-current", { clickCount: 3 });
    await page.type("#pw-current", "OldPass1@");
    await page.evaluate(() =>
      document.querySelector('button[form="change-password"]').click()
    );
    await waitText(/Other devices have been signed out/);

    // this device: still in
    await page.goto(APP + "/transactions", { waitUntil: "networkidle" });
    if (!/Transactions/.test(await text()))
      throw new Error("this device was signed out");
    // other device: any request now fails and it lands on the login page
    await other.goto(APP + "/transactions", { waitUntil: "networkidle" });
    await waitText(/Welcome back/, 6000, other);
    // new password works there
    await other.type("#email", email);
    await other.type("#password", "NewPass2@");
    await other.keyboard.press("Enter");
    await waitText(/Good (morning|afternoon|evening)/, 8000, other);
    await ctx.close();
  }
);

await step("sign out", async () => {
  await clickText("button", /^Sign out$/);
  await waitText(/Welcome back/);
});

await step(
  "forgot password: request a link, reset, sign in with the new password",
  async () => {
    // a fresh account, created through the API
    await context.clearCookies();
    const email = `reset_${Date.now()}@example.com`;
    const signup = await context.request.post(`${APP}/api/signup`, {
      data: {
        firstName: "Reset",
        lastName: "Flow",
        email,
        password: "OldPass1@",
        phoneNumber: String(9500000000 + Math.floor(Math.random() * 499999999)),
      },
    });
    if (!signup.ok()) throw new Error(`signup ${signup.status()}`);
    await context.clearCookies();

    await page.goto(APP, { waitUntil: "networkidle" });
    await clickText("a", /^Forgot password\?$/);
    await waitText(/Forgot your password\?/);
    await page.fill("#forgot-email", email);
    await clickText("button", /^Send reset link$/);
    await waitText(/Check your email/);

    // a broken link explains itself
    await page.goto(`${APP}/reset-password?token=nope`, {
      waitUntil: "networkidle",
    });
    await waitText(/This link has expired/);

    if (!process.env.E2E_SERVER_LOG) {
      console.log("      (E2E_SERVER_LOG not set: skipping the reset itself)");
      return;
    }
    const line = readFileSync(process.env.E2E_SERVER_LOG, "utf8")
      .split("\n")
      .reverse()
      .find((l) => l.includes(`reset link for ${email}`));
    if (!line) throw new Error("reset link not found in the server log");
    const token = line.match(/token=([a-f0-9]{64})/)[1];

    await page.goto(`${APP}/reset-password?token=${token}`, {
      waitUntil: "networkidle",
    });
    await waitText(/Choose a new password/);
    await page.fill("#reset-new", "NewPass9@");
    await page.fill("#reset-confirm", "NewPass9@");
    await clickText("button", /^Reset password$/);
    await waitText(/Password reset\. Sign in with your new password/);

    await page.fill("#email", email);
    await page.fill("#password", "NewPass9@");
    await page.keyboard.press("Enter");
    await waitText(/Good (morning|afternoon|evening)/);

    // the link can't be used twice
    await page.goto(`${APP}/reset-password?token=${token}`, {
      waitUntil: "networkidle",
    });
    await page.fill("#reset-new", "Other#Pass7");
    await page.fill("#reset-confirm", "Other#Pass7");
    await clickText("button", /^Reset password$/);
    await waitText(/This link has expired/);
  }
);

await step(
  "admin: lands on Admin; overview, users and feedback triage",
  async () => {
    const signIn = async (email, password, landing) => {
      await context.clearCookies();
      await page.goto(APP, { waitUntil: "networkidle" });
      await page.fill("#email", email);
      await page.fill("#password", password);
      await page.keyboard.press("Enter");
      await waitText(landing);
    };
    // a regular user: Dashboard, no Admin link, and /admin says so
    await signIn(DEMO.email, DEMO.password, /Good (morning|afternoon|evening)/);
    if (await page.$('nav a[href="/admin"]'))
      throw new Error("Admin link shown to a user");
    await page.goto(APP + "/admin", { waitUntil: "networkidle" });
    await waitText(/Admins only/);

    // the admin lands straight on the Admin page
    await signIn(
      "admin@budgetwise.app",
      "Admin@1234",
      /How BudgetWise is being used/
    );
    if (!page.url().endsWith("/admin"))
      throw new Error(`landed on ${page.url()}`);
    await waitText(/Sign-ups/);
    await waitText(/Users with budgets/);

    await clickText("button", /^Users$/);
    await page.fill('input[aria-label="Search users"]', "demo@budgetwise.app");
    await waitText(/^[\s\S]*\b1 users\b/);

    await clickText("button", /^Feedback \(\d+ new\)$/);
    await waitText(/Would love budgets per category/);
    await page.fill('input[aria-label="Admin note"]', "Shipped in Part 1");
    await clickText("button", /^Save note$/);
    await waitText(/Note saved/);
    await page.click('button[aria-label="Mark as done"]');
    await waitText(/Marked as done/);
    await page.click('[role="radio"]:text-is("Done")'); // the status filter
    // the note is an input value (not page text), so read it directly
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('input[aria-label="Admin note"]')].some(
          (i) => i.value === "Shipped in Part 1"
        ),
      null,
      { timeout: 6000 }
    );
    await waitText(/Feedback \(\d+ new\)/);
  }
);

await browser.close();
console.log(
  `\n${pass} passed, ${fail} failed${errors.length ? `\nPAGE ERRORS:\n${[...new Set(errors)].join("\n")}` : ", no page errors"}`
);
process.exit(fail ? 1 : 0);
