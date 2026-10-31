import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveVisitorIpFromHeaders } from "./bffClientIp";

describe("resolveVisitorIpFromHeaders", () => {
  it("préfère x-real-ip", () => {
    const headers = new Map([
      ["x-real-ip", "198.51.100.20"],
      ["x-forwarded-for", "203.0.113.1, 198.51.100.20"],
    ]);
    assert.equal(
      resolveVisitorIpFromHeaders((n) => headers.get(n.toLowerCase()) ?? null),
      "198.51.100.20"
    );
  });

  it("prend le DERNIER élément de X-Forwarded-For, jamais le premier", () => {
    const headers = new Map([["x-forwarded-for", "203.0.113.1, 198.51.100.99"]]);
    assert.equal(
      resolveVisitorIpFromHeaders((n) => headers.get(n.toLowerCase()) ?? null),
      "198.51.100.99"
    );
  });

  it("ignore une IP invraisemblable", () => {
    const headers = new Map([["x-real-ip", "not-an-ip"]]);
    assert.equal(resolveVisitorIpFromHeaders((n) => headers.get(n.toLowerCase()) ?? null), null);
  });
});
