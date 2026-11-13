// Figures for the KHTN material (circuit diagrams, ...), drawn in code.
// Usage: node scripts/figures.mjs [path/to/khtn8-9]
// writes standalone SVG files into <subject>/<topic>/hinh/ of the source material;
// the lesson Markdown references them as ![caption](hinh/<name>.svg).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------- vector helpers ----------
const P = (x, y) => ({ x, y });
const add = (a, b) => P(a.x + b.x, a.y + b.y);
const sub = (a, b) => P(a.x - b.x, a.y - b.y);
const mul = (a, k) => P(a.x * k, a.y * k);
const len = (a) => Math.hypot(a.x, a.y);
const unit = (a) => mul(a, 1 / len(a));
const perp = (a) => P(-a.y, a.x);
const lerp = (a, b, t) => add(a, mul(sub(b, a), t));

// ---------- circuit builder (world units, y up) ----------
function circuit(caption) {
  const items = [], ext = [];
  const keep = (...ps) => ext.push(...ps);
  const api = {
    wire(...ps) { items.push({ k: "poly", ps }); keep(...ps); return api; },
    // Two-terminal element between a and b: a wire runs to the body in the middle.
    _two(a, b, bodyLen, draw) {
      const u = unit(sub(b, a)), m = lerp(a, b, 0.5);
      const p1 = sub(m, mul(u, bodyLen / 2)), p2 = add(m, mul(u, bodyLen / 2));
      items.push({ k: "poly", ps: [a, p1] }, { k: "poly", ps: [p2, b] });
      keep(a, b);
      draw(m, u);
      return api;
    },
    _label(m, u, text, side = 1, d = 0.42) {
      const q = add(m, mul(perp(u), d * side));
      items.push({ k: "text", p: q, text, cls: "lbl" });
      keep(q);
    },
    res(a, b, label, side = 1) {
      return api._two(a, b, 0.9, (m, u) => {
        items.push({ k: "rect", c: m, w: 0.9, h: 0.3, ang: Math.atan2(u.y, u.x) });
        if (label) api._label(m, u, label, side);
      });
    },
    meter(a, b, letter) {
      return api._two(a, b, 0.6, (m) => {
        items.push({ k: "circle", c: m, r: 0.3 }, { k: "text", p: m, text: letter, cls: "meter" });
      });
    },
    lamp(a, b, label, side = 1) {
      return api._two(a, b, 0.6, (m, u) => {
        const r = 0.3, d = r * Math.SQRT1_2;
        items.push({ k: "circle", c: m, r }, { k: "poly", ps: [add(m, P(-d, -d)), add(m, P(d, d))] }, { k: "poly", ps: [add(m, P(-d, d)), add(m, P(d, -d))] });
        if (label) api._label(m, u, label, side, 0.55);
      });
    },
    // Source: long thin plate (+) on the side of a, short thick plate (-) towards b.
    src(a, b, label, side = 1) {
      return api._two(a, b, 0.22, (m, u) => {
        const n = perp(u);
        const pp = sub(m, mul(u, 0.11)), pm = add(m, mul(u, 0.11));
        items.push({ k: "poly", ps: [add(pp, mul(n, 0.38)), sub(pp, mul(n, 0.38))] });
        items.push({ k: "poly", ps: [add(pm, mul(n, 0.2)), sub(pm, mul(n, 0.2))], cls: "thick" });
        if (label) api._label(m, u, label, side, 0.65);
      });
    },
    box(c, w, h) { items.push({ k: "rect", c, w, h, ang: 0 }); keep(P(c.x - w / 2, c.y - h / 2), P(c.x + w / 2, c.y + h / 2)); return api; },
    arrow(a, b) { items.push({ k: "arrow", a, b }); keep(a, b); return api; },
    node(p, label, dir = 90) { items.push({ k: "dot", p }); if (label) api.tag(p, label, dir); keep(p); return api; },
    term(p, label, dir = 180) { items.push({ k: "term", p }); if (label) api.tag(p, label, dir); keep(p); return api; },
    tag(p, text, dir = 90, d = 0.38) {
      const r = (dir * Math.PI) / 180, q = add(p, P(d * Math.cos(r), d * Math.sin(r)));
      items.push({ k: "text", p: q, text, cls: "lbl" }); keep(q); return api;
    },
    text(p, text, cls = "note") { items.push({ k: "text", p, text, cls }); keep(p); return api; },
    svg() { return render(caption, items, ext); },
  };
  return api;
}

