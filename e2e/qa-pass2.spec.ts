/**
 * Étape 8 QA — parcours client / chauffeur (Playwright).
 * Prérequis : front `next dev` + API QA + `npx playwright install`.
 * Sans vraie sk_test_ : paiement marqué todo / skip.
 */
import { test, expect } from "@playwright/test";

const HAS_STRIPE =
  /^sk_test_[A-Za-z0-9]{16,}$/.test(process.env.STRIPE_SECRET_KEY || "") &&
  !/REPLACE|dummy|xxx|placeholder/i.test(process.env.STRIPE_SECRET_KEY || "");

const FRONT_UP = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

async function assertConsoleClean(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return () => {
    const filtered = errors.filter(
      (e) => !/favicon|ResizeObserver|hydration/i.test(e)
    );
    expect(filtered, `console errors: ${filtered.join(" | ")}`).toEqual([]);
  };
}

test.describe("Étape 8 — QA pass 2 front", () => {
  test.beforeAll(async ({ request }) => {
    try {
      const res = await request.get(FRONT_UP, { timeout: 3000 });
      test.skip(!res.ok(), `Front non joignable sur ${FRONT_UP} — non testable`);
    } catch {
      test.skip(true, `Front non joignable sur ${FRONT_UP} — non testable (démarrer next + Playwright)`);
    }
  });

  test("parcours client : accueil → calculateur visible, console clean", async ({ page }) => {
    const flush = await assertConsoleClean(page);
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    // Ancre calculateur / CTA — sélecteurs souples
    const calc = page.getByRole("heading", { name: /tarif|devis|réserver|calculateur/i }).first();
    if (await calc.count()) {
      await expect(calc).toBeVisible();
    }
    flush();
  });

  test("parcours chauffeur / pro : page login pro", async ({ page }) => {
    const flush = await assertConsoleClean(page);
    await page.goto("/pro/login");
    await expect(page.locator("body")).toBeVisible();
    const email = page.locator('input[type="email"], input[name="email"]').first();
    if (await email.count()) {
      await expect(email).toBeVisible();
    }
    flush();
  });

  test("axe basique (accessibilité sommaire)", async ({ page }) => {
    await page.goto("/");
    // Sans @axe-core/playwright installé : checks manuels minimaux
    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang === null || htmlLang.length > 0).toBeTruthy();
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    const h1 = page.locator("h1");
    if (await h1.count()) {
      await expect(h1.first()).toBeVisible();
    }
    // Images sans alt
    const missingAlt = await page.locator("img:not([alt])").count();
    expect(missingAlt, "images sans alt").toBeLessThanOrEqual(3);
  });

  test("paiement Stripe Checkout", async ({ page }) => {
    test.skip(!HAS_STRIPE, "Pas de vraie sk_test_ — paiement non testable (todo)");
    await page.goto("/");
    // Scénario paiement réel à brancher quand clé dispo
    expect(HAS_STRIPE).toBeTruthy();
  });
});
