type Snapshot = {
  name?: string;
  brand?: string | null;
  model?: string | null;
  passengerMax?: number;
  photoUrl?: string | null;
  tarifBase?: number;
  tarifTotal?: number;
  surcharge?: { amount?: number };
};

function snapshotOf(pricing: Record<string, unknown> | null | undefined): Snapshot | null {
  const v = pricing?.vehicle;
  return v && typeof v === "object" ? (v as Snapshot) : null;
}

const eur = (n: number) => `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)} €`;

/** Véhicule figé dans le devis (snapshot au moment de l'envoi) : nom, capacité et photo principale d'alors. */
export function QuoteVehiclePhoto({ pricing }: { pricing?: Record<string, unknown> | null }) {
  const v = snapshotOf(pricing);
  if (!v?.name) return null;
  return (
    <section className="print-card mt-8">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Véhicule</h2>
      <div className="mt-3 flex items-center gap-4">
        {v.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- document imprimable
          <img src={v.photoUrl} alt="" className="h-24 w-36 rounded-md border border-slate-200 object-cover" />
        ) : null}
        <div className="text-sm">
          <p className="text-base font-semibold text-slate-900">{v.name}</p>
          {v.passengerMax ? <p className="text-slate-600">{v.passengerMax} passagers maximum</p> : null}
        </div>
      </div>
    </section>
  );
}

/** Détail du prix : tarif du trajet + supplément véhicule (affiché seulement quand un supplément a été appliqué). */
export function QuoteVehiclePricing({ pricing }: { pricing?: Record<string, unknown> | null }) {
  const v = snapshotOf(pricing);
  const amount = v?.surcharge?.amount ?? 0;
  if (!v || amount <= 0 || typeof v.tarifBase !== "number") return null;
  return (
    <table className="mt-4 w-full max-w-sm border-collapse text-sm">
      <tbody>
        <tr className="border-b border-slate-100">
          <td className="py-1.5 pr-4 text-slate-600">Tarif du trajet</td>
          <td className="py-1.5 text-right tabular-nums text-slate-900">{eur(v.tarifBase)}</td>
        </tr>
        <tr className="border-b border-slate-100">
          <td className="py-1.5 pr-4 text-slate-600">Supplément véhicule{v.name ? ` (${v.name})` : ""}</td>
          <td className="py-1.5 text-right tabular-nums text-slate-900">{eur(amount)}</td>
        </tr>
      </tbody>
    </table>
  );
}
