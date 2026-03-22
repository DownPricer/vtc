import { NextResponse } from "next/server";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = (await res.json()) as { access_token?: string };
  if (!data?.access_token) throw new Error("PayPal: échec obtention token");
  return data.access_token;
}

export async function POST(request: Request) {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "PayPal non configuré (PAYPAL_CLIENT_ID/SECRET manquants)" },
      { status: 503 }
    );
  }
  try {
    const { amount } = (await request.json()) as { amount?: number };
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json(
        { error: "Montant invalide" },
        { status: 400 }
      );
    }
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "EUR",
              value: value.toFixed(2),
            },
          },
        ],
      }),
    });
    const order = (await res.json()) as { id?: string; details?: unknown };
    if (!res.ok || !order.id) {
      console.error("[PayPal create]", order);
      return NextResponse.json(
        { error: "Échec création commande PayPal" },
        { status: 500 }
      );
    }
    return NextResponse.json({ orderId: order.id });
  } catch (e) {
    console.error("[create-paypal-order]", e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
