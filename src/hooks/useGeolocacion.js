import { useEffect, useRef } from "react";

const THROTTLE_MS = 2000;   // máximo un update cada 2 segundos
const MIN_DIST_M  = 10;     // ignorar si se movió menos de 10 metros

function _haversineMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Monitorea la posición GPS del dispositivo con alta precisión.
 * Solo llama a `onPosicion` si han pasado al menos THROTTLE_MS ms
 * y el dispositivo se movió al menos MIN_DIST_M metros.
 *
 * @param {({lat: number, lon: number}) => void} onPosicion
 * @param {boolean} enabled
 */
export function useGeolocacion(onPosicion, enabled = true) {
  const lastPosRef  = useRef(null);
  const lastSendRef = useRef(0);
  const onPosRef    = useRef(onPosicion);

  useEffect(() => { onPosRef.current = onPosicion; }, [onPosicion]);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        const ahora = Date.now();

        if (ahora - lastSendRef.current < THROTTLE_MS) return;

        if (lastPosRef.current) {
          const d = _haversineMetros(
            lastPosRef.current.lat, lastPosRef.current.lon, lat, lon
          );
          if (d < MIN_DIST_M) return;
        }

        lastPosRef.current   = { lat, lon };
        lastSendRef.current  = ahora;
        onPosRef.current({ lat, lon });
      },
      (err) => console.warn("GPS:", err.message),
      { enableHighAccuracy: true, maximumAge: 2000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled]);
}
