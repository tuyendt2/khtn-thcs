// Small drawing library for the KHTN figures: world coordinates (y up) are fitted
// into an SVG. Covers circuit symbols, graphs, rays, vessels, block diagrams, ...
// Colors come from CSS classes so the same SVG works in the app (light/dark) and
// as a standalone file (STYLE below).

export const P = (x, y) => ({ x, y });
export const add = (a, b) => P(a.x + b.x, a.y + b.y);
export const sub = (a, b) => P(a.x - b.x, a.y - b.y);
export const mul = (a, k) => P(a.x * k, a.y * k);
export const len = (a) => Math.hypot(a.x, a.y);
export const dist = (a, b) => len(sub(a, b));
export const unit = (a) => mul(a, 1 / len(a));
export const perp = (a) => P(-a.y, a.x);
export const lerp = (a, b, t) => add(a, mul(sub(b, a), t));
export const rad = (d) => (d * Math.PI) / 180;
export const polar = (c, r, deg) => add(c, P(r * Math.cos(rad(deg)), r * Math.sin(rad(deg))));
export const lineInter = (a, b, c, d) => {
  const r = sub(b, a), s = sub(d, c), cr = r.x * s.y - r.y * s.x;
  const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / cr;
  return add(a, mul(r, t));
};
// Subscript digits: R1 -> R₁
export const sb = (s) => s.replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Text markup: x_{i} and x^{2} become sub/superscripts.
const markup = (s) =>
  esc(s).replace(/([_^])\{([^}]*)\}/g, (_, k, v) => `<tspan baseline-shift="${k === "_" ? "sub" : "super"}" font-size="72%">${v}</tspan>`);

