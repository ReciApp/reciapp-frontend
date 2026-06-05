/**
 * LiquidGlass — Physically-based glass refraction using Snell-Descartes law.
 *
 * Technique: SVG feDisplacementMap applied as backdrop-filter.
 * The displacement map encodes refraction vectors computed from the surface
 * normal of a convex squircle (Apple's preferred profile).
 *
 * Ref: https://kube.io/blog/liquid-glass-css-svg/
 * Note: backdrop-filter + SVG filter is Chrome-only. Safari/Firefox fall back
 *       to standard glassmorphism (blur + saturate).
 */

import { useEffect, useRef, useState, useId, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ── Physics ─────────────────────────────────────────────────────────────────

/** Convex squircle: Apple's preferred surface profile. Smoother than sphere. */
const squircle = (t) =>
  t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(1 - Math.pow(1 - t, 4), 0.25);

/** Numerical derivative of surface profile. */
const dSquircle = (t) => {
  const eps = 5e-5;
  const t0 = Math.max(0, t - eps);
  const t1 = Math.min(1 - 1e-6, t + eps);
  return (squircle(t1) - squircle(t0)) / (t1 - t0);
};

/**
 * Generates an RGBA displacement map for a convex glass lens.
 * R channel = X displacement direction
 * G channel = Y displacement direction
 * scale attribute in feDisplacementMap = maxPx (maximum pixel shift)
 */
function buildDisplacementMap(w, h, ior = 1.55) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(w, h);
  const d = img.data;

  const cx = w / 2, cy = h / 2;
  const rx = w / 2, ry = h / 2;
  const n1 = 1.0, n2 = ior;

  const buf = new Float32Array(w * h * 2);
  let maxMag = 0;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const i = py * w + px;
      // Normalized elliptical coords
      const ex = (px - cx) / rx;
      const ey = (py - cy) / ry;
      const r  = Math.sqrt(ex * ex + ey * ey);

      if (r < 1e-6 || r >= 1) continue;

      // Surface slope at this radius using the squircle profile
      const slope = dSquircle(r);

      // Surface normal (2D radial cross-section): perpendicular to tangent
      // tangent direction = (1, slope), normal = (-slope, 1) normalized
      const nLen  = Math.sqrt(slope * slope + 1);
      const sinI  = Math.min(0.9999, Math.abs(slope) / nLen);
      const sinT  = (n1 / n2) * sinI;

      if (sinT >= 1) continue; // total internal reflection — skip

      // Deflection angle (Snell's law gives how much the ray bends)
      const deflect = Math.sign(slope) * (sinT - sinI);

      // Angle in the 2D plane (corrected for ellipse aspect ratio)
      const angle = Math.atan2(ey * rx, ex * ry);
      const dx = deflect * Math.cos(angle);
      const dy = deflect * Math.sin(angle);

      buf[i * 2]     = dx;
      buf[i * 2 + 1] = dy;

      const mag = Math.sqrt(dx * dx + dy * dy);
      if (mag > maxMag) maxMag = mag;
    }
  }

  // Encode into RGBA (R=X, G=Y, centered at 128)
  for (let i = 0; i < w * h; i++) {
    const nx = maxMag > 0 ? buf[i * 2]     / maxMag : 0;
    const ny = maxMag > 0 ? buf[i * 2 + 1] / maxMag : 0;
    d[i * 4]     = Math.round(128 + nx * 127);
    d[i * 4 + 1] = Math.round(128 + ny * 127);
    d[i * 4 + 2] = 128;
    d[i * 4 + 3] = 255;
  }

  ctx.putImageData(img, 0, 0);

  // maxPx = the feDisplacementMap scale value (pixel magnitude of maximum shift)
  const maxPx = maxMag * Math.min(rx, ry) * 1.8;
  return { dataUrl: canvas.toDataURL("image/png"), maxPx };
}

// ── Browser detection ────────────────────────────────────────────────────────
const isChrome =
  typeof navigator !== "undefined" &&
  /Chrome/.test(navigator.userAgent) &&
  !/Edg|OPR/.test(navigator.userAgent);

