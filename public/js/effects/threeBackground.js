export function startBackgroundScene() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '0';
  canvas.style.pointerEvents = 'none';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 36 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 1 + Math.random() * 2.2,
    vx: -0.0003 + Math.random() * 0.0006,
    vy: -0.0003 + Math.random() * 0.0006,
    hue: 260 + Math.random() * 80
  }));

  const resize = () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };

  window.addEventListener('resize', resize);
  resize();

  const animate = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > 1) particle.vx *= -1;
      if (particle.y < 0 || particle.y > 1) particle.vy *= -1;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${particle.hue}, 85%, 65%, 0.12)`;
      ctx.arc(particle.x * window.innerWidth, particle.y * window.innerHeight, particle.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(animate);
  };

  animate();
}
