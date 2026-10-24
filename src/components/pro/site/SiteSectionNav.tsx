"use client";

import { useEffect, useRef, useState } from "react";

export type SiteSectionLink = { id: string; label: string };

/** Menu d'ancres collé sous l'en-tête pro : permet de sauter à une section de la longue page. */
export function SiteSectionNav({ sections }: { sections: SiteSectionLink[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const listRef = useRef<HTMLUListElement>(null);

  // Section active = la dernière dont le haut a dépassé le bas du menu collé ; en bas de page, la dernière.
  useEffect(() => {
    const update = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
      let current = sections[0]?.id ?? "";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 160) current = s.id;
      }
      setActive(atBottom ? sections[sections.length - 1].id : current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  // Garde la pastille active visible dans le menu horizontal (mobile).
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [active]);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Sections de la page"
      className="sticky top-[59px] z-20 -mx-[18px] border-b border-[var(--pro-border)] bg-[var(--pro-bg)]/95 px-[18px] py-2 backdrop-blur sm:top-[61px] sm:mx-0 sm:rounded-xl sm:border"
    >
      <ul ref={listRef} className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <button
              type="button"
              onClick={() => goTo(s.id)}
              aria-current={active === s.id ? "true" : undefined}
              className={`min-h-[40px] rounded-full border px-3.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pro-accent)] ${
                active === s.id
                  ? "border-[var(--pro-accent)] bg-[var(--pro-accent-soft)] text-[var(--pro-text)]"
                  : "border-[var(--pro-border)] bg-[var(--pro-panel)] text-[var(--pro-text-muted)] hover:text-[var(--pro-text)]"
              }`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
