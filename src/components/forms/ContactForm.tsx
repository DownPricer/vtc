"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      client: {
        nom: formData.get("nom"),
        prenom: formData.get("prenom"),
        telephone: formData.get("telephone"),
        email: formData.get("email"),
      },
      commentaires: formData.get("commentaires") || "N/A",
    };
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setMessage(data?.message || "Erreur lors de l'envoi");
      }
    } catch {
      setStatus("error");
      setMessage("Erreur réseau");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-light mb-1">
          Nom *
        </label>
        <input
          id="nom"
          name="nom"
          required
          className="w-full px-4 py-3 rounded-lg bg-surface border border-surface-hover text-white placeholder-gray-medium focus:border-primary focus:outline-none"
          placeholder="Votre nom"
        />
      </div>
      <div>
        <label htmlFor="prenom" className="block text-sm font-medium text-gray-light mb-1">
          Prénom *
        </label>
        <input
          id="prenom"
          name="prenom"
          required
          className="w-full px-4 py-3 rounded-lg bg-surface border border-surface-hover text-white placeholder-gray-medium focus:border-primary focus:outline-none"
          placeholder="Votre prénom"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-light mb-1">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 rounded-lg bg-surface border border-surface-hover text-white placeholder-gray-medium focus:border-primary focus:outline-none"
          placeholder="votre@email.fr"
        />
      </div>
      <div>
        <label htmlFor="telephone" className="block text-sm font-medium text-gray-light mb-1">
          Téléphone *
        </label>
        <input
          id="telephone"
          name="telephone"
          type="tel"
          required
          className="w-full px-4 py-3 rounded-lg bg-surface border border-surface-hover text-white placeholder-gray-medium focus:border-primary focus:outline-none"
          placeholder="06 XX XX XX XX"
        />
      </div>
      <div>
        <label htmlFor="commentaires" className="block text-sm font-medium text-gray-light mb-1">
          Message
        </label>
        <textarea
          id="commentaires"
          name="commentaires"
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-surface border border-surface-hover text-white placeholder-gray-medium focus:border-primary focus:outline-none resize-none"
          placeholder="Votre message..."
        />
      </div>
      {status === "success" && (
        <p className="text-green-500 text-sm">Votre message a bien été envoyé.</p>
      )}
      {status === "error" && (
        <p className="text-red-500 text-sm">{message}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold disabled:opacity-50 transition-colors"
      >
        {status === "loading" ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}
