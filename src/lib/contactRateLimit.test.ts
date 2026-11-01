import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  CONTACT_EMAIL_MAX,
  CONTACT_IP_MAX,
  _contactRateLimitSizesForTests,
  _resetContactRateLimitsForTests,
  checkContactRateLimit,
  purgeExpiredContactRateLimits,
} from "./contactRateLimit";
import { validateContactBody } from "./contactValidation";

describe("contactRateLimit", () => {
  beforeEach(() => {
    _resetContactRateLimitsForTests();
  });

  it(`limite à ${CONTACT_IP_MAX} envois / 15 min / IP`, () => {
    for (let i = 0; i < CONTACT_IP_MAX; i++) {
      assert.equal(checkContactRateLimit("1.2.3.4", `u${i}@test.local`), null);
    }
    const blocked = checkContactRateLimit("1.2.3.4", "autre@test.local");
    assert.ok(blocked);
    assert.ok(blocked!.retryAfterSec >= 1);
  });

  it(`limite à ${CONTACT_EMAIL_MAX} envois / 15 min / e-mail`, () => {
    for (let i = 0; i < CONTACT_EMAIL_MAX; i++) {
      assert.equal(checkContactRateLimit(`10.0.0.${i}`, "same@test.local"), null);
    }
    const blocked = checkContactRateLimit("10.0.0.99", "same@test.local");
    assert.ok(blocked);
  });

  it("purge les entrées expirées (pas de croissance infinie)", () => {
    assert.equal(checkContactRateLimit("9.9.9.9", "p@test.local"), null);
    assert.ok(_contactRateLimitSizesForTests().ip >= 1);
    // Expire artificiellement
    const maps = _contactRateLimitSizesForTests();
    assert.ok(maps.ip + maps.email >= 2);
    // Forcer resetAt passé via purge après manipulation interne : on re-reset et vérifie purge no-op
    purgeExpiredContactRateLimits(Date.now() + 16 * 60 * 1000);
    // Après purge future, les entrées créées « now » avec resetAt = now+15min sont encore valides
    // si now_purge = now+16min, resetAt = now+15min < now+16min → purgées
    const sizes = _contactRateLimitSizesForTests();
    assert.equal(sizes.ip, 0);
    assert.equal(sizes.email, 0);
  });
});

describe("contactValidation", () => {
  it("refuse e-mail invalide et borne les longueurs", () => {
    const bad = validateContactBody({
      client: { nom: "A", prenom: "B", email: "pas-un-mail", telephone: "06" },
    });
    assert.equal(bad.ok, false);

    const inject = validateContactBody({
      client: {
        nom: "Dupont\r\nBcc: evil@x.com",
        prenom: "Jean",
        email: "ok@test.local",
        telephone: "0600000000",
      },
      commentaires: "x".repeat(5000),
    });
    assert.equal(inject.ok, true);
    if (inject.ok) {
      assert.equal(inject.data.nom.includes("\n"), false);
      assert.equal(inject.data.nom.includes("\r"), false);
      assert.ok(inject.data.commentaires.length <= 4000);
    }
  });
});
