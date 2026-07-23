/* Minimal dependency-free confetti burst (no external libraries) */
(function () {
  const COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#D9333F", "#C9A227"];

  function burst(originX, originY, count) {
    const wrap = document.getElementById("confetti-canvas-wrap");
    if (!wrap) return;

    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    wrap.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const particles = Array.from({ length: count }, () => ({
      x: originX,
      y: originY,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -14 - 4,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      shape: Math.random() > 0.5 ? "rect" : "circle",
      gravity: 0.35 + Math.random() * 0.15,
      drag: 0.99,
    }));

    let frame = 0;
    const maxFrames = 140;

    function tick() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.y < canvas.height + 20) alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (alive && frame < maxFrames) {
        requestAnimationFrame(tick);
      } else {
        wrap.removeChild(canvas);
      }
    }
    requestAnimationFrame(tick);
  }

  function celebrate() {
    burst(window.innerWidth * 0.2, window.innerHeight * 0.3, 60);
    setTimeout(() => burst(window.innerWidth * 0.8, window.innerHeight * 0.3, 60), 120);
    setTimeout(() => burst(window.innerWidth * 0.5, window.innerHeight * 0.15, 80), 240);
  }

  window.WeddingConfetti = { celebrate, burst };
})();
