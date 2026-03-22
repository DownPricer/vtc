const paymentMethods = [
  {
    label: "Carte bancaire",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
        <path d="M6.5 15h3c.28 0 .5-.22.5-.5v-1c0-.28-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5v1c0 .28.22.5.5.5zm0 0"/>
        <circle cx="19" cy="14.5" r="1" opacity=".6"/>
        <circle cx="16.5" cy="14.5" r="1.5"/>
      </svg>
    ),
  },
  {
    label: "Virement",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm1.41-5.49l-.9.92C12.45 12.5 12 13 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .66-.27 1.26-.59 1.67z"/>
      </svg>
    ),
  },
  {
    label: "Espèces",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
      </svg>
    ),
  },
  {
    label: "Chèque",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z"/>
      </svg>
    ),
  },
];

export function PaymentMethodsSection() {
  return (
    <section className="relative py-10 overflow-hidden bg-dark-medium border-t border-white/6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">

        {/* Titre */}
        <p className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase mb-6">
          Moyens de paiement acceptés
        </p>

        {/* Icônes */}
        <div className="inline-flex items-stretch gap-1 bg-[#1a1a1a] border border-white/8 rounded-xl p-3 mb-5">
          {paymentMethods.map((method, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg"
            >
              <span className="text-primary">{method.icon}</span>
              <span className="text-white text-xs font-medium whitespace-nowrap">{method.label}</span>
            </div>
          ))}
        </div>

        {/* Sous-titre */}
        <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
          Paiement possible au moment de la prise en charge
        </p>
      </div>
    </section>
  );
}
