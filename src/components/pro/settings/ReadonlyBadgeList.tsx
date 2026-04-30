type Item = { label: string; active?: boolean };

export function ReadonlyBadgeList({ items }: { items: Item[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item.label}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            item.active === false
              ? "border-[var(--pro-border)] bg-transparent text-[var(--pro-text-muted)] line-through opacity-70"
              : "border-[var(--pro-accent)]/35 bg-[var(--pro-accent-soft)] text-[var(--pro-accent)]"
          }`}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