export function fig(caption, opts = {}) {
  const items = [], ext = [];
  const keep = (...ps) => ext.push(...ps);
  const api = {
    // ----- basic shapes -----
    line(a, b, cls = "") { items.push({ k: "poly", ps: [a, b], cls }); keep(a, b); return api; },
    path(ps, cls = "", closed = false) { items.push({ k: closed ? "polygon" : "poly", ps, cls }); keep(...ps); return api; },
    poly(ps, cls = "") { return api.path(ps, cls, true); },
    rect(x0, y0, x1, y1, cls = "") { return api.poly([P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)], cls); },
    circle(c, r, cls = "") { items.push({ k: "circle", c, r, cls }); keep(P(c.x - r, c.y - r), P(c.x + r, c.y + r)); return api; },
    ellipse(c, rx, ry, cls = "", rot = 0) { items.push({ k: "ellipse", c, rx, ry, cls, rot }); keep(P(c.x - rx, c.y - ry), P(c.x + rx, c.y + ry)); return api; },
    arc(c, r, a0, a1, cls = "") {
      const ps = [];
      for (let i = 0; i <= 40; i++) ps.push(polar(c, r, a0 + ((a1 - a0) * i) / 40));
      return api.path(ps, cls);
    },
    curve(f, x0, x1, cls = "", n = 80) {
      const ps = [];
      for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n; ps.push(P(x, f(x))); }
      return api.path(ps, cls);
    },
    arrow(a, b, cls = "", size = 0.22) { items.push({ k: "poly", ps: [a, b], cls }, { k: "head", at: b, dir: unit(sub(b, a)), size, cls }); keep(a, b); return api; },
    // Line with an arrow head in the middle (light rays, flows).
    flow(a, b, cls = "ray", size = 0.2) {
      items.push({ k: "poly", ps: [a, b], cls }, { k: "head", at: lerp(a, b, 0.55), dir: unit(sub(b, a)), size, cls });
      keep(a, b); return api;
    },
    dim(a, b, label, off = 0.4, side = 1) {
      const n = mul(perp(unit(sub(b, a))), off * side), a2 = add(a, n), b2 = add(b, n);
      api.line(a, a2, "thin aux").line(b, b2, "thin aux");
      items.push({ k: "poly", ps: [a2, b2], cls: "thin" }, { k: "head", at: b2, dir: unit(sub(b2, a2)), size: 0.16, cls: "" }, { k: "head", at: a2, dir: unit(sub(a2, b2)), size: 0.16, cls: "" });
      if (label) api.text(add(lerp(a2, b2, 0.5), mul(perp(unit(sub(b, a))), 0.28 * side)), label);
      return api;
    },
    angle(at, p1, p2, r = 0.5, label = "", cls = "thin") {
      const a1 = Math.atan2(p1.y - at.y, p1.x - at.x) * 180 / Math.PI;
      let a2 = Math.atan2(p2.y - at.y, p2.x - at.x) * 180 / Math.PI;
      while (a2 < a1) a2 += 360;
      if (a2 - a1 > 180) { const t = a2 - 360; api.arc(at, r, t, a1, cls); if (label) api.text(polar(at, r + 0.32, (t + a1) / 2), label, "lbl small"); }
      else { api.arc(at, r, a1, a2, cls); if (label) api.text(polar(at, r + 0.32, (a1 + a2) / 2), label, "lbl small"); }
      return api;
    },
    text(p, s, cls = "lbl") { items.push({ k: "text", p, s, cls }); keep(p); return api; },
    dot(p, label, dir = 90, d = 0.36) { items.push({ k: "dot", p }); keep(p); if (label) api.text(polar(p, d, dir), label); return api; },
    // Axes from origin o with lengths w, h; labels at the arrow tips.
    axes(o, w, h, xl = "", yl = "", origin = "O") {
      api.arrow(o, add(o, P(w, 0)), "", 0.18).arrow(o, add(o, P(0, h)), "", 0.18);
      keep(add(o, P(w + 0.25 + 0.09 * String(xl).length, 0)));
      if (xl) api.text(add(o, P(w, -0.35)), xl, "lbl");
      if (yl) api.text(add(o, P(-0.15, h + 0.3)), yl, "lbl");
      if (origin) api.text(add(o, P(-0.25, -0.25)), origin, "lbl");
      return api;
    },
    tick(p, label, axis = "x") {
      api.line(axis === "x" ? add(p, P(0, -0.08)) : add(p, P(-0.08, 0)), axis === "x" ? add(p, P(0, 0.08)) : add(p, P(0.08, 0)), "thin");
      return api.text(axis === "x" ? add(p, P(0, -0.3)) : add(p, P(-0.35, 0)), label, "note");
    },
    // Labelled box for block diagrams.
    box(c, w, h, label = "", cls = "body", tcls = "note") {
      api.rect(c.x - w / 2, c.y - h / 2, c.x + w / 2, c.y + h / 2, cls);
      if (label) String(label).split("\n").forEach((ln, i, arr) => api.text(add(c, P(0, ((arr.length - 1) / 2 - i) * 0.34)), ln, tcls));
      return api;
    },

    // ----- circuit symbols -----
    wire(...ps) { return api.path(ps); },
    _two(a, b, bodyLen, draw) {
      const u = unit(sub(b, a)), m = lerp(a, b, 0.5);
      items.push({ k: "poly", ps: [a, sub(m, mul(u, bodyLen / 2))], cls: "" }, { k: "poly", ps: [add(m, mul(u, bodyLen / 2)), b], cls: "" });
      keep(a, b); draw(m, u); return api;
    },
    _label(m, u, s, side = 1, d = 0.42) { api.text(add(m, mul(perp(u), d * side)), s); },
    res(a, b, label, side = 1) {
      return api._two(a, b, 0.9, (m, u) => {
        const n = perp(u), w = mul(u, 0.45), h = mul(n, 0.15);
        items.push({ k: "polygon", ps: [sub(sub(m, w), h), add(sub(m, w), h), add(add(m, w), h), sub(add(m, w), h)], cls: "body" });
        if (label) api._label(m, u, label, side);
      });
    },
    meter(a, b, letter) {
      return api._two(a, b, 0.6, (m) => { items.push({ k: "circle", c: m, r: 0.3, cls: "body" }); api.text(m, letter, "meter"); });
    },
    lamp(a, b, label, side = 1) {
      return api._two(a, b, 0.6, (m, u) => {
        const r = 0.3, d = r * Math.SQRT1_2;
        items.push({ k: "circle", c: m, r, cls: "body" }, { k: "poly", ps: [add(m, P(-d, -d)), add(m, P(d, d))], cls: "" }, { k: "poly", ps: [add(m, P(-d, d)), add(m, P(d, -d))], cls: "" });
        if (label) api._label(m, u, label, side, 0.55);
      });
    },
    src(a, b, label, side = 1) {
      return api._two(a, b, 0.22, (m, u) => {
        const n = perp(u), pp = sub(m, mul(u, 0.11)), pm = add(m, mul(u, 0.11));
        items.push({ k: "poly", ps: [add(pp, mul(n, 0.38)), sub(pp, mul(n, 0.38))], cls: "" }, { k: "poly", ps: [add(pm, mul(n, 0.2)), sub(pm, mul(n, 0.2))], cls: "thick" });
        if (label) api._label(m, u, label, side, 0.65);
      });
    },
    node(p, label, dir = 90) { items.push({ k: "dot", p }); keep(p); if (label) api.tag(p, label, dir); return api; },
    term(p, label, dir = 180) { items.push({ k: "term", p }); keep(p); if (label) api.tag(p, label, dir); return api; },
    tag(p, s, dir = 90, d = 0.38) { return api.text(polar(p, d, dir), s); },

    svg() { return render(caption, items, ext, opts); },
  };
  return api;
}

