"use client";

import { useEffect } from "react";

/**
 * Ancienne page radio dédiée : redirige vers l’accueil, section #radio
 * (le lecteur est uniquement sur la page d’accueil).
 */
export default function RadioRedirectPage() {
  useEffect(() => {
    window.location.replace("/#radio");
  }, []);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-gray-500 text-sm">
      Redirection vers la radio…
    </div>
  );
}
