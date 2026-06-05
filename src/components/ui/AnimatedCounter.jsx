import { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({ value, duration = 1200, decimals = 0, style }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef   = useRef(null);

  useEffect(() => {
    if (value == null) return;
    const target = Number(value);
    const start  = Date.now();

    const ease = (t) => 1 - Math.pow(1 - t, 3); // cubic ease-out

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(+(target * ease(progress)).toFixed(decimals));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration, decimals]);

  return <span style={style}>{display.toLocaleString("es-PE")}</span>;
}
