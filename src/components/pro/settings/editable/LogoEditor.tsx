"use client";

import type { Dispatch, SetStateAction } from "react";
import type { TenantSettingsV1 } from "@/config/tenant-settings.types";
import { clampLogoScale, LOGO_SCALE_DEFAULT, LOGO_SCALE_MAX, LOGO_SCALE_MIN, logoHeightPx } from "@/lib/logoScale";
import { EditableField } from "./EditableField";
import { EditableImageField } from "./EditableImageField";
import { proBtnSecondaryClass } from "./proFieldStyles";

const PRESETS = [
  { label: "Petit", value: 75 },
  { label: "Normal", value: 100 },
  { label: "Grand", value: 150 },
  { label: "Très grand", value: 200 },
] as const;

type LogoEditorProps = {
  draft: TenantSettingsV1;
  setDraft: Dispatch<SetStateAction<TenantSettingsV1>>;
  editing: boolean;
};

/** Logo : remplacement, recadrage des marges et taille dans l’en-tête, avec simulation de l’en-tête du site. */
export function LogoEditor({ draft, setDraft, editing }: LogoEditorProps) {
  const { logoSrc, logoAlt } = draft.branding;
  const scale = clampLogoScale(draft.branding.logoScale);
  const px = logoHeightPx(scale);

  const patchBranding = (patch: Partial<TenantSettingsV1["branding"]>) =>
    setDraft((d) => ({ ...d, branding: { ...d.branding, ...patch } }));

  return (
    <div className="space-y-4">
      <EditableImageField
        label="Logo"
        value={logoSrc}
        onChange={(v) => patchBranding({ logoSrc: v })}
        editing={editing}
        altPreview={logoAlt}
        where={{ page: "En-tête de toutes les pages", position: "en haut à gauche, à côté du nom", href: "/" }}
        recommended="PNG transparent, 600 px de large minimum"
        hint="Logo trop petit ? Utilisez « Recadrer » pour retirer les marges vides de l’image, puis réglez la taille ci-dessous."
      />

      <div className="space-y-3 rounded-2xl border border-[var(--pro-border)] bg-[var(--pro-panel)] p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]">Taille du logo dans l’en-tête</span>
          <span className="text-sm font-semibold text-[var(--pro-text)]">{scale} %</span>
        </div>

        {/* Simulation de l’en-tête du site (fond sombre) */}
        <div className="flex min-h-16 items-center gap-2.5 overflow-hidden rounded-xl bg-neutral-900 px-4 py-2">
          {logoSrc.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element -- simulation de l’en-tête
            <img
              src={logoSrc}
              alt={logoAlt || "Logo"}
              className="block w-auto object-contain"
              style={{ height: px, maxWidth: `${px * 4}px` }}
            />
          ) : (
            <span className="text-xs text-neutral-400">Aucun logo</span>
          )}
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold text-white">{draft.general.commercialName || "Nom commercial"}</span>
            <span className="text-[10px] font-semibold tracking-wider text-neutral-400">{draft.general.tagline}</span>
          </span>
        </div>

        <input
          type="range"
          min={LOGO_SCALE_MIN}
          max={LOGO_SCALE_MAX}
          step={5}
          value={scale}
          disabled={!editing}
          onChange={(e) => patchBranding({ logoScale: Number(e.target.value) })}
          className="w-full accent-[var(--pro-accent)] disabled:opacity-60"
          aria-label="Taille du logo en pourcentage"
        />
        {editing ? (
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => patchBranding({ logoScale: p.value })}
                className={`${proBtnSecondaryClass} ${scale === p.value ? "!border-[var(--pro-accent)] !bg-[var(--pro-accent-soft)]" : ""}`}
              >
                {p.label}
              </button>
            ))}
            {scale !== LOGO_SCALE_DEFAULT ? (
              <button type="button" onClick={() => patchBranding({ logoScale: LOGO_SCALE_DEFAULT })} className={proBtnSecondaryClass}>
                Réinitialiser
              </button>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-[var(--pro-text-muted)]">Cliquez sur « Modifier » pour ajuster la taille.</p>
        )}
      </div>

      <EditableField label="Texte alternatif du logo" value={logoAlt} onChange={(v) => patchBranding({ logoAlt: v })} editing={editing} />
    </div>
  );
}
