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
      { error: "PayPal non configuré" },
      { status: 503 }
    );
  }
  try {
    const { orderId } = (await request.json()) as { orderId?: string };
    if (!orderId?.trim()) {
      return NextResponse.json(
        { error: "orderId requis" },
        { status: 400 }
      );
    }
    const token = await getAccessToken();
    const res = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const capture = (await res.json()) as { status?: string; id?: string };
    if (!res.ok || capture.status !== "COMPLETED") {
      console.error("[PayPal capture]", capture);
      return NextResponse.json(
        { error: "Échec capture PayPal" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      captureId: capture.id,
    });
  } catch (e) {
    console.error("[capture-paypal-order]", e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
