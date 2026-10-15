// Unit tests for the plain-JS helpers (node:test, no browser needed)
process.env.TZ = "America/Los_Angeles"; // a timezone west of UTC on purpose

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  money,
  moneyShort,
  change,
  percent,
  capitalize,
  periodLabel,
} from "../src/utils/format.js";
import {
  dayKey,
  formatDay,
  firstOfMonthString,
  todayString,
} from "../src/utils/dates.js";
import {
  categoryMeta,
  isIncome,
  isSpending,
  isSavings,
} from "../src/utils/categories.js";
import { isStrongPassword, PASSWORD_RULES } from "../src/utils/password.js";
import { sortTransactions } from "../src/utils/transactions.js";

test("money uses Indian grouping and hides paise unless asked", () => {
  assert.equal(money(85000), "₹85,000");
  assert.equal(money(300000), "₹3,00,000");
  assert.equal(money(432.5, { exact: true }), "₹432.5");
  assert.equal(money("not a number"), "₹0");
});

test("moneyShort for chart axes: k, L, Cr", () => {
  assert.equal(moneyShort(850), "₹850");
  assert.equal(moneyShort(85000), "₹85k");
  assert.equal(moneyShort(120000), "₹1.2L");
  assert.equal(moneyShort(10000000), "₹1Cr");
  assert.equal(moneyShort(-5000), "-₹5k");
});

test("change is null when there is nothing to compare", () => {
  assert.equal(change(110, 100), 10);
  assert.equal(change(5, 0), null);
  assert.equal(change(5, undefined), null);
  assert.equal(percent(12.345, 1), "12.3%");
  assert.equal(capitalize("demo"), "Demo");
});

test("stored dates show their own calendar day even west of UTC", () => {
  // Stored as UTC midnight; in Los Angeles that instant is the evening before
  const stored = "2026-10-14T00:00:00.000Z";
  assert.equal(dayKey(stored), "2026-10-14");
  assert.match(formatDay(stored), /14 Oct 2026/);
});

test("today and first-of-month are local YYYY-MM-DD strings", () => {
  assert.match(todayString(), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(firstOfMonthString(), todayString().slice(0, 8) + "01");
});

test("categories: savings are not spending; credit counts as income", () => {
  const goal = { type: "expense", category: "goal" };
  const rent = { type: "expense", category: "need" };
  assert.equal(isSavings(goal), true);
  assert.equal(isSpending(goal), false);
  assert.equal(isSpending(rent), true);
  assert.equal(isIncome({ type: "credit" }), true);
  assert.equal(categoryMeta({ type: "income" }).label, "Income");
  assert.equal(
    categoryMeta({ type: "expense", category: "unknown" }).label,
    "Other"
  );
});

test("password rules match the server", () => {
  assert.equal(PASSWORD_RULES.length, 5);
  assert.equal(isStrongPassword("Demo@1234"), true);
  for (const weak of [
    "alllowercase1@",
    "ALLUPPER1@",
    "NoNumber@",
    "NoSymbol1",
  ]) {
    assert.equal(isStrongPassword(weak), false, weak);
  }
  assert.equal(isStrongPassword("Ab1@"), false, "too short");
});

test("sortTransactions: newest/oldest by day, ties by time added; server keeps order", () => {
  const t = (date, createdAt, id) => ({ date, createdAt, _id: id });
  const list = [
    t("2026-10-02T00:00:00Z", "2026-10-02T10:00:00Z", "a"),
    t("2026-10-05T00:00:00Z", "2026-10-05T09:00:00Z", "b"),
    t("2026-10-05T00:00:00Z", "2026-10-05T18:00:00Z", "c"),
  ];
  assert.deepEqual(
    sortTransactions(list).map((x) => x._id),
    ["c", "b", "a"]
  );
  assert.deepEqual(
    sortTransactions(list, "oldest").map((x) => x._id),
    ["a", "b", "c"]
  );
  assert.equal(sortTransactions(list, "server"), list);
  assert.deepEqual(
    list.map((x) => x._id),
    ["a", "b", "c"],
    "input not mutated"
  );
});

test("frequency labels", async () => {
  const { FREQUENCIES, frequencyLabel } =
    await import("../src/utils/frequency.js");
  assert.deepEqual(
    FREQUENCIES.map((f) => f.value),
    [
      "daily",
      "weekly",
      "biweekly",
      "monthly",
      "quarterly",
      "halfyearly",
      "yearly",
    ],
    "same list as the server"
  );
  assert.equal(frequencyLabel("halfyearly"), "Every 6 months");
});

test("tags: same rules as the server", async () => {
  const { normalizeTag, isValidTag, MAX_TAGS } =
    await import("../src/utils/tags.js");
  assert.equal(normalizeTag("  Eating   Out "), "eating out");
  assert.equal(isValidTag("food"), true);
  assert.equal(isValidTag("dal & roti"), true);
  assert.equal(isValidTag("दिवाली"), true, "any language");
  assert.equal(isValidTag("-dash"), false);
  assert.equal(isValidTag("<b>"), false);
  assert.equal(isValidTag("x".repeat(21)), false);
  assert.equal(MAX_TAGS, 10);
});

test("periodLabel names the months a comparison covers", () => {
  assert.equal(periodLabel([1, 2, 3, 4, 5, 6, 7, 8, 9]), "Jan–Sep");
  assert.equal(periodLabel([2]), "Feb");
  assert.equal(periodLabel([2, 5, 6]), "3 months");
  assert.equal(periodLabel([]), "");
});
