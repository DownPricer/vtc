import { defaultTenantSettings } from "@/config/defaultTenantSettings";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";

const icons = {
  credit_card: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
  bank: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
      />
    </svg>
  ),
  cash: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  document: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
} as const;

type Props = { tenantSettings?: TenantSettingsV1 };

export function PaymentSection({ tenantSettings = defaultTenantSettings }: Props) {
  const t = tenantSettings;
  const section = t.home.paymentMethods;
  const moyens = section.items.filter((m) => m.enabled);

  return (
    <section className="py-10 md:py-14 bg-dark relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-12">

          {/* Label */}
          <div className="flex-shrink-0 text-center sm:text-left">
            <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">
              {section.eyebrow}
            </p>
            <p className="text-white font-black text-base md:text-lg leading-tight">{section.title}</p>
            <p className="text-gray-600 text-xs mt-1">{section.subtitle}</p>
          </div>

          {/* Séparateur */}
          <div className="hidden sm:block w-px h-14 bg-white/[0.06] flex-shrink-0" />

          {/* Grille paiements */}
          <div className="grid grid-cols-4 gap-3 sm:gap-5 flex-1 w-full">
            {moyens.map((m) => (
              <div
                key={m.label}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-primary group-hover:border-primary/30 group-hover:bg-primary/[0.06] transition-all duration-200">
                  {icons[m.iconKey as keyof typeof icons]}
                </div>
                <div className="text-center">
                  <p className="text-white text-[11px] md:text-xs font-semibold leading-tight">{m.label}</p>
                  <p className="text-gray-600 text-[9px] md:text-[10px] hidden sm:block">{m.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
