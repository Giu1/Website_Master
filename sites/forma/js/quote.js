(() => {
  const MAX_BYTES = 25 * 1024 * 1024;
  const BED = { x: 330, y: 320, z: 325 };

  const NICHE_SHAPE = {
    keychains: { fill: 0.62, wx: 0.9, dy: 0.18, assembly: 0 },
    figurines: { fill: 0.2, wx: 0.42, dy: 0.38, assembly: 0.45 },
    miniatures: { fill: 0.32, wx: 0.55, dy: 0.5, assembly: 0.1 },
    decor: { fill: 0.42, wx: 0.85, dy: 0.8, assembly: 0.05 },
    props: { fill: 0.16, wx: 0.88, dy: 0.72, assembly: 0.35 }
  };

  const DETAIL = {
    simple: { infillBoost: 0, time: 0.9, assembly: 0.6, spread: 0.18 },
    normal: { infillBoost: 0.03, time: 1, assembly: 1, spread: 0.22 },
    complex: { infillBoost: 0.06, time: 1.25, assembly: 1.55, spread: 0.28 }
  };

  let lastQuote = null;
  let photoUrl = "";

  function cfg() {
    const q = (window.FORMA_CONFIG && window.FORMA_CONFIG.quote) || {};
    return {
      currency: q.currency || "EUR",
      minPrice: q.minPrice ?? 8,
      markup: q.markup ?? 2.15,
      setupFee: q.setupFee ?? 3.5,
      hourlyMachine: q.hourlyMachine ?? 4.5,
      laborHour: q.laborHour ?? 12,
      waste: q.waste ?? 0.12,
      cm3PerHour: q.cm3PerHour ?? 18,
      bed: q.bed || BED,
      materials: q.materials || {
        pla: { density: 1.24, pricePerKg: 22 },
        petg: { density: 1.27, pricePerKg: 28 }
      }
    };
  }

  function t(key) {
    const i18n = window.FORMA_I18N || {};
    const lang = document.documentElement.lang || "pt-PT";
    const pick = (code) =>
      key.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), i18n[code]);
    return pick(lang) ?? pick("en") ?? key;
  }

  function money(n) {
    const cur = cfg().currency;
    try {
      return new Intl.NumberFormat(document.documentElement.lang || "pt-PT", {
        style: "currency",
        currency: cur,
        maximumFractionDigits: 0
      }).format(n);
    } catch {
      return `${Math.round(n)}€`;
    }
  }

  function signedVolume(p1, p2, p3) {
    return (
      p1[0] * (p2[1] * p3[2] - p2[2] * p3[1]) +
      p1[1] * (p2[2] * p3[0] - p2[0] * p3[2]) +
      p1[2] * (p2[0] * p3[1] - p2[1] * p3[0])
    ) / 6;
  }

  function isBinaryStl(buffer) {
    if (buffer.byteLength < 84) return false;
    const count = new DataView(buffer).getUint32(80, true);
    return count > 0 && 84 + count * 50 === buffer.byteLength;
  }

  function parseBinaryStl(buffer) {
    const view = new DataView(buffer);
    const count = view.getUint32(80, true);
    let volume = 0;
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    let offset = 84;
    for (let i = 0; i < count; i++) {
      const tri = [];
      for (let v = 0; v < 3; v++) {
        const base = offset + 12 + v * 12;
        const p = [view.getFloat32(base, true), view.getFloat32(base + 4, true), view.getFloat32(base + 8, true)];
        tri.push(p);
        for (let a = 0; a < 3; a++) {
          min[a] = Math.min(min[a], p[a]);
          max[a] = Math.max(max[a], p[a]);
        }
      }
      volume += signedVolume(tri[0], tri[1], tri[2]);
      offset += 50;
    }
    return { volumeMm3: Math.abs(volume), min, max, triangles: count };
  }

  function parseAsciiStl(text) {
    const verts = [];
    const re = /vertex\s+([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s+([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s+([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)/g;
    let m;
    while ((m = re.exec(text))) {
      verts.push([Number(m[1]), Number(m[2]), Number(m[3])]);
    }
    if (verts.length < 3 || verts.length % 3 !== 0) {
      throw new Error("ascii");
    }
    let volume = 0;
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < verts.length; i += 3) {
      const a = verts[i];
      const b = verts[i + 1];
      const c = verts[i + 2];
      volume += signedVolume(a, b, c);
      for (const p of [a, b, c]) {
        for (let k = 0; k < 3; k++) {
          min[k] = Math.min(min[k], p[k]);
          max[k] = Math.max(max[k], p[k]);
        }
      }
    }
    return { volumeMm3: Math.abs(volume), min, max, triangles: verts.length / 3 };
  }

  async function parseStl(file) {
    const buffer = await file.arrayBuffer();
    if (isBinaryStl(buffer)) return parseBinaryStl(buffer);
    const text = new TextDecoder().decode(buffer);
    if (/facet\s+normal/i.test(text)) return parseAsciiStl(text);
    throw new Error("format");
  }

  function dimsFromMinMax(min, max) {
    return [max[0] - min[0], max[1] - min[1], max[2] - min[2]].map((n) => Math.abs(n));
  }

  function fitsBed(dims, bed) {
    const a = [...dims].sort((x, y) => y - x);
    const b = [bed.x, bed.y, bed.z].sort((x, y) => y - x);
    return a[0] <= b[0] + 0.5 && a[1] <= b[1] + 0.5 && a[2] <= b[2] + 0.5;
  }

  function estimateCost({ volumeMm3, dims, infill, material, assemblyHours }) {
    const c = cfg();
    const mat = c.materials[material] || c.materials.pla;
    const volumeCm3 = volumeMm3 / 1000;
    const size = Math.max(...dims, 1);
    const shell = Math.min(0.28, 6 / size + 0.08);
    const printedCm3 = volumeCm3 * (infill + (1 - infill) * shell);
    const grams = printedCm3 * mat.density * (1 + c.waste);
    const hours = Math.max(0.12, (printedCm3 / c.cm3PerHour) * (0.85 + (1 - infill)));
    const materialCost = (grams / 1000) * mat.pricePerKg;
    const machineCost = hours * c.hourlyMachine;
    const laborCost = hours * 0.2 * c.laborHour + assemblyHours * c.laborHour;
    const raw = materialCost + machineCost + laborCost + c.setupFee;
    const price = Math.max(c.minPrice, raw * c.markup);
    return {
      grams,
      hours,
      volumeCm3,
      printedCm3,
      price,
      materialCost,
      machineCost
    };
  }

  function photoVolume(niche, heightMm, detail) {
    const shape = NICHE_SHAPE[niche] || NICHE_SHAPE.decor;
    const w = heightMm * shape.wx;
    const d = heightMm * shape.dy;
    const bbox = heightMm * w * d;
    const fill = shape.fill * (detail === "complex" ? 1.15 : detail === "simple" ? 0.88 : 1);
    return {
      volumeMm3: bbox * fill,
      dims: [w, d, heightMm],
      assembly: shape.assembly
    };
  }

  function summarize(result) {
    const fit = result.fits ? t("quote.fitOk") : t("quote.fitNo");
    return [
      result.source === "stl" ? "STL" : "photo",
      `${money(result.low)}–${money(result.high)}`,
      `${result.dims.map((n) => Math.round(n)).join("×")} mm`,
      `${result.grams.toFixed(1)} g`,
      `${result.hours.toFixed(1)} h`,
      fit,
      result.fileName || ""
    ].join(" | ");
  }

  function renderResult(result) {
    const box = document.getElementById("quote-result");
    if (!box) return;
    box.hidden = false;
    const fitClass = result.fits ? "ok" : "warn";
    const photo = result.preview
      ? `<img class="quote-preview" alt="" src="${result.preview}" />`
      : "";
    box.innerHTML = `
      ${photo}
      <p class="machine-code">${t("quote.resultTitle")}</p>
      <p class="quote-price">${t("quote.priceFrom")} <strong>${money(result.low)}</strong> ${t("quote.priceTo")} <strong>${money(result.high)}</strong></p>
      <ul class="quote-facts">
        <li>${t("quote.size")}: ${result.dims.map((n) => `${Math.round(n)} mm`).join(" × ")}</li>
        <li>${t("quote.volume")}: ${result.volumeCm3.toFixed(1)} cm³</li>
        <li>${t("quote.grams")}: ~${result.grams.toFixed(0)} g</li>
        <li>${t("quote.time")}: ~${result.hours.toFixed(1)} ${t("quote.hours")}</li>
        <li class="${fitClass}">${result.fits ? t("quote.fitOk") : t("quote.fitNo")}</li>
      </ul>
      <p class="muted">${t("quote.notQuote")}</p>
      <button class="btn btn-grad btn-block" type="button" id="quote-to-list">${t("quote.send")}</button>
    `;
    document.getElementById("quote-to-list").addEventListener("click", () => {
      const field = document.getElementById("quote-summary");
      if (field) field.value = summarize(result);
      document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth" });
      document.getElementById("email")?.focus();
    });
  }

  function showQuoteError(message) {
    const box = document.getElementById("quote-result");
    if (!box) return;
    box.hidden = false;
    box.innerHTML = `<p class="form-status err">${message}</p>`;
  }

  function currentInfill() {
    return Number(document.getElementById("quote-infill")?.value || 0.15);
  }

  function currentMaterial() {
    return document.getElementById("quote-material")?.value || "pla";
  }

  function currentNiche() {
    return document.getElementById("quote-niche")?.value || "figurines";
  }

  function currentDetail() {
    return document.getElementById("quote-detail")?.value || "normal";
  }

  function fromMesh(mesh, extra) {
    const detail = DETAIL[currentDetail()];
    const infill = Math.min(0.6, currentInfill() + detail.infillBoost);
    const dims = extra.dims || dimsFromMinMax(mesh.min, mesh.max);
    const cost = estimateCost({
      volumeMm3: mesh.volumeMm3,
      dims,
      infill,
      material: currentMaterial(),
      assemblyHours: extra.assembly * detail.assembly
    });
    const spread = detail.spread;
    const quote = {
      source: extra.source,
      fileName: extra.fileName || "",
      preview: extra.preview || "",
      dims,
      volumeCm3: cost.volumeCm3,
      grams: cost.grams,
      hours: cost.hours * detail.time,
      fits: extra.fits ?? fitsBed(dims, cfg().bed),
      low: Math.max(cfg().minPrice, cost.price * (1 - spread)),
      high: cost.price * (1 + spread)
    };
    lastQuote = quote;
    const field = document.getElementById("quote-summary");
    if (field) field.value = summarize(quote);
    renderResult(quote);
  }

  async function onStl(file) {
    if (!file) return showQuoteError(t("quote.noFile"));
    if (file.size > MAX_BYTES) return showQuoteError(t("quote.tooBig"));
    try {
      const mesh = await parseStl(file);
      fromMesh(mesh, { source: "stl", fileName: file.name, assembly: 0.15, fits: fitsBed(dimsFromMinMax(mesh.min, mesh.max), cfg().bed) });
    } catch {
      showQuoteError(t("quote.fileError"));
    }
  }

  function onPhoto() {
    const heightCm = Number(document.getElementById("quote-height")?.value || 0);
    if (!heightCm) return showQuoteError(t("quote.photoNeedHeight"));
    const niche = currentNiche();
    const detail = currentDetail();
    const heightMm = heightCm * 10;
    const approx = photoVolume(niche, heightMm, detail);
    fromMesh(
      { volumeMm3: approx.volumeMm3, min: [0, 0, 0], max: approx.dims },
      {
        source: "photo",
        dims: approx.dims,
        assembly: approx.assembly,
        preview: photoUrl,
        fits: fitsBed(approx.dims, cfg().bed)
      }
    );
  }

  function setTab(id) {
    document.querySelectorAll("[data-quote-tab]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.quoteTab === id));
    });
    document.querySelectorAll("[data-quote-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.quotePanel !== id;
    });
  }

  function bindDrop(zone, input, onFile) {
    if (!zone || !input) return;
    zone.addEventListener("click", () => input.click());
    zone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        input.click();
      }
    });
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("is-over");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("is-over");
      const file = event.dataTransfer.files[0];
      if (file) {
        input.files = event.dataTransfer.files;
        onFile(file);
      }
    });
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (file) onFile(file);
    });
  }

  function fillNiches() {
    const select = document.getElementById("quote-niche");
    if (!select) return;
    const current = select.value;
    const niches = window.FORMA_NICHES || [];
    select.innerHTML = niches
      .map((n) => `<option value="${n.id}">${t(`cats.${n.id}.title`)}</option>`)
      .join("");
    const next = [...select.options].some((o) => o.value === current) ? current : "figurines";
    if ([...select.options].some((o) => o.value === next)) select.value = next;
  }

  function init() {
    fillNiches();
    setTab("photo");
    document.querySelectorAll("[data-quote-tab]").forEach((btn) => {
      btn.addEventListener("click", () => setTab(btn.dataset.quoteTab));
    });
    bindDrop(document.getElementById("quote-drop-stl"), document.getElementById("quote-stl"), onStl);
    bindDrop(document.getElementById("quote-drop-photo"), document.getElementById("quote-photo"), (file) => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      photoUrl = URL.createObjectURL(file);
      onPhoto();
    });
    ["quote-height", "quote-material", "quote-infill", "quote-detail", "quote-niche"].forEach((id) => {
      document.getElementById(id)?.addEventListener("input", () => {
        const tab = document.querySelector('[data-quote-tab][aria-pressed="true"]')?.dataset.quoteTab;
        if (tab === "stl") {
          const file = document.getElementById("quote-stl")?.files?.[0];
          if (file) onStl(file);
        } else {
          onPhoto();
        }
      });
    });
    document.getElementById("quote-height")?.addEventListener("input", () => {
      const out = document.getElementById("quote-height-val");
      if (out) out.textContent = `${document.getElementById("quote-height").value} cm`;
    });
    const infillOut = document.getElementById("quote-infill-val");
    const infillIn = document.getElementById("quote-infill");
    if (infillOut && infillIn) infillOut.textContent = `${Math.round(Number(infillIn.value) * 100)}%`;
    infillIn?.addEventListener("input", () => {
      if (infillOut) infillOut.textContent = `${Math.round(Number(infillIn.value) * 100)}%`;
    });
    onPhoto();
  }

  function refresh() {
    fillNiches();
    if (lastQuote) renderResult(lastQuote);
  }

  window.FORMA_QUOTE = {
    init,
    refresh,
    getSummary: () => (lastQuote ? summarize(lastQuote) : "")
  };
})();
