const GEOPLATEFORME_AUTOCOMPLETE_URL = "https://data.geopf.fr/geocodage/completion/";

export const MIN_ADDRESS_AUTOCOMPLETE_QUERY_LENGTH = 3;
export const DEFAULT_ADDRESS_AUTOCOMPLETE_LIMIT = 5;

export interface AddressSuggestion {
  label: string;
  city?: string;
  postcode?: string;
  lat?: number;
  lon?: number;
  source: "geoplateforme";
}

interface GeoplateformeResponse {
  results?: GeoplateformeResult[];
}

interface GeoplateformeResult {
  fulltext?: string;
  city?: string;
  zipcode?: string;
  x?: number;
  y?: number;
  names?: string[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toSuggestion(result: GeoplateformeResult): AddressSuggestion | null {
  const label = result.fulltext?.trim() || result.names?.[0]?.trim();
  if (!label) return null;

  return {
    label,
    city: result.city?.trim() || undefined,
    postcode: result.zipcode?.trim() || undefined,
    lat: isFiniteNumber(result.y) ? result.y : undefined,
    lon: isFiniteNumber(result.x) ? result.x : undefined,
    source: "geoplateforme",
  };
}

export async function searchAddressSuggestions(
  query: string,
  options?: { signal?: AbortSignal; limit?: number }
): Promise<AddressSuggestion[]> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < MIN_ADDRESS_AUTOCOMPLETE_QUERY_LENGTH) {
    return [];
  }

  const params = new URLSearchParams({
    text: normalizedQuery,
    type: "StreetAddress,PositionOfInterest",
    maximumResponses: String(options?.limit ?? DEFAULT_ADDRESS_AUTOCOMPLETE_LIMIT),
    terr: "METROPOLE",
  });

  // TODO: si un proxy backend devient nécessaire plus tard, conserver cette fonction
  // comme unique point d'entrée pour remplacer l'URL publique Géoplateforme.
  const response = await fetch(`${GEOPLATEFORME_AUTOCOMPLETE_URL}?${params.toString()}`, {
    signal: options?.signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Autocomplete HTTP ${response.status}`);
  }

  const data = (await response.json()) as GeoplateformeResponse;
  const seen = new Set<string>();

  return (data.results || [])
    .map(toSuggestion)
    .filter((suggestion): suggestion is AddressSuggestion => Boolean(suggestion))
    .filter((suggestion) => {
      const key = suggestion.label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
