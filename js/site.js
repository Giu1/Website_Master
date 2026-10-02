/**
 * Stage, index, profile, newsletter and case sheet.
 * Content lives in data.js. Three.js is loaded from a CDN for the desktop
 * carousel; narrow screens and reduced-motion get a flat scroller instead.
 */
const F = window.FOLIO;
// hidden: true keeps a site in data.js but off the hub
F.projects = F.projects.filter((p) => !p.hidden);
const featured = F.projects.filter((p) => p.featured);

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

function openSite(slug) {
  const project = F.projects.find((p) => p.slug === slug);
  if (project && project.url) location.href = project.url;
}

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrow = () => matchMedia("(max-width: 860px)").matches;

let stageOn = false;
let stageApi = null;

function fillChrome() {
  document.title = F.name;
  $("brand").textContent = F.name;
  $("profile-copy").innerHTML = F.bio.map((p) => `<p>${esc(p)}</p>`).join("");
  $("awards").textContent = F.awards;
  $("news-copy").textContent = F.newsletter;
  $("socials").innerHTML = F.links
    .map((l) => {
      const label = esc(l.label);
      if (!l.href) return `<li><span>${label}</span></li>`;
      return `<li><a href="${esc(l.href)}" target="_blank" rel="noopener">${label}</a></li>`;
    })
    .concat(
      F.email
        ? [`<li><a href="mailto:${esc(F.email)}">Email</a></li>`]
        : []
    )
    .join("");

  $("a11y").innerHTML = `
    <h1>${esc(F.name)} — ${esc(F.role)}</h1>
    ${F.bio.map((p) => `<p>${esc(p)}</p>`).join("")}
    <p>${esc(F.awards)}</p>
    <h2>Featured work</h2>
    <ul>${featured.map((p) => `<li><a href="${esc(p.url)}">${esc(p.title)}</a> — ${esc(p.summary)}</li>`).join("")}</ul>
    <h2>Full index</h2>
    <ul>${F.projects.map((p) => `<li><a href="${esc(p.url)}">${esc(p.title)}</a></li>`).join("")}</ul>`;

  $("index-title").textContent = `Index — every project by ${F.name}`;
  $("index-list").innerHTML = F.projects
    .map((p, i) => {
      const href = p.url || `#p/${p.slug}`;
      const dot = i ? `<span class="dot" aria-hidden="true">●</span>` : "";
      return `${dot}<a href="${esc(href)}">${esc(p.title)}</a>`;
    })
    .join("");
}

function roundRect(ctx, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
}