const r1 = (x) => Math.round(x * 10) / 10;
function render(caption, items, ext) {
  const xs = ext.map((p) => p.x), ys = ext.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = Math.min(330 / (maxX - minX || 1), 240 / (maxY - minY || 1), 60), pad = 18;
  const W = Math.round((maxX - minX) * s + 2 * pad), H = Math.round((maxY - minY) * s + 2 * pad);
  const X = (p) => r1((p.x - minX) * s + pad), Y = (p) => r1((maxY - p.y) * s + pad);
  const out = [], txt = [];
  for (const it of items) {
    if (it.k === "poly") out.push(`<polyline points="${it.ps.map((p) => `${X(p)},${Y(p)}`).join(" ")}"${it.cls ? ` class="${it.cls}"` : ""}/>`);
    else if (it.k === "rect") {
      const w = r1(it.w * s), h = r1(it.h * s), deg = r1((-it.ang * 180) / Math.PI);
      out.push(`<rect x="${r1(X(it.c) - w / 2)}" y="${r1(Y(it.c) - h / 2)}" width="${w}" height="${h}" transform="rotate(${deg} ${X(it.c)} ${Y(it.c)})" class="body"/>`);
    } else if (it.k === "circle") out.push(`<circle cx="${X(it.c)}" cy="${Y(it.c)}" r="${r1(it.r * s)}" class="body"/>`);
    else if (it.k === "arrow") {
      const u = unit(sub(it.b, it.a)), n = perp(u), h = 0.2;
      const l = sub(sub(it.b, mul(u, h)), mul(n, h * 0.55)), r = add(sub(it.b, mul(u, h)), mul(n, h * 0.55));
      out.push(`<polyline points="${X(it.a)},${Y(it.a)} ${X(it.b)},${Y(it.b)}"/><polygon points="${X(it.b)},${Y(it.b)} ${X(l)},${Y(l)} ${X(r)},${Y(r)}" class="head"/>`);
    } else if (it.k === "dot") txt.push(`<circle cx="${X(it.p)}" cy="${Y(it.p)}" r="3" class="dot"/>`);
    else if (it.k === "term") txt.push(`<circle cx="${X(it.p)}" cy="${Y(it.p)}" r="4" class="dot hollow"/>`);
    else if (it.k === "text") txt.push(`<text x="${X(it.p)}" y="${Y(it.p)}" class="${it.cls}">${it.text}</text>`);
  }
  return {
    caption,
    svg:
      `<svg class="geo circuit" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${caption}">` +
      `<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${out.join("")}</g>` +
      `<g fill="currentColor" font-family="'Times New Roman',serif" font-size="16" text-anchor="middle" dominant-baseline="central">${txt.join("")}</g></svg>`,
  };
}

// Subscript digits for labels such as R₁.
const sb = (s) => s.replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);

