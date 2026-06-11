import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function MagneticButton({ children, strength = 0.35, className, style, onClick, disabled, type }) {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 320, damping: 22 });
  const y = useSpring(rawY, { stiffness: 320, damping: 22 });

  const handleMouse = (e) => {
    if (disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    rawX.set((e.clientX - cx) * strength);
    rawY.set((e.clientY - cy) * strength);
  };

  const reset = () => { rawX.set(0); rawY.set(0); };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={{ ...style, x, y, display:"inline-flex", alignItems:"center", justifyContent:"center" }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {children}
    </motion.button>
  );
}