function paint(media, title, width, label, blurb) {
  const w = width;
  const h = Math.max(1, Math.round(width * (media.h / media.w)));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const radius = Math.round(w * 0.02);
  ctx.clearRect(0, 0, w, h);
  roundRect(ctx, w, h, radius);
  ctx.save();
  ctx.clip();

  if (media._img) {
    const ir = media._img.width / media._img.height;
    const cr = w / h;
    let dw = w, dh = h, dx = 0, dy = 0;
    if (ir > cr) { dw = h * ir; dx = (w - dw) / 2; }
    else { dh = w / ir; dy = (h - dh) / 2; }
    ctx.drawImage(media._img, dx, dy, dw, dh);
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, media.colors[0]);
    g.addColorStop(1, media.colors[1] || media.colors[0]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const ink = media.ink || "#fff";
    ctx.fillStyle = ink;
    ctx.textBaseline = "middle";
    if (media.kind === "serif") {
      ctx.font = `520 ${Math.round(w * 0.16)}px Newsreader, serif`;
      ctx.textAlign = "center";
      ctx.fillText(media.word || title, w / 2, h * 0.48);
    } else if (media.kind === "stack") {
      ctx.font = `500 ${Math.round(w * 0.078)}px Inter, sans-serif`;
      ctx.textAlign = "left";
      const lines = String(media.word || title).split("\n");
      const lh = w * 0.09;
      const top = h * 0.42 - ((lines.length - 1) * lh) / 2;
      lines.forEach((line, i) => ctx.fillText(line, w * 0.08, top + i * lh));
    } else {
      ctx.font = `500 ${Math.round(w * 0.09)}px Inter, sans-serif`;
      ctx.textAlign = "left";
      const lines = String(media.word || title).split("\n");
      const lh = w * 0.1;
      const top = h * 0.46 - ((lines.length - 1) * lh) / 2;
      lines.forEach((line, i) => ctx.fillText(line, w * 0.07, top + i * lh));
    }
  }

  if (label && media._img) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, w, Math.round(h * 0.1));
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = `500 ${Math.round(w * 0.02)}px Inter, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(media.caption || title, w * 0.045, h * 0.05);
  }

  if (label) {
    const shade = ctx.createLinearGradient(0, h * 0.62, 0, h);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.62)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, h * 0.58, w, h * 0.42);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const titleSize = Math.round(Math.max(28, w * 0.052));
    ctx.font = `600 ${titleSize}px Inter, sans-serif`;
    const x = w * 0.045;
    ctx.fillText(title, x, h - w * 0.1);
    if (blurb) {
      ctx.globalAlpha = 0.82;
      ctx.font = `400 ${Math.round(Math.max(14, w * 0.02))}px Inter, sans-serif`;
      const maxW = w * 0.62;
      const words = String(blurb).split(/\s+/);
      const lines = [];
      let line = "";
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = word;
          if (lines.length === 2) break;
        } else line = test;
      }
      if (lines.length < 2 && line) lines.push(line);
      lines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, x, h - w * 0.055 + i * w * 0.028));
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
  return canvas;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function warmMedia() {
  const jobs = [];
  for (const p of F.projects) {
    for (const m of p.media || []) {
      if (!m.src) continue;
      jobs.push(
        loadImage(m.src).then((img) => { m._img = img; }).catch(() => {})
      );
    }
  }
  await Promise.all(jobs);
  try {
    await document.fonts.load("500 64px Inter");
    await document.fonts.load("520 80px Newsreader");
  } catch { /* posters fall back to a system face */ }
}

function posterURL(project, media, label) {
  const painted = paint(media, project.title, 1100, label, project.summary);
  const flat = document.createElement("canvas");
  flat.width = painted.width;
  flat.height = painted.height;
  const ctx = flat.getContext("2d");
  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(0, 0, flat.width, flat.height);
  ctx.drawImage(painted, 0, 0);
  return flat.toDataURL("image/jpeg", 0.86);
}

function mountFlat() {
  document.body.classList.add("is-flat");
  $("stage").classList.add("off");
  const flat = $("flat");
  flat.hidden = false;
  flat.innerHTML = featured
    .map((p) => {
      const m = p.media[0];
      const url = posterURL(p, m, true);
      const ratio = m.w / m.h;
      return `<button class="fcard" type="button" data-slug="${esc(p.slug)}" style="aspect-ratio:${ratio};background-image:url('${url}')" aria-label="${esc(p.title)}"></button>`;
    })
    .join("");
  flat.onclick = (e) => {
    const btn = e.target.closest("[data-slug]");
    if (btn) openSite(btn.dataset.slug);
  };
}

function showFeatured() {
  document.body.classList.remove("view-full", "case-open");
  $("index").hidden = true;
  $("case").hidden = true;
  $("nav-featured").setAttribute("aria-current", "true");
  $("nav-full").removeAttribute("aria-current");
  if (!document.body.classList.contains("is-flat") && stageOn) $("arrows").hidden = false;
  if (!location.hash || location.hash === "#featured") document.title = F.name;
}

function showFull() {
  document.body.classList.add("view-full");
  document.body.classList.remove("case-open");
  $("case").hidden = true;
  $("index").hidden = false;
  $("arrows").hidden = true;
  $("nav-full").setAttribute("aria-current", "true");
  $("nav-featured").removeAttribute("aria-current");
  document.title = "Index";
}

function showCase(slug) {
  const p = F.projects.find((x) => x.slug === slug);
  if (!p) {
    history.replaceState(null, "", "#featured");
    showFeatured();
    return;
  }
  const pool = p.featured ? featured : F.projects.filter((x) => !x.featured);
  const i = pool.findIndex((x) => x.slug === p.slug);
  const prev = pool[(i - 1 + pool.length) % pool.length];
  const next = pool[(i + 1) % pool.length];
  document.body.classList.add("case-open");
  document.body.classList.remove("view-full");
  $("index").hidden = true;
  $("arrows").hidden = true;
  $("case").hidden = false;
  $("case-title").textContent = p.title;
  $("case-summary").textContent = p.summary || "";
  const chips = [];
  if (p.url) {
    chips.push(`<a class="chip go" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="Visit site">
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 12 L12 4 M7 4 H12 V9" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
    </a>`);
  }
  if (p.client) chips.push(`<span class="chip">${esc(p.client)}</span>`);
  if (p.year) chips.push(`<span class="chip">${esc(p.year)}</span>`);
  if (p.awards) chips.push(`<span class="chip" title="${p.awards} award${p.awards > 1 ? "s" : ""}">Award${p.awards > 1 ? "s" : ""} ${p.awards}</span>`);
  $("case-meta").innerHTML = chips.join("");
  $("case-nav").innerHTML = `<a href="#p/${esc(prev.slug)}">${esc(prev.title)}</a> · <a href="#p/${esc(next.slug)}">${esc(next.title)}</a>`;
  $("case-media").innerHTML = (p.media || []).map((m) => {
    if (m.video) {
      return `<figure><video src="${esc(m.video)}" controls playsinline loop muted></video>${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ""}</figure>`;
    }
    const url = posterURL(p, m, false);
    return `<figure><img alt="${esc(m.caption || p.title)}" src="${url}">${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ""}</figure>`;
  }).join("");
  $("case").scrollTop = 0;
  $("case-x").focus();
  document.title = p.title;
}

function route() {
  const raw = (location.hash || "").replace(/^#/, "");
  if (raw === "full") showFull();
  else if (raw.startsWith("p/")) showCase(decodeURIComponent(raw.slice(2)));
  else showFeatured();
}

function setOverlay(which, open) {
  const profile = which === "profile";
  const el = $(profile ? "profile" : "news");
  const btn = $(profile ? "profile-btn" : "news-btn");
  const other = $(profile ? "news" : "profile");
  const otherBtn = $(profile ? "news-btn" : "profile-btn");
  if (open) {
    other.hidden = true;
    otherBtn.textContent = profile ? "Newsletter" : "Profile";
    otherBtn.setAttribute("aria-expanded", "false");
  }
  el.hidden = !open;
  btn.setAttribute("aria-expanded", open ? "true" : "false");
  btn.textContent = open ? "Close" : profile ? "Profile" : "Newsletter";
  const any = !$("profile").hidden || !$("news").hidden;
  document.body.classList.toggle("dim", any);
}

function bindChrome() {
  $("profile-btn").onclick = () => setOverlay("profile", $("profile").hidden);
  $("news-btn").onclick = () => setOverlay("news", $("news").hidden);
  $("case-x").onclick = () => { location.hash = "#featured"; };
  $("news-form").onsubmit = (e) => {
    e.preventDefault();
    const email = $("news-email").value.trim();
    if (!email) return;
    localStorage.setItem("folio-news", email);
    $("news-note").textContent = "Saved in this browser";
    $("news-form").reset();
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$("case").hidden) { location.hash = "#featured"; return; }
      if (!$("profile").hidden) setOverlay("profile", false);
      if (!$("news").hidden) setOverlay("news", false);
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (e.target.matches("input, textarea")) return;
    const dir = e.key === "ArrowRight" ? 1 : -1;
    if (!$("case").hidden) {
      const slug = decodeURIComponent((location.hash || "").replace(/^#p\//, ""));
      const cur = F.projects.find((p) => p.slug === slug);
      const pool = cur && cur.featured ? featured : F.projects.filter((p) => !p.featured);
      const i = pool.findIndex((p) => p.slug === slug);
      if (i < 0) return;
      const n = pool[(i + dir + pool.length) % pool.length];
      location.hash = `#p/${n.slug}`;
      return;
    }
    if (stageApi && !document.body.classList.contains("view-full")) stageApi.step(dir);
  });
  addEventListener("hashchange", route);
}

