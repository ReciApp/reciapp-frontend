/**
 * Splash — "Apple style"
 *
 * Principios:
 *  · Un solo elemento protagonista (el logo mark)
 *  · Timing preciso, sin nada de más
 *  · Spring muy ajustado — no rebota, solo fluye
 *  · Salida unificada: todos los elementos salen juntos
 *  · Duración total: 2.8 s
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Easing curves de Apple (extraídas de sus animaciones de iOS 18)
const EASE_OUT   = [0.25, 0.46, 0.45, 0.94];
const EASE_INOUT = [0.45, 0.05, 0.55, 0.95];

// ── Timings (ms) ──────────────────────────────────────────────────────────────
const T_LOGO     = 80;
const T_TITLE    = 480;
const T_TAGLINE  = 760;
const T_EXIT     = 2000;
const T_DONE     = 2700;

export default function Splash({ onDone }) {
  const [show, setShow]     = useState({ logo: false, title: false, tagline: false });
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShow(s => ({ ...s, logo:    true })), T_LOGO),
      setTimeout(() => setShow(s => ({ ...s, title:   true })), T_TITLE),
      setTimeout(() => setShow(s => ({ ...s, tagline: true })), T_TAGLINE),
      setTimeout(() => setExiting(true), T_EXIT),
      setTimeout(() => onDone(),         T_DONE),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  // Shared exit transition — everything leaves together
  const exitProps = {
    animate: exiting ? { opacity: 0, scale: 0.96, filter: "blur(6px)" } : {},
    transition: { duration: 0.55, ease: EASE_INOUT },
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#030a05",
        overflow: "hidden",
      }}
    >
      {/* Ambient light — static, barely visible */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(132,204,22,0.06) 0%, transparent 70%)",
      }} />

      {/* ── Logo mark ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {show.logo && (
          <motion.div
            {...exitProps}
            initial={{ opacity: 0, scale: 0.86, filter: "blur(12px)" }}
            animate={exiting
              ? { opacity: 0, scale: 0.96, filter: "blur(6px)" }
              : { opacity: 1, scale: 1,    filter: "blur(0px)"  }}
            transition={exiting
              ? { duration: 0.55, ease: EASE_INOUT }
              : { duration: 0.9, ease: EASE_OUT }}
            style={{ marginBottom: "1.75rem", position: "relative" }}
          >
            {/* Outer soft glow ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={exiting ? { opacity: 0 } : { opacity: [0, 0.18, 0.12], scale: [0.6, 1.15, 1] }}
              transition={{ duration: 1.4, ease: EASE_OUT }}
              style={{
                position: "absolute",
                inset: -36,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(132,204,22,0.35) 0%, transparent 70%)",
                filter: "blur(20px)",
                pointerEvents: "none",
              }}
            />

            {/* Icon container */}
            <div style={{
              width: 96, height: 96,
              borderRadius: 24,
              background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.18)",
                "0 0 0 1px rgba(132,204,22,0.15)",
                "0 8px 32px rgba(0,0,0,0.5)",
              ].join(", "),
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}>
              <span style={{
                fontSize: 52,
                filter: "drop-shadow(0 0 16px rgba(132,204,22,0.7))",
                lineHeight: 1,
              }}>
                ♻
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Word mark ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {show.title && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={exiting ? { opacity: 0, y: -4 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE_OUT }}
            style={{ textAlign: "center" }}
          >
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(2rem,6vw,2.75rem)",
              letterSpacing: "-0.04em",
              color: "white",
              margin: 0, lineHeight: 1,
            }}>
              Reci<span style={{ color: "#a3e635" }}>App</span>
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tagline ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {show.tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={exiting ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(0.7rem,1.5vw,0.8rem)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
              marginTop: "0.875rem",
            }}
          >
            Reciclaje inteligente · Lima
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