// ── Component ────────────────────────────────────────────────────────────────
export default function LiquidGlass({
  children,
  borderRadius = 16,
  ior          = 1.55,   // index of refraction (glass ≈ 1.5, crystal ≈ 1.7)
  blur         = 14,     // backdrop blur in px
  tint         = "rgba(255,255,255,0.10)",
  specular     = true,   // mouse-tracked specular highlight
  style        = {},
  className    = "",
  onClick,
}) {
  const uid   = useId().replace(/:/g, "");
  const filterId = `lg-${uid}`;
  const ref   = useRef(null);

  const [map, setMap] = useState(null);   // { dataUrl, maxPx }
  const [size, setSize] = useState({ w: 0, h: 0 });

  // ResizeObserver — rebuild map when element size changes
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const w = Math.round(width);
      const h = Math.round(height);
      if (w > 4 && h > 4) setSize({ w, h });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  // Rebuild displacement map when size or IOR changes
  useEffect(() => {
    if (size.w < 4 || size.h < 4) return;
    // Run off the main thread tick so render isn't blocked
    const id = setTimeout(() => setMap(buildDisplacementMap(size.w, size.h, ior)), 0);
    return () => clearTimeout(id);
  }, [size.w, size.h, ior]);

  // Specular highlight — spring-follows mouse
  const mx = useMotionValue(0.3);
  const my = useMotionValue(0.15);
  const sx = useSpring(mx, { stiffness: 160, damping: 28 });
  const sy = useSpring(my, { stiffness: 160, damping: 28 });
  const [specularStyle, setSpecularStyle] = useState({});

  useEffect(() => {
    if (!specular) return;
    const unsubX = sx.on("change", () => {
      setSpecularStyle({
        background: `radial-gradient(ellipse 70% 50% at ${sx.get() * 100}% ${sy.get() * 100}%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 50%, transparent 75%)`,
      });
    });
    return unsubX;
  }, [sx, sy, specular]);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current || !specular) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top)  / rect.height);
  }, [mx, my, specular]);

  const handleMouseLeave = useCallback(() => {
    mx.set(0.3); my.set(0.15);
  }, [mx, my]);

  // Compose backdrop-filter
  const bdFilter = (() => {
    if (isChrome && map) {
      return `url(#${filterId}) blur(${blur}px) saturate(190%) brightness(1.05)`;
    }
    return `blur(${blur}px) saturate(190%) brightness(1.05)`;
  })();

  return (
    <>
      {/* SVG filter — hidden, Chrome-only */}
      {isChrome && map && (
        <svg
          aria-hidden="true"
          style={{ position: "fixed", width: 0, height: 0, overflow: "hidden", top: 0, left: 0 }}
        >
          <defs>
            <filter
              id={filterId}
              x="0" y="0"
              width={size.w} height={size.h}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={map.dataUrl}
                x="0" y="0"
                width={size.w} height={size.h}
                result="disp"
                preserveAspectRatio="none"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="disp"
                scale={map.maxPx}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* Glass element */}
      <div
        ref={ref}
        className={className}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius,
          backdropFilter: bdFilter,
          WebkitBackdropFilter: `blur(${blur}px) saturate(190%)`,
          background: tint,
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow: [
            "inset 0 1.5px 0 rgba(255,255,255,0.45)",
            "inset 0 -1px 0 rgba(0,0,0,0.08)",
            "0 8px 32px rgba(0,0,0,0.18)",
            "0 2px 8px rgba(0,0,0,0.10)",
          ].join(", "),
          ...style,
        }}
      >
        {/* Specular highlight */}
        {specular && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute", inset: 0,
              borderRadius: "inherit",
              pointerEvents: "none",
              zIndex: 1,
              transition: "background 0.05s linear",
              ...specularStyle,
            }}
          />
        )}

        {/* Rim edge highlight */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            zIndex: 2,
            background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.06) 100%)",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
      </div>
    </>
  );
}
