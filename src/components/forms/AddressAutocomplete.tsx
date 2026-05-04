"use client";

import { useState, useRef, useEffect, useCallback, useId, useMemo } from "react";
import {
  MIN_ADDRESS_AUTOCOMPLETE_QUERY_LENGTH,
  searchAddressSuggestions,
  type AddressSuggestion,
} from "@/lib/addressAutocomplete";
import { AIRPORTS } from "@/lib/pricing/config";
import { proInputClass } from "@/components/pro/settings/editable/proFieldStyles";

const DEBOUNCE_MS = 300;
type RequestState = "idle" | "loading" | "success" | "empty" | "error";

export interface AddressAutocompleteProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  airportMode?: boolean;
  /** `pro` : styles alignés sur le dashboard paramètres (clair / sombre). */
  appearance?: "calculator" | "pro";
  onChange?: (value: { formatted: string; lat?: number; lon?: number } | string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
}

export function AddressAutocomplete({
  id,
  name,
  value = "",
  placeholder = "Rechercher une adresse...",
  airportMode = false,
  appearance = "calculator",
  onChange,
  onBlur,
  disabled = false,
  required = false,
  className = "",
  label,
}: AddressAutocompleteProps) {
  const isPro = appearance === "pro";
  const generatedId = useId();
  const inputId = id ?? `address-autocomplete-${generatedId}`;
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const airportList = Object.entries(AIRPORTS).map(([code, ap]) => ({
    code,
    label: `${code} - ${ap.names[0]}`,
    formatted: ap.address,
  }));

  const filteredAirports = useMemo(() => {
    const normalizedInput = input.trim().toLowerCase();
    if (!normalizedInput) return airportList;

    return airportList.filter((airport) =>
      `${airport.code} ${airport.label} ${airport.formatted}`.toLowerCase().includes(normalizedInput)
    );
  }, [airportList, input]);

  const clearPendingSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    const trimmedQuery = q.trim();
    if (trimmedQuery.length < MIN_ADDRESS_AUTOCOMPLETE_QUERY_LENGTH) {
      clearPendingSearch();
      setSuggestions([]);
      setRequestState("idle");
      setHighlightedIndex(-1);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setRequestState("loading");

    try {
      const list = await searchAddressSuggestions(trimmedQuery, { signal: controller.signal });
      if (controller.signal.aborted) return;

      setSuggestions(list);
      setRequestState(list.length > 0 ? "success" : "empty");
      setHighlightedIndex(list.length > 0 ? 0 : -1);
    } catch (e) {
      if (controller.signal.aborted) return;
      console.error("[AddressAutocomplete]", e);
      setSuggestions([]);
      setRequestState("error");
      setHighlightedIndex(-1);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [clearPendingSearch]);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => () => clearPendingSearch(), [clearPendingSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInput(v);
    setHighlightedIndex(-1);
    onChange?.(v);

    if (airportMode) {
      setOpen(true);
      return;
    }

    clearPendingSearch();

    if (v.trim().length < MIN_ADDRESS_AUTOCOMPLETE_QUERY_LENGTH) {
      setSuggestions([]);
      setRequestState("idle");
      setOpen(false);
      return;
    }

    setOpen(true);
    setRequestState("loading");
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(v);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
  };

  const handleFocus = () => {
    if (airportMode) {
      setOpen(true);
      return;
    }

    if (input.trim().length >= MIN_ADDRESS_AUTOCOMPLETE_QUERY_LENGTH) {
      setOpen(true);
      if (suggestions.length === 0 && requestState === "idle") {
        setRequestState("loading");
        debounceRef.current = setTimeout(() => {
          void fetchSuggestions(input);
          debounceRef.current = null;
        }, DEBOUNCE_MS);
      }
    }
  };

  const selectAddress = (s: AddressSuggestion) => {
    clearPendingSearch();
    setInput(s.label);
    setSuggestions([]);
    setRequestState("idle");
    setOpen(false);
    setHighlightedIndex(-1);
    onChange?.({ formatted: s.label, lat: s.lat, lon: s.lon });
  };

  const labelClass = isPro
    ? "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--pro-text-muted)]"
    : "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400";

  const inputClass = isPro
    ? `${proInputClass} pl-10 pr-10`
    : "w-full pl-10 pr-10 py-3.5 rounded-xl bg-dark border border-white/8 text-white text-sm placeholder-gray-600 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50";

  const listboxClass = isPro
    ? "absolute z-[80] mt-1.5 max-h-60 w-full overflow-y-auto overscroll-contain rounded-xl border border-[var(--pro-border)] bg-[var(--pro-panel)] py-1 text-[var(--pro-text)] shadow-lg"
    : "absolute z-[80] mt-1.5 w-full rounded-xl bg-surface border border-white/10 shadow-xl max-h-60 overflow-y-auto overscroll-contain";

  const optionIdleClass = isPro
    ? "border-b border-[var(--pro-border)]/60 px-4 py-3.5 text-sm last:border-0"
    : "border-b border-white/5 px-4 py-3.5 text-white cursor-pointer transition-colors text-sm flex items-start gap-3 last:border-0";

  const optionActiveClass = isPro ? "bg-[var(--pro-accent-soft)]" : "bg-white/10";
  const optionHoverClass = isPro ? "hover:bg-[var(--pro-panel-muted)]" : "hover:bg-white/5";

  const mutedTextClass = isPro ? "text-[var(--pro-text-muted)]" : "text-gray-400";
  const subTextClass = isPro ? "text-[var(--pro-text-muted)]" : "text-gray-500";
  const iconMutedClass = isPro ? "text-[var(--pro-text-muted)]" : "text-gray-500";

  const selectAirport = (ap: { code: string; formatted: string }) => {
    setInput(ap.formatted);
    setOpen(false);
    setHighlightedIndex(-1);
    onChange?.({ formatted: ap.formatted });
  };

  const showDropdown = open && (
    airportMode
      ? filteredAirports.length > 0
      : input.trim().length >= MIN_ADDRESS_AUTOCOMPLETE_QUERY_LENGTH &&
        (requestState === "loading" ||
          requestState === "error" ||
          requestState === "empty" ||
          suggestions.length > 0)
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown" && airportMode && filteredAirports.length > 0) {
        e.preventDefault();
        setOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    const itemCount = airportMode ? filteredAirports.length : suggestions.length;

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (itemCount === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % itemCount);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? itemCount - 1 : prev - 1));
      return;
    }

    if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      if (airportMode) {
        selectAirport(filteredAirports[highlightedIndex]);
      } else {
        selectAddress(suggestions[highlightedIndex]);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={inputId} className={labelClass}>
          {label} {required && <span className={isPro ? "text-[var(--pro-accent)]" : "text-primary"}>*</span>}
        </label>
      )}
      <div className="relative">
        {/* Icône localisation */}
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${iconMutedClass}`}>
          {airportMode ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>
        <input
          id={inputId}
          name={name}
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onBlur={(e) => {
            setTimeout(() => {
              if (!containerRef.current?.contains(document.activeElement)) setOpen(false);
            }, 150);
            onBlur?.(e);
          }}
          placeholder={airportMode ? "Aéroport (ORY, CDG, BVA, CC)..." : placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={inputClass}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={`${inputId}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={highlightedIndex >= 0 ? `${inputId}-option-${highlightedIndex}` : undefined}
        />
        {requestState === "loading" && !airportMode && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className={`h-4 w-4 animate-spin ${iconMutedClass}`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>
      {showDropdown && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className={listboxClass}
        >
          {airportMode
            ? filteredAirports.map((ap, i) => (
                <li
                  id={`${inputId}-option-${i}`}
                  key={ap.code}
                  role="option"
                  tabIndex={0}
                  aria-selected={input === ap.formatted}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 text-sm transition-colors ${optionIdleClass} ${
                    highlightedIndex === i ? optionActiveClass : optionHoverClass
                  } ${isPro ? "text-[var(--pro-text)]" : "text-white"}`}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectAirport(ap);
                  }}
                >
                  <svg
                    className={`h-4 w-4 flex-shrink-0 ${isPro ? "text-[var(--pro-accent)]" : "text-primary"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {ap.label}
                </li>
              ))
            : (
              <>
                {requestState === "loading" && (
                  <li className={`px-4 py-3 text-sm ${isPro ? "text-[var(--pro-text-soft)]" : "text-gray-300"}`}>Recherche...</li>
                )}
                {requestState === "error" && (
                  <li className={`px-4 py-3 text-sm ${mutedTextClass}`}>Suggestions indisponibles pour le moment.</li>
                )}
                {requestState === "empty" && (
                  <li className={`px-4 py-3 text-sm ${mutedTextClass}`}>Aucune adresse trouvée.</li>
                )}
                {requestState !== "loading" &&
                  requestState !== "error" &&
                  suggestions.map((s, i) => (
                    <li
                      id={`${inputId}-option-${i}`}
                      key={`${s.label}-${i}`}
                      role="option"
                      tabIndex={0}
                      aria-selected={input === s.label}
                      className={`flex cursor-pointer items-start gap-3 px-4 py-3.5 text-sm transition-colors ${optionIdleClass} ${
                        highlightedIndex === i ? optionActiveClass : optionHoverClass
                      } ${isPro ? "text-[var(--pro-text)]" : "text-white"}`}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectAddress(s);
                      }}
                    >
                      <svg className={`mt-0.5 h-4 w-4 flex-shrink-0 ${iconMutedClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="min-w-0">
                        <div className="truncate">{s.label}</div>
                        {(s.postcode || s.city) && (
                          <div className={`mt-1 text-xs ${subTextClass}`}>
                            {[s.postcode, s.city].filter(Boolean).join(" ")}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
              </>
            )}
        </ul>
      )}
    </div>
  );
}
