import type { Metadata } from "next";
import { BookingManageClient } from "./BookingManageClient";

export const metadata: Metadata = {
  title: "Gérer ma réservation",
  robots: { index: false, follow: false },
  // Le jeton figure dans l'URL : il ne doit jamais fuiter via l'en-tête Referer vers un tiers.
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

export default function BookingManagePage({ searchParams }: { searchParams: { token?: string } }) {
  const token = typeof searchParams.token === "string" ? searchParams.token.trim() : "";

  if (token.length < 20) {
    return (
      <div className="min-h-[80vh] bg-dark flex items-center justify-center px-5">
        <div className="max-w-md text-center text-gray-400 text-sm">
          <p className="text-white font-semibold mb-2">Lien incomplet</p>
          <p>Utilisez le lien reçu par e-mail pour gérer votre réservation.</p>
        </div>
      </div>
    );
  }

  return <BookingManageClient token={token} />;
}
