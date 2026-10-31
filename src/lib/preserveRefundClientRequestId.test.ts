import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldPreserveClientRequestId } from "./preserveRefundClientRequestId";

describe("shouldPreserveClientRequestId", () => {
  it("conserve l'identifiant pour STRIPE_UNCERTAIN / STRIPE_UNREACHABLE / REFUND_UNCERTAIN", () => {
    assert.equal(shouldPreserveClientRequestId("STRIPE_UNCERTAIN"), true);
    assert.equal(shouldPreserveClientRequestId("STRIPE_UNREACHABLE"), true);
    assert.equal(shouldPreserveClientRequestId("REFUND_UNCERTAIN"), true);
  });

  it("régénère l'identifiant pour les autres erreurs (ex. refus Stripe)", () => {
    assert.equal(shouldPreserveClientRequestId("STRIPE_REFUND_REJECTED"), false);
    assert.equal(shouldPreserveClientRequestId("VALIDATION_ERROR"), false);
    assert.equal(shouldPreserveClientRequestId(""), false);
    assert.equal(shouldPreserveClientRequestId(null), false);
    assert.equal(shouldPreserveClientRequestId(undefined), false);
  });
});
