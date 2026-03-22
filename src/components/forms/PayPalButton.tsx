"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

export interface PayPalButtonProps {
  amount: number;
  onApprove: (orderId: string) => Promise<void>;
  disabled?: boolean;
}

export function PayPalButton({ amount, onApprove, disabled }: PayPalButtonProps) {
  if (!PAYPAL_CLIENT_ID) {
    return (
      <p className="text-gray-medium text-sm">
        PayPal non configuré. Ajoutez NEXT_PUBLIC_PAYPAL_CLIENT_ID.
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: "EUR",
        intent: "capture",
      }}
    >
      <PayPalButtons
        disabled={disabled}
        style={{ layout: "vertical", color: "gold" }}
        createOrder={async () => {
          const res = await fetch("/api/create-paypal-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
          });
          const data = (await res.json()) as { orderId?: string; error?: string };
          if (!res.ok || !data.orderId) {
            throw new Error(data?.error || "Échec création commande");
          }
          return data.orderId;
        }}
        onApprove={async (data) => {
          if (data.orderID) await onApprove(data.orderID);
        }}
      />
    </PayPalScriptProvider>
  );
}