function bentPlane(THREE, width, height) {
  const geo = new THREE.PlaneGeometry(width, height, 28, 10);
  const pos = geo.attributes.position;
  const bend = width * 0.2;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const nx = x / (width * 0.5);
    pos.setZ(i, -nx * nx * bend);
  }
  geo.computeVertexNormals();
  return geo;
}

async function mountStage(THREE) {
  const canvas = $("stage");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 11, 28);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  camera.position.set(0, 0.22, 6.15);
  camera.lookAt(0, 0.02, -0.2);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 70, 1, 1),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {},
      vertexShader: `
        varying vec3 vP;
        void main() {
          vP = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vP;
        void main() {
          vec2 g = abs(fract(vP.xy * 1.35) - 0.5);
          float line = min(g.x, g.y);
          float a = 1.0 - smoothstep(0.006, 0.02, line);
          float fadeFar = smoothstep(22.0, 1.5, vP.y);
          float fadeSide = 1.0 - smoothstep(6.0, 18.0, abs(vP.x));
          gl_FragColor = vec4(vec3(0.55), a * fadeFar * fadeSide * 0.42);
        }
      `
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.55;
  scene.add(floor);

  const CARD_H = 2.2;
  const CARD_W = CARD_H * (16 / 9);
  const GAP = 0.2;
  const R = 7.8;
  const meshes = [];
  const widths = [];
  let hoverSlug = null;

  for (const project of featured) {
    const media = project.media[0];
    widths.push(CARD_W);
    const painted = paint(media, project.title, 1600, true, project.summary);
    const tex = new THREE.CanvasTexture(painted);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const mat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.45, fog: true });
    const mesh = new THREE.Mesh(bentPlane(THREE, CARD_W, CARD_H), mat);
    mesh.userData.slug = project.slug;
    mesh.userData.lift = 0;
    scene.add(mesh);
    meshes.push(mesh);
  }

  const angles = [];
  let acc = 0;
  for (let i = 0; i < widths.length; i++) {
    if (i) acc += (widths[i - 1] / 2 + widths[i] / 2 + GAP) / R;
    angles.push(acc);
  }

  let target = Math.min(1, featured.length - 1);
  let current = target;
  const center = new THREE.Vector3();

  function angleAt(index) {
    const max = featured.length - 1;
    const t = Math.max(0, Math.min(max, index));
    const i0 = Math.floor(t);
    const i1 = Math.min(max, i0 + 1);
    return angles[i0] + (angles[i1] - angles[i0]) * (t - i0);
  }

  function layout() {
    const focus = angleAt(current);
    meshes.forEach((mesh, i) => {
      const a = angles[i] - focus;
      const hovered = mesh.userData.slug === hoverSlug;
      mesh.userData.lift += ((hovered ? 1 : 0) - mesh.userData.lift) * 0.16;
      const lift = mesh.userData.lift;
      mesh.position.set(
        Math.sin(a) * R,
        0.08 + lift * 0.14,
        -(1 - Math.cos(a)) * R + lift * 0.42
      );
      mesh.rotation.y = -a * (1 - lift * 0.4);
      const s = 1 + lift * 0.07;
      mesh.scale.set(s, s, s);
      mesh.material.color.setScalar(hoverSlug ? (hovered ? 1 : 0.5) : 1);
    });
  }

  function placeArrows() {
    if (!stageOn || document.body.classList.contains("view-full") || document.body.classList.contains("case-open") || document.body.classList.contains("dim")) {
      $("arrows").hidden = true;
      return;
    }
    const i = Math.round(current);
    const mesh = meshes[i];
    if (!mesh) return;
    $("arrows").hidden = false;
    camera.updateMatrixWorld();
    const half = widths[i] / 2;
    const left = mesh.localToWorld(new THREE.Vector3(-half, 0, 0.02)).project(camera);
    const right = mesh.localToWorld(new THREE.Vector3(half, 0, 0.02)).project(camera);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    $("prev").style.left = `${(left.x * 0.5 + 0.5) * w}px`;
    $("prev").style.top = `${(-left.y * 0.5 + 0.5) * h}px`;
    $("next").style.left = `${(right.x * 0.5 + 0.5) * w}px`;
    $("next").style.top = `${(-right.y * 0.5 + 0.5) * h}px`;
    $("prev").style.visibility = i <= 0 ? "hidden" : "visible";
    $("next").style.visibility = i >= featured.length - 1 ? "hidden" : "visible";
  }

  function resize() {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let dragging = false;
  let moved = 0;
  let lastX = 0;

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    moved = 0;
    lastX = e.clientX;
    canvas.classList.add("dragging");
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      target -= dx * 0.0024;
      target = Math.max(0, Math.min(featured.length - 1, target));
      hoverSlug = null;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(meshes)[0];
    hoverSlug = hit ? hit.object.userData.slug : null;
    canvas.style.cursor = hoverSlug ? "pointer" : "grab";
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove("dragging");
    if (moved > 8) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(meshes)[0];
    if (hit) openSite(hit.object.userData.slug);
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", () => { dragging = false; canvas.classList.remove("dragging"); });
  function wheelUnits(e) {
    let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (e.deltaMode === 1) d *= 40;
    else if (e.deltaMode === 2) d *= innerHeight;
    return d;
  }
  window.addEventListener("wheel", (e) => {
    if (document.body.classList.contains("is-flat")) return;
    if (document.body.classList.contains("view-full") || document.body.classList.contains("case-open") || document.body.classList.contains("dim")) return;
    e.preventDefault();
    target += wheelUnits(e) / 480;
    target = Math.max(0, Math.min(featured.length - 1, target));
  }, { passive: false, capture: true });

  $("prev").onclick = () => stageApi.step(-1);
  $("next").onclick = () => stageApi.step(1);

  stageApi = {
    step(dir) {
      target = Math.max(0, Math.min(featured.length - 1, Math.round(current) + dir));
    }
  };

  addEventListener("resize", resize);
  resize();
  stageOn = true;

  renderer.setAnimationLoop(() => {
    current += (target - current) * (reduced ? 1 : 0.28);
    layout();
    placeArrows();
    renderer.render(scene, camera);
    center.set(0, 0, 0);
  });
}

async function boot() {
  if (!F || !F.projects) return;
  fillChrome();
  bindChrome();
  await warmMedia();
  route();
  const use3d = !reduced && !narrow();
  if (!use3d) {
    mountFlat();
    return;
  }
  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
    await mountStage(THREE);
    route();
  } catch (err) {
    console.warn("WebGL stage unavailable, using the flat scroller.", err);
    mountFlat();
  }
}

boot();
