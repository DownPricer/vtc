"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AIRPORTS } from "@/lib/pricing/config";

const API_URL = "https://api-adresse.data.gouv.fr/search/";
const DEBOUNCE_MS = 300;

export interface AddressSuggestion {
  label: string;
  formatted: string;
  lat: number;
  lon: number;
}

export interface AddressAutocompleteProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  airportMode?: boolean;
  onChange?: (value: { formatted: string; lat?: number; lon?: number } | string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
}

interface ApiFeature {
  properties: { label: string };
  geometry: { coordinates: [number, number] };
}

export function AddressAutocomplete({
  id,
  name,
  value = "",
  placeholder = "Rechercher une adresse...",
  airportMode = false,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  className = "",
  label,
}: AddressAutocompleteProps) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const airportList = Object.entries(AIRPORTS).map(([code, ap]) => ({
    code,
    label: `${code} - ${ap.names[0]}`,
    formatted: ap.address,
  }));

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q || q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: q.trim(),
        limit: "5",
        type: "housenumber",
      });
      const res = await fetch(`${API_URL}?${params}`);
      const data = await res.json();
      const features = (data?.features || []) as ApiFeature[];
      const list: AddressSuggestion[] = features.map((f) => ({
        label: f.properties?.label || "",
        formatted: f.properties?.label || "",
        lon: f.geometry?.coordinates?.[0] ?? 0,
        lat: f.geometry?.coordinates?.[1] ?? 0,
      })).filter((s) => s.formatted);
      setSuggestions(list);
    } catch (e) {
      console.error("[AddressAutocomplete]", e);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setInput(value);
  }, [value]);

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
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!airportMode) fetchSuggestions(v);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
  };

  const handleFocus = () => setOpen(true);

  const selectAddress = (s: AddressSuggestion) => {
    setInput(s.formatted);
    setSuggestions([]);
    setOpen(false);
    onChange?.({ formatted: s.formatted, lat: s.lat, lon: s.lon });
  };

  const selectAirport = (ap: { code: string; formatted: string }) => {
    setInput(ap.formatted);
    setOpen(false);
    onChange?.({ formatted: ap.formatted });
  };

  const showDropdown = open && (airportMode ? airportList.length > 0 : suggestions.length > 0);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      <div className="relative">
        {/* Icône localisation */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
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
          id={id}
          name={name}
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={handleFocus}
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
          className="w-full pl-10 pr-10 py-3.5 rounded-xl bg-dark border border-white/8 text-white text-sm placeholder-gray-600 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>
      {showDropdown && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1.5 w-full rounded-xl bg-surface border border-white/10 shadow-xl max-h-52 overflow-y-auto"
        >
          {airportMode
            ? airportList.map((ap) => (
                <li
                  key={ap.code}
                  role="option"
                  tabIndex={0}
                  aria-selected={input === ap.formatted}
                  className="px-4 py-3.5 text-white hover:bg-white/5 cursor-pointer transition-colors text-sm flex items-center gap-3 border-b border-white/5 last:border-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectAirport(ap);
                  }}
                >
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {ap.label}
                </li>
              ))
            : suggestions.map((s, i) => (
                <li
                  key={`${s.label}-${i}`}
                  role="option"
                  tabIndex={0}
                  aria-selected={input === s.formatted}
                  className="px-4 py-3.5 text-white hover:bg-white/5 cursor-pointer transition-colors text-sm flex items-center gap-3 border-b border-white/5 last:border-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectAddress(s);
                  }}
                >
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {s.label}
                </li>
              ))}
        </ul>
      )}
    </div>
  );
}
