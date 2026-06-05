import confetti from "canvas-confetti";

const ECO_COLORS = ["#84cc16","#a3e635","#4ade80","#22c55e","#ffffff","#d9f99d"];

export function useConfetti() {
  const burst = (origin = { x:.5, y:.6 }) => {
    // Haptic feedback (mobile)
    if (navigator.vibrate) navigator.vibrate([40, 20, 80, 20, 120]);

    // Left burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: origin.x - 0.15, y: origin.y },
      colors: ECO_COLORS,
      scalar: 1.1,
      ticks: 220,
    });

    // Right burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: origin.x + 0.15, y: origin.y },
      colors: ECO_COLORS,
      scalar: 1.1,
      ticks: 220,
    });

    // Center stars
    confetti({
      particleCount: 30,
      spread: 360,
      startVelocity: 20,
      origin,
      shapes: ["star"],
      colors: ECO_COLORS,
      scalar: 1.4,
      ticks: 180,
    });
  };

  return { burst };
}