// ---------- Vật lí: Điện học ----------
function bridge(caption, middle) {
  const A = P(0, 0), C = P(2, 1.4), B = P(4, 0), D = P(2, -1.4), TA = P(-0.9, 0), TB = P(4.9, 0);
  const c = circuit(caption).wire(TA, A).wire(B, TB)
    .res(A, C, sb("R1"), 1).res(C, B, sb("R2"), 1).res(A, D, sb("R3"), -1).res(D, B, sb("R4"), -1);
  middle(c, C, D);
  return c.node(A, "A", 135).node(B, "B", 45).node(C, "C", 90).node(D, "D", -90)
    .term(TA, "+", 180).term(TB, "−", 0).svg();
}
const dienHoc = {
  "bai-4": () => {
    const TA = P(0, 0), M = P(2.6, 0), N = P(5.2, 0), TB = P(6.2, 0);
    return circuit("R₁ nối tiếp với cụm (R₂ song song R₃)")
      .res(TA, M, sb("R1")).wire(M, P(2.6, 0.9)).wire(M, P(2.6, -0.9)).wire(N, P(5.2, 0.9)).wire(N, P(5.2, -0.9))
      .res(P(2.6, 0.9), P(5.2, 0.9), sb("R2")).res(P(2.6, -0.9), P(5.2, -0.9), sb("R3"), -1).wire(N, TB)
      .node(M).node(N).term(TA, "A", 180).term(TB, "B", 0).svg();
  },
  "bai-9": () => bridge("Mạch cầu: R₅ nối C và D", (c, C, D) => c.res(C, D, sb("R5"), 1)),
  "bai-11": () => bridge("Ampe kế lý tưởng nối C và D", (c, C, D) => c.meter(C, D, "A")),
  "bai-12": () => {
    const T1 = P(0, 0), L = P(0.7, 0), M = P(3.1, 0), T2 = P(5.6, 0);
    return circuit("Vôn kế mắc song song với R₁")
      .wire(T1, L).res(L, M, sb("R1"), -1).res(M, T2, sb("R2"), -1)
      .wire(L, P(0.7, 1.1)).wire(M, P(3.1, 1.1)).meter(P(0.7, 1.1), P(3.1, 1.1), "V")
      .node(L).node(M).term(T1, "+", 180).term(T2, "−", 0).text(P(2.8, -1.05), "U = 12 V").svg();
  },
  "bai-14": () => {
    const M = P(0.4, 0), N = P(4.6, 0), xC = 0.4 + 0.25 + (12 / 18) * 3.7;
    return circuit("Đèn mắc giữa đầu M và con chạy C của biến trở")
      .wire(M, P(0.65, 0)).wire(P(4.35, 0), N)
      .wire(M, P(0.4, 1.7)).lamp(P(0.4, 1.7), P(xC, 1.7), "Đ", 1).wire(P(xC, 1.7), P(xC, 0.75))
      .arrow(P(xC, 0.75), P(xC, 0.2))
      .wire(M, P(0.4, -1.2)).src(P(0.4, -1.2), P(4.6, -1.2), "U", -1).wire(P(4.6, -1.2), N)
      .node(M, "M", 180).node(N, "N", 0).tag(P(xC, 0.75), "C", 0, 0.3)
      .box(P(2.5, 0), 3.7, 0.36).svg();
  },
  "bai-15": () => {
    const c = circuit("Mạch thang vô hạn, mọi điện trở bằng R");
    const h = 1.8, w = 1.7, cells = 3;
    for (let k = 0; k < cells; k++) {
      c.res(P(k * w, 0), P((k + 1) * w, 0), "R").res(P((k + 1) * w, 0), P((k + 1) * w, -h), "R", -1);
      c.node(P((k + 1) * w, 0)).node(P((k + 1) * w, -h));
    }
    c.wire(P(0, -h), P(cells * w + 0.5, -h)).wire(P(cells * w, 0), P(cells * w + 0.5, 0));
    return c.text(P(cells * w + 0.9, -h / 2), "…").term(P(0, 0), "A", 180).term(P(0, -h), "B", 180).svg();
  },
};

export const FIGURES = { "vat-li/05-dien-hoc": dienHoc };

// ---------- export as standalone files ----------
const STYLE =
  "<style>.body{fill:#fff}.thick{stroke-width:3.2}.head{fill:currentColor}.dot.hollow{fill:#fff;stroke:currentColor;stroke-width:1.5}" +
  ".lbl{font-style:italic}.meter{font-weight:bold;font-size:15px}.note{font-size:14px}</style>";
const standalone = (svg) =>
  svg.replace('<svg class="geo circuit"', '<svg xmlns="http://www.w3.org/2000/svg" class="geo circuit" style="color:#1a1a1a;background:#fff"')
    .replace(/(<svg[^>]*>)/, `$1${STYLE}<rect width="100%" height="100%" fill="#fff"/>`);

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const src = path.resolve(process.argv[2] || path.join(root, "../khtn8-9"));
  let n = 0;
  for (const [dir, figs] of Object.entries(FIGURES)) {
    fs.mkdirSync(path.join(src, dir, "hinh"), { recursive: true });
    for (const [name, make] of Object.entries(figs)) {
      fs.writeFileSync(path.join(src, dir, "hinh", `${name}.svg`), standalone(make().svg) + "\n");
      n++;
    }
  }
  console.log(`Đã ghi ${n} hình vào ${src}`);
}
