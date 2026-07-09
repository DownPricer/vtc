import type { Metadata } from "next";
import { PaymentReturnClient } from "./PaymentReturnClient";

export const metadata: Metadata = {
  title: "Confirmation de paiement",
  robots: { index: false, follow: false },
};

export default function PaymentReturnPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = typeof searchParams.session_id === "string" ? searchParams.session_id.trim() : "";

  if (!sessionId.startsWith("cs_")) {
    return (
      <div className="min-h-[80vh] bg-dark flex items-center justify-center px-5">
        <div className="max-w-md text-center text-gray-400 text-sm">
          <p className="text-white font-semibold mb-2">Lien de retour incomplet</p>
          <p>Il manque une référence de session Stripe valide (paramètre session_id).</p>
        </div>
      </div>
    );
  }

  return <PaymentReturnClient sessionId={sessionId} />;
}

