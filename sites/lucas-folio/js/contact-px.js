/**
 * "Contact me" in pixel bricks, in the spirit of the PULSE hero lettering:
 * the word is sampled into small square bricks; the pointer pushes nearby
 * bricks away and they spring back to their place. Sits in the stage's
 * bottom-right corner where the newsletter button used to be.
 */
(() => {
  const link = document.getElementById("contact-btn");
  if (!link) return;
  const cv = link.querySelector("canvas");
  const ctx = cv.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TEXT = "CONTACT ME";
  const INK = "#ffd84d";      // brick colour: warm yellow on near-black reads at a glance
  const SHADOW = "rgba(0, 0, 0, 0.6)";

  let W = 0, H = 0, step = 3, bricks = [];
  const mouse = { x: -999, y: -999, in: false };
  let raf = 0;

  function build() {
    const r = cv.getBoundingClientRect();
    if (r.width < 2) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Read the word on the font's own pixel grid, so every font pixel becomes
    // exactly one brick (sampling on an unrelated grid is what blurred letters like A).
    const S = 64;                               // large, so each font pixel is a solid block
    const off = document.createElement("canvas");
    const o = off.getContext("2d");
    o.font = `400 ${S}px "Silkscreen", monospace`;
    off.width = Math.ceil(o.measureText(TEXT).width) + 8;
    off.height = Math.ceil(S * 1.4);
    o.font = `400 ${S}px "Silkscreen", monospace`;
    o.fillStyle = "#fff";
    o.textBaseline = "top";
    o.fillText(TEXT, 4, 4);
    const data = o.getImageData(0, 0, off.width, off.height).data;
    const on = (x, y) => data[(y * off.width + x) * 4 + 3] > 127;

    // font pixel size = shortest solid run, across rows and columns
    let unit = S;
    const scan = (len, other, at) => {
      for (let j = 0; j < other; j++) {
        let run = 0;
        for (let i = 0; i <= len; i++) {
          if (i < len && at(i, j)) run++;
          else { if (run >= 3 && run < unit) unit = run; run = 0; }
        }
      }
    };
    scan(off.width, off.height, (x, y) => on(x, y));
    scan(off.height, off.width, (y, x) => on(x, y));
    // bounding box of the ink, then sample each font pixel at its centre
    let x0 = off.width, y0 = off.height, x1 = 0, y1 = 0;
    for (let y = 0; y < off.height; y++) for (let x = 0; x < off.width; x++) if (on(x, y)) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    const cols = Math.round((x1 - x0 + 1) / unit);
    const rows = Math.round((y1 - y0 + 1) / unit);
    const cells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (on(Math.round(x0 + (c + 0.5) * unit), Math.round(y0 + (r + 0.5) * unit))) cells.push([c, r]);
    }

    // fit the grid in the button and centre it
    step = Math.max(2, Math.floor(Math.min((W * 0.9) / cols, (H * 0.56) / rows)));
    const ox = Math.round((W - cols * step) / 2);
    const oy = Math.round((H - rows * step) / 2);
    bricks = cells.map(([c, r]) => {
      const x = ox + c * step, y = oy + r * step;
      return { hx: x, hy: y, x, y, vx: 0, vy: 0, r: 0, vr: 0 };
    });
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const s = step - 1;
    ctx.fillStyle = SHADOW;
    for (const b of bricks) ctx.fillRect(b.x + 1, b.y + 1.5, s, s);
    ctx.fillStyle = INK;
    for (const b of bricks) {
      if (Math.abs(b.r) < 0.02) { ctx.fillRect(b.x, b.y, s, s); continue; }
      ctx.save();
      ctx.translate(b.x + s / 2, b.y + s / 2);
      ctx.rotate(b.r);
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.restore();
    }
  }

  function tick() {
    raf = 0;
    const R = H * 0.9;
    let moving = false;
    for (const b of bricks) {
      if (mouse.in) {
        const dx = b.x - mouse.x, dy = b.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 2.2;
          b.vx += (dx / d) * f; b.vy += (dy / d) * f;
          b.vr += (dx > 0 ? 1 : -1) * f * 0.05;
        }
      }
      b.vx += (b.hx - b.x) * 0.08; b.vy += (b.hy - b.y) * 0.08; b.vr += -b.r * 0.08;
      b.vx *= 0.78; b.vy *= 0.78; b.vr *= 0.8;
      b.x += b.vx; b.y += b.vy; b.r += b.vr;
      if (Math.abs(b.vx) + Math.abs(b.vy) > 0.02 || Math.abs(b.x - b.hx) > 0.1 || Math.abs(b.y - b.hy) > 0.1) moving = true;
    }
    draw();
    if (moving || mouse.in) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf && !reduced) raf = requestAnimationFrame(tick); };

  link.addEventListener("pointermove", (e) => {
    const r = cv.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.in = true;
    kick();
  });
  link.addEventListener("pointerleave", () => { mouse.in = false; mouse.x = mouse.y = -999; kick(); });

  // a little scatter on click, before the page changes
  link.addEventListener("pointerdown", (e) => {
    if (reduced) return;
    const r = cv.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
    for (const b of bricks) {
      const dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy) || 1;
      b.vx += (dx / d) * 9 + (Math.random() - 0.5) * 3;
      b.vy += (dy / d) * 9 + (Math.random() - 0.5) * 3;
      b.vr += (Math.random() - 0.5) * 0.8;
    }
    kick();
  });

  (document.fonts ? document.fonts.load('400 20px "Silkscreen"').catch(() => {}) : Promise.resolve()).then(build);
  addEventListener("resize", build);
})();
