import Link from "next/link";

const footerLinks = {
  services: [
    { href: "/calculateur", label: "Réservation en ligne" },
    { href: "/devis", label: "Devis gratuit" },
    { href: "/tarifs", label: "Tarifs" },
  ],
  infos: [
    { href: "/services", label: "Nos services" },
    { href: "/a-propos", label: "À propos" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/jeu", label: "Mini-Jeu VTC76" },
  ],
  legal: [
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/mentions-legales#cookies", label: "Cookies" },
    { href: "/mentions-legales#confidentialite", label: "Confidentialité" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-dark-medium border-t border-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">YGvtc - VTC76</h3>
            <p className="text-gray-light text-sm leading-relaxed">
              VTC professionnel en Normandie. Transferts vers Orly, CDG, Beauvais. 
              Service premium, ponctualité garantie.
            </p>
            <p className="mt-4 text-gray-light text-sm">
              30 rue Jean Prévost, 76110 Goderville
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-light hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Informations
            </h3>
            <ul className="space-y-2">
              {footerLinks.infos.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-light hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-surface flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-medium hover:text-primary text-xs transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-gray-medium text-xs">
            © {new Date().getFullYear()} YGvtc - VTC76. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