const r1 = (x) => Math.round(x * 10) / 10;
function render(caption, items, ext, opts) {
  // Fit the drawing, then widen the box so that text labels (fixed pixel size) fit too.
  const texts = items.filter((it) => it.k === "text");
  const px = (it) => (/big/.test(it.cls) ? 9.5 : /small|note/.test(it.cls) ? 6.6 : 8) * String(it.s).replace(/[_^]\{([^}]*)\}/g, "$1").length / 2;
  let minX, maxX, minY, maxY, s;
  const fit = (extra) => {
    const all = [...ext, ...extra];
    const xs = all.map((p) => p.x), ys = all.map((p) => p.y);
    minX = Math.min(...xs) - (opts.padX || 0); maxX = Math.max(...xs) + (opts.padX || 0);
    minY = Math.min(...ys); maxY = Math.max(...ys);
    s = Math.min((opts.maxW || 330) / (maxX - minX || 1), (opts.maxH || 240) / (maxY - minY || 1), opts.maxScale || 60);
  };
  fit([]);
  for (let k = 0; k < 3; k++) fit(texts.flatMap((it) => [P(it.p.x - px(it) / s, it.p.y), P(it.p.x + px(it) / s, it.p.y)]));
  const pad = 20;
  const W = Math.round((maxX - minX) * s + 2 * pad), H = Math.round((maxY - minY) * s + 2 * pad);
  const X = (p) => r1((p.x - minX) * s + pad), Y = (p) => r1((maxY - p.y) * s + pad);
  const c = (cls) => (cls ? ` class="${cls}"` : "");
  const shapes = [], top = [];
  for (const it of items) {
    if (it.k === "poly") shapes.push(`<polyline points="${it.ps.map((p) => `${X(p)},${Y(p)}`).join(" ")}"${c(it.cls)}/>`);
    else if (it.k === "polygon") shapes.push(`<polygon points="${it.ps.map((p) => `${X(p)},${Y(p)}`).join(" ")}"${c(it.cls)}/>`);
    else if (it.k === "circle") shapes.push(`<circle cx="${X(it.c)}" cy="${Y(it.c)}" r="${r1(it.r * s)}"${c(it.cls)}/>`);
    else if (it.k === "ellipse") shapes.push(`<ellipse cx="${X(it.c)}" cy="${Y(it.c)}" rx="${r1(it.rx * s)}" ry="${r1(it.ry * s)}"${it.rot ? ` transform="rotate(${-it.rot} ${X(it.c)} ${Y(it.c)})"` : ""}${c(it.cls)}/>`);
    else if (it.k === "head") {
      const n = perp(it.dir), b = sub(it.at, mul(it.dir, it.size));
      const l = add(b, mul(n, it.size * 0.5)), r = sub(b, mul(n, it.size * 0.5));
      shapes.push(`<polygon points="${X(it.at)},${Y(it.at)} ${X(l)},${Y(l)} ${X(r)},${Y(r)}" class="head ${it.cls}"/>`);
    } else if (it.k === "dot") top.push(`<circle cx="${X(it.p)}" cy="${Y(it.p)}" r="3" class="dot"/>`);
    else if (it.k === "term") top.push(`<circle cx="${X(it.p)}" cy="${Y(it.p)}" r="4" class="dot hollow"/>`);
    else if (it.k === "text") top.push(`<text x="${X(it.p)}" y="${Y(it.p)}" class="${it.cls}">${markup(it.s)}</text>`);
  }
  return {
    caption,
    svg:
      `<svg class="geo" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(caption)}">` +
      `<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${shapes.join("")}</g>` +
      `<g fill="currentColor" font-family="'Times New Roman',serif" font-size="16" text-anchor="middle" dominant-baseline="central">${top.join("")}</g></svg>`,
  };
}

// Styles for standalone SVG files (the app has the same rules in style.css, with theme colors).
export const STYLE =
  "<style>.body{fill:#fff}.thin{stroke-width:1.1}.thick{stroke-width:3.2}.aux{stroke-dasharray:5 4}.hi{stroke:#0f6b5c;stroke-width:2.4}" +
  ".ray{stroke:#e53935;stroke-width:1.8}.head{fill:#1a1a1a;stroke:none}.head.ray{fill:#e53935}.head.hi{fill:#0f6b5c}" +
  ".fillA{fill:rgba(30,136,229,.18)}.fillB{fill:rgba(229,57,53,.16)}.fillC{fill:rgba(67,160,71,.2)}.fillG{fill:rgba(128,128,128,.22)}" +
  ".fillY{fill:rgba(255,193,7,.32)}.water{fill:rgba(30,136,229,.2);stroke:none}.oil{fill:rgba(255,193,7,.35);stroke:none}" +
  ".dot.hollow{fill:#fff;stroke:#1a1a1a;stroke-width:1.5}.affected{fill:#444}.lbl{font-style:italic}.small{font-size:13px}.note{font-size:13.5px}" +
  ".b{font-weight:bold}.meter{font-weight:bold;font-size:15px}.big{font-size:19px;font-weight:bold}</style>";
export const standalone = (svg) =>
  svg.replace('<svg class="geo"', '<svg xmlns="http://www.w3.org/2000/svg" class="geo" style="color:#1a1a1a;background:#fff"')
    .replace(/(<svg[^>]*>)/, `$1${STYLE}<rect width="100%" height="100%" fill="#fff"/>`);
