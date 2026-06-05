import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Particles from "../components/ui/Particles";

function AuroraOrbs() {
  return (
    <>
      <div style={{
        position: "fixed", top: "-10%", right: "-5%", width: 550, height: 550,
        borderRadius: "50%", background: "rgba(132,204,22,.09)", filter: "blur(80px)",
        zIndex: 0, pointerEvents: "none",
      }} className="orb-1" />
      <div style={{
        position: "fixed", bottom: "-10%", left: "-8%", width: 600, height: 600,
        borderRadius: "50%", background: "rgba(74,222,128,.07)", filter: "blur(80px)",
        zIndex: 0, pointerEvents: "none",
      }} className="orb-2" />
    </>
  );
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100dvh", background: "#0b1f12", color: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <AuroraOrbs />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Particles count={45} color="132,204,22" opacity={0.35} />
      </div>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem" }}>
        {/* Animated recycling icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
          style={{ fontSize: "5rem", display: "inline-block", marginBottom: "1.5rem", lineHeight: 1 }}
        >
          ♻
        </motion.div>

        {/* 404 */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.1 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(5rem,18vw,9rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            background: "linear-gradient(135deg,#a3e635 0%,#4ade80 40%,#86efac 70%,#fff 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "1rem",
          }}
        >
          404
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.2 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.15rem",
            color: "rgba(255,255,255,.55)",
            marginBottom: "2.5rem",
          }}
        >
          Esta página no existe.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.3 }}
        >
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-lime"
              style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}
            >
              Volver al inicio →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
