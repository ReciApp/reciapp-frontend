import { useEffect, useRef } from "react";

export default function Particles({ count = 55, color = "132,204,22", opacity = 0.45 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    canvas.parentElement?.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    });
    canvas.parentElement?.addEventListener("mouseleave", () => { mouse = { x:-9999, y:-9999 }; });

    const particles = Array.from({ length: count }, () => ({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height,
      r:   Math.random() * 1.8 + 0.4,
      dx:  (Math.random() - 0.5) * 0.35,
      dy:  -(Math.random() * 0.5 + 0.15),
      op:  Math.random() * opacity + 0.1,
      life: Math.random(),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Mouse repulsion
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md  = Math.sqrt(mdx*mdx + mdy*mdy);
        if (md < 100) {
          p.x += (mdx / md) * 1.5;
          p.y += (mdy / md) * 1.5;
        }

        p.x  += p.dx;
        p.y  += p.dy;
        p.life += 0.003;

        if (p.y < -10) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 5;
        if (p.x > canvas.width + 10) p.x = -5;

        const pulse = Math.sin(p.life * Math.PI * 2) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.op * pulse})`;
        ctx.fill();
      });

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${color},${(1 - d/90) * 0.18})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [count, color, opacity]);

  return (
    <canvas ref={canvasRef} style={{
      position:"absolute", inset:0, width:"100%", height:"100%",
      pointerEvents:"none", zIndex:1,
    }} />
  );
}
