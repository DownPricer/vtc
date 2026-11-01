/**
 * Étape E — envoi massif `/api/contact` (ou lib équivalente) vers Mailpit.
 * Exécution : SMTP Mailpit forcé ; pas besoin du serveur Next si on appelle la lib directement.
 *
 *   SMTP_HOST=127.0.0.1 SMTP_PORT=1025 node --import tsx --test e2e/contact-mass-mailpit.test.ts
 */
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

process.env.SMTP_HOST = "127.0.0.1";
process.env.SMTP_PORT = "1025";
process.env.SMTP_SECURE = "false";
process.env.SMTP_USER = "";
process.env.SMTP_PASS = "";
process.env.MAIL_FROM = process.env.MAIL_FROM || "qa-front@localhost.test";
process.env.MAIL_TO = process.env.MAIL_TO || "qa-operator@localhost.test";
process.env.SMTP_TLS_REJECT_UNAUTHORIZED = "0";

const MAILPIT = process.env.MAILPIT_API || "http://127.0.0.1:8025/api/v1";
const BURST = Number(process.env.QA_CONTACT_BURST || 25);

describe("Étape E — contact mass → Mailpit", () => {
  before(async () => {
    const info = await fetch(`${MAILPIT}/info`);
    assert.ok(info.ok, "Mailpit requis");
    await fetch(`${MAILPIT}/messages`, { method: "DELETE" });
  });

  it(`envoie ${BURST} contacts via lib front (équiv. /api/contact)`, async () => {
    const { buildContactPayload } = await import("../src/lib/leads/buildLeadRecord");
    const { sendContactLeadEmail } = await import("../src/lib/notifications/sendLeadEmails");

    const t0 = Date.now();
    let ok = 0;
    let ko = 0;
    for (let i = 0; i < BURST; i++) {
      const client = {
        nom: `Mass${i}`,
        prenom: "QA",
        email: `mass${i}@localhost.test`,
        telephone: "0600000000",
      };
      const payload = buildContactPayload({
        client,
        commentaires: i % 5 === 0 ? `<b>html</b> 🚕 ${"x".repeat(200)}` : `msg ${i}`,
      });
      try {
        await sendContactLeadEmail(payload, client.email);
        ok += 1;
      } catch (e) {
        ko += 1;
        if (ko <= 3) console.log("[contact mass] erreur", e instanceof Error ? e.message : e);
      }
    }
    const ms = Date.now() - t0;
    await new Promise((r) => setTimeout(r, 500));
    const list = (await (await fetch(`${MAILPIT}/messages`)).json()) as { total: number };
    console.log(
      `[QA contact mass] ok=${ok} ko=${ko} durée=${ms}ms mailpit.total=${list.total} (~${(ms / Math.max(ok, 1)).toFixed(0)} ms/envoi)`
    );
    assert.ok(ok >= Math.floor(BURST * 0.8), `trop d'échecs: ok=${ok} ko=${ko}`);
    assert.ok(list.total >= ok, "Mailpit doit capturer les envois");
  });

  it("documente l'impact si route Next /api/contact est ciblée en HTTP", async () => {
    const base = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
    try {
      const probe = await fetch(`${base}/api/contact`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          client: { nom: "X", prenom: "Y", email: "x@localhost.test", telephone: "0600000000" },
          commentaires: "probe",
        }),
        signal: AbortSignal.timeout(2500),
      });
      console.log(`[QA contact HTTP] front up status=${probe.status}`);
    } catch {
      console.log(
        `[QA contact HTTP] front non démarré sur ${base} — impact documenté via lib SMTP (${BURST} envois Mailpit). ` +
          "Pour E2E HTTP : next dev + même SMTP Mailpit."
      );
    }
  });
});
