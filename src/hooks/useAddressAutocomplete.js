import { useState, useRef, useCallback } from "react";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const LIMA_VIEWBOX = "-77.25,-12.55,-76.7,-11.75"; // Lima bounding box

export function useAddressAutocomplete() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const timerRef = useRef(null);

  const search = useCallback((query) => {
    clearTimeout(timerRef.current);
    if (!query || query.length < 4) { setSuggestions([]); return; }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          limit: 5,
          countrycodes: "pe",
          viewbox: LIMA_VIEWBOX,
          bounded: 1,
          addressdetails: 1,
        });
        const res  = await fetch(`${NOMINATIM}?${params}`, {
          headers: { "Accept-Language": "es", "User-Agent": "ReciApp/2.0" },
        });
        const data = await res.json();
        setSuggestions(data.map((r) => ({
          label:    r.display_name,
          short:    [r.address?.road, r.address?.suburb, r.address?.city].filter(Boolean).join(", "),
          lat:      parseFloat(r.lat),
          lon:      parseFloat(r.lon),
        })));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 320);
  }, []);

  const clear = () => { setSuggestions([]); clearTimeout(timerRef.current); };

  return { suggestions, loading, search, clear };
}
