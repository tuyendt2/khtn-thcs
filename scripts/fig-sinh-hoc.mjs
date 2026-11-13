// Figures for the biology topics. Each entry: name -> () => { caption, svg }.
import { fig, P, add, polar, lerp } from "./figlib.mjs";

// ---------- helpers ----------
const arrowBetween = (g, a, b, cls = "hi", gap = 0.45) => {
  const d = Math.hypot(b.x - a.x, b.y - a.y), u = P((b.x - a.x) / d, (b.y - a.y) / d);
  return g.arrow(add(a, P(u.x * gap, u.y * gap)), add(b, P(-u.x * gap, -u.y * gap)), cls, 0.16);
};
// Pedigree symbols: square = male, circle = female, filled = affected.
function person(g, p, sex, aff, label) {
  const cls = aff ? "fillG person-aff" : "body";
  if (sex === "m") g.rect(p.x - 0.3, p.y - 0.3, p.x + 0.3, p.y + 0.3, aff ? "affected" : "body");
  else g.circle(p, 0.32, aff ? "affected" : "body");
  if (label) g.text(add(p, P(0, -0.6)), label, "small");
  return cls;
}
function couple(g, a, b, kids, yKids) {
  g.line(P(a.x + 0.32, a.y), P(b.x - 0.32, b.y));
  const mx = (a.x + b.x) / 2, xs = kids.map((k) => k.x);
  g.line(P(mx, a.y), P(mx, (a.y + yKids) / 2)).line(P(Math.min(...xs), (a.y + yKids) / 2), P(Math.max(...xs), (a.y + yKids) / 2));
  for (const k of kids) g.line(P(k.x, (a.y + yKids) / 2), P(k.x, yKids + 0.32));
}
// Chromosome drawn as an X (duplicated) or a bar (single).
const chromX = (g, c, len, cls) => g.line(add(c, P(-len * 0.3, len / 2)), add(c, P(len * 0.3, -len / 2)), cls).line(add(c, P(len * 0.3, len / 2)), add(c, P(-len * 0.3, -len / 2)), cls);
const chromI = (g, c, len, cls) => g.line(add(c, P(0, len / 2)), add(c, P(0, -len / 2)), cls);

// ---------- 1. Cơ thể người ----------
const coThe = {
  "kt-tuan-hoan": () => {
    const g = fig("Hai vòng tuần hoàn. Nét đỏ: máu giàu O₂; nét đứt: máu giàu CO₂");
    g.box(P(2, 4.2), 3.0, 0.7, "Mao mạch phổi", "fillA", "small");
    g.box(P(1.4, 2.4), 1.2, 0.8, "Nhĩ P").box(P(2.6, 2.4), 1.2, 0.8, "Nhĩ T").box(P(1.4, 1.5), 1.2, 0.9, "Thất P").box(P(2.6, 1.5), 1.2, 0.9, "Thất T");
    g.box(P(2, -0.6), 3.0, 0.7, "Mao mạch cơ quan", "fillB", "small");
    g.arrow(P(1.4, 2.0), P(1.4, 1.95), "", 0.14).arrow(P(2.6, 2.0), P(2.6, 1.95), "", 0.14);
    g.path([P(0.8, 1.5), P(0.0, 1.5), P(0.0, 4.2), P(0.5, 4.2)], "aux").arrow(P(0.3, 4.2), P(0.5, 4.2), "", 0.16);
    g.path([P(3.5, 4.2), P(4.0, 4.2), P(4.0, 2.4), P(3.2, 2.4)], "ray").arrow(P(3.4, 2.4), P(3.2, 2.4), "ray", 0.16);
    g.path([P(3.2, 1.5), P(4.6, 1.5), P(4.6, -0.6), P(3.5, -0.6)], "ray").arrow(P(3.7, -0.6), P(3.5, -0.6), "ray", 0.16);
    g.path([P(0.5, -0.6), P(-0.6, -0.6), P(-0.6, 2.4), P(0.8, 2.4)], "aux").arrow(P(0.6, 2.4), P(0.8, 2.4), "", 0.16);
    return g.text(P(-1.4, 3.2), "vòng nhỏ", "small").text(P(5.4, 0.6), "vòng lớn", "small").svg();
  },
  "kt-truyen-mau": () => {
    const g = fig("Sơ đồ truyền máu: mũi tên chỉ từ người cho đến người nhận");
    const N = { O: P(0, 0), A: P(-2, 1.6), B: P(2, 1.6), AB: P(0, 3.2) };
    for (const [k, p] of Object.entries(N)) g.circle(p, 0.45, k === "O" ? "fillC" : k === "AB" ? "fillY" : "fillA").text(p, k, "b");
    for (const [a, b] of [["O", "A"], ["O", "B"], ["O", "AB"], ["A", "AB"], ["B", "AB"]]) arrowBetween(g, N[a], N[b], "hi", 0.55);
    return g.svg();
  },
  "kt-chu-ki-tim": () => {
    const g = fig("Chu kì tim 0,8 s: nhĩ co 0,1 s, thất co 0,3 s, dãn chung 0,4 s");
    const s = 8;
    g.rect(0, 0, 0.1 * s, 0.8, "fillB").rect(0.1 * s, 0, 0.4 * s, 0.8, "fillY").rect(0.4 * s, 0, 0.8 * s, 0.8, "fillA");
    g.text(P(0.4, 1.15), "nhĩ co", "small").text(P(2.0, 0.4), "thất co", "note").text(P(4.8, 0.4), "dãn chung", "note");
    for (const t of [0, 0.1, 0.4, 0.8]) g.tick(P(t * s, 0), String(t).replace(".", ","), "x");
    return g.text(P(6.9, -0.3), "(s)", "small").svg();
  },
};

// ---------- 2. Mendel ----------
const mendel = {
  "kt-phan-li": () => {
    const g = fig("P thuần chủng AA × aa: giao tử A và a; F₁ là Aa cho hai loại giao tử ½A, ½a");
    const cell = (p, t, cls = "body", r = 0.45) => g.circle(p, r, cls).text(p, t, "b");
    g.text(P(-1.4, 3), "P", "lbl").text(P(-1.4, 1.6), "G", "lbl").text(P(-1.4, 0.2), "F₁", "lbl").text(P(-1.4, -1.2), "G", "lbl");
    cell(P(0, 3), "AA", "fillY"); g.text(P(1.25, 3), "×", "big"); cell(P(2.5, 3), "aa", "fillC");
    cell(P(0, 1.6), "A", "fillY", 0.3); cell(P(2.5, 1.6), "a", "fillC", 0.3);
    arrowBetween(g, P(0, 3), P(0, 1.6)); arrowBetween(g, P(2.5, 3), P(2.5, 1.6));
    cell(P(1.25, 0.2), "Aa", "fillY"); arrowBetween(g, P(0, 1.6), P(1.25, 0.2), "hi", 0.35); arrowBetween(g, P(2.5, 1.6), P(1.25, 0.2), "hi", 0.35);
    cell(P(0.4, -1.2), "A", "fillY", 0.3); cell(P(2.1, -1.2), "a", "fillC", 0.3);
    arrowBetween(g, P(1.25, 0.2), P(0.4, -1.2), "hi", 0.4); arrowBetween(g, P(1.25, 0.2), P(2.1, -1.2), "hi", 0.4);
    return g.text(P(0.4, -1.8), "½", "note").text(P(2.1, -1.8), "½", "note").svg();
  },
  "kt-punnett": () => {
    const g = fig("Khung Punnett AaBb × AaBb: vàng = A-B-, lục = A-bb, xanh = aaB-, đỏ = aabb", { maxW: 320, maxH: 300 });
    const gam = ["AB", "Ab", "aB", "ab"], w = 1.1;
    const pheno = (s) => (s.includes("A") ? (s.includes("B") ? "fillY" : "fillC") : s.includes("B") ? "fillA" : "fillB");
    gam.forEach((x, i) => { g.text(P((i + 1) * w, w), x, "b"); g.text(P(0, -i * w), x, "b"); });
    gam.forEach((r, i) => gam.forEach((c, j) => {
      const A = [r[0], c[0]].sort().join(""), B = [r[1], c[1]].sort().join("");
      const geno = A + B, p = P((j + 1) * w, -i * w);
      g.rect(p.x - w / 2, p.y - w / 2, p.x + w / 2, p.y + w / 2, pheno(geno)).text(p, geno, "small");
    }));
    return g.text(P(0, w), "♀ \\ ♂", "small").svg();
  },
};

// ---------- 3. NST ----------
const nst = {
  "kt-chu-ki-te-bao": () => {
    const g = fig("Chu kì tế bào: kì trung gian (nhân đôi DNA, NST) chiếm phần lớn thời gian");
    const C = P(0, 0), R = 2;
    const sector = (a0, a1, cls) => { const ps = [C]; for (let i = 0; i <= 30; i++) ps.push(polar(C, R, a0 + ((a1 - a0) * i) / 30)); g.poly(ps, cls); };
    sector(90, 405, "fillA");
    ["fillY", "fillC", "fillB", "fillY"].forEach((cls, i) => sector(405 + i * 11.25, 416.25 + i * 11.25, cls));
    return g.text(P(0, -0.3), "Kì trung gian", "note").text(polar(C, R + 0.5, 427), "Nguyên phân", "note").text(polar(C, R + 0.95, 427), "(đầu, giữa, sau, cuối)", "small").svg();
  },
  "kt-nguyen-phan": () => {
    const g = fig("Nguyên phân (2n = 4): kì đầu, kì giữa, kì sau, kì cuối", { maxW: 340 });
    const L = 0.55, xs = [0, 2.6, 5.2];
    const colors = ["ray", "hi", "ray", "hi"];
    // kì đầu
    g.circle(P(xs[0], 0), 1.1, "thin");
    [P(-0.4, 0.35), P(0.35, 0.4), P(-0.3, -0.4), P(0.4, -0.3)].forEach((p, i) => chromX(g, add(P(xs[0], 0), p), i < 2 ? L : L * 0.7, colors[i]));
    // kì giữa
    g.circle(P(xs[1], 0), 1.1, "thin").line(P(xs[1] - 1.0, 0), P(xs[1] + 1.0, 0), "thin aux");
    [0.6, 0.2, -0.2, -0.6].forEach((y, i) => chromX(g, P(xs[1], y), i % 2 ? L * 0.7 : L, colors[i]));
    // kì sau
    g.ellipse(P(xs[2], 0), 1.4, 1.0, "thin");
    [0.45, 0.15, -0.15, -0.45].forEach((y, i) => { chromI(g, P(xs[2] - 0.7, y * 1.3), 0.3, colors[i]); chromI(g, P(xs[2] + 0.7, y * 1.3), 0.3, colors[i]); });
    g.arrow(P(xs[2] - 0.2, -0.85), P(xs[2] - 0.9, -0.85), "", 0.12).arrow(P(xs[2] + 0.2, -0.85), P(xs[2] + 0.9, -0.85), "", 0.12);
    // kì cuối
    const x4 = 7.9;
    for (const dx of [-0.7, 0.7]) { g.circle(P(x4 + dx, 0), 0.62, "thin"); [-0.3, -0.1, 0.1, 0.3].forEach((x, i) => chromI(g, P(x4 + dx + x, 0), 0.4, colors[i])); }
    ["Kì đầu", "Kì giữa", "Kì sau", "Kì cuối"].forEach((t, i) => g.text(P([xs[0], xs[1], xs[2], x4][i], -1.5), t, "note"));
    return g.svg();
  },
  "kt-gioi-tinh": () => {
    const g = fig("Cơ chế xác định giới tính ở người: tỉ lệ con trai : con gái ≈ 1 : 1");
    const b = (p, t, cls = "body") => g.box(p, 1.4, 0.6, t, cls, "b");
    g.text(P(-1.6, 3), "P", "lbl").text(P(-1.6, 1.6), "G", "lbl").text(P(-1.6, 0.1), "F", "lbl");
    b(P(0, 3), "♀ XX", "fillB"); g.text(P(1.5, 3), "×", "big"); b(P(3, 3), "♂ XY", "fillA");
    b(P(0, 1.6), "X", "fillB"); b(P(2.3, 1.6), "X", "fillA"); b(P(3.7, 1.6), "Y", "fillA");
    arrowBetween(g, P(0, 3), P(0, 1.6), "hi", 0.35); arrowBetween(g, P(3, 3), P(2.3, 1.6), "hi", 0.35); arrowBetween(g, P(3, 3), P(3.7, 1.6), "hi", 0.35);
    b(P(0.8, 0.1), "XX", "fillB"); b(P(2.9, 0.1), "XY", "fillA");
    arrowBetween(g, P(0, 1.6), P(0.8, 0.1), "thin", 0.35); arrowBetween(g, P(2.3, 1.6), P(0.8, 0.1), "thin", 0.35);
    arrowBetween(g, P(0, 1.6), P(2.9, 0.1), "thin", 0.35); arrowBetween(g, P(3.7, 1.6), P(2.9, 0.1), "thin", 0.35);
    return g.text(P(0.8, -0.55), "con gái", "note").text(P(2.9, -0.55), "con trai", "note").svg();
  },
};

// ---------- 4. DNA ----------
function ladder(g, x0, y0, pairs, clsL = "hi", clsR = "hi", h = 0.55) {
  g.line(P(x0, y0 + 0.3), P(x0, y0 - pairs.length * h), clsL).line(P(x0 + 1.6, y0 + 0.3), P(x0 + 1.6, y0 - pairs.length * h), clsR);
  pairs.forEach(([l, r], i) => {
    const y = y0 - i * h - h / 2;
    g.line(P(x0 + 0.38, y), P(x0 + 1.22, y), "thin").text(P(x0 + 0.2, y), l, "small").text(P(x0 + 1.4, y), r, "small");
  });
}
const PAIRS = [["A", "T"], ["T", "A"], ["G", "X"], ["X", "G"], ["T", "A"], ["G", "X"]];
const dna = {
  "kt-dna": () => {
    const g = fig("Đoạn DNA (vẽ duỗi thẳng): A liên kết với T bằng 2 liên kết H, G với X bằng 3 liên kết H");
    ladder(g, 0, 0, PAIRS);
    g.text(P(0, 0.6), "mạch 1", "small").text(P(1.6, 0.6), "mạch 2", "small");
    g.dim(P(2.2, 0), P(2.2, -3.3), "", 0.3, -1);
    return g.text(P(3.4, -1.4), "10 cặp nu", "small").text(P(3.4, -1.75), "= 3,4 nm", "small").text(P(3.4, -2.1), "(1 chu kì)", "small").svg();
  },
  "kt-nhan-doi": () => {
    const g = fig("Nhân đôi DNA: mỗi DNA con gồm một mạch cũ (xanh) và một mạch mới (đỏ)", { maxW: 340 });
    ladder(g, 0, 0, PAIRS, "hi", "hi");
    g.arrow(P(2.2, -1.6), P(3.4, -1.6), "", 0.2);
    ladder(g, 4.0, 0, PAIRS, "hi", "ray");
    ladder(g, 6.6, 0, PAIRS, "ray", "hi");
    return g.text(P(0.8, 0.65), "DNA mẹ", "note").text(P(6.1, 0.65), "Hai DNA con", "note").svg();
  },
  "kt-gene-protein": () => {
    const g = fig("Từ gene đến tính trạng");
    const items = [["Gene (đoạn DNA)", "fillA"], ["mRNA", "fillY"], ["Protein (chuỗi amino acid)", "fillC"], ["Tính trạng", "fillB"]];
    items.forEach(([t, cls], i) => g.box(P(0, -i * 1.4), 4.4, 0.7, t, cls));
    const notes = ["phiên mã (trong nhân)", "dịch mã (ribosome)", "biểu hiện"];
    notes.forEach((t, i) => { g.arrow(P(0, -i * 1.4 - 0.35), P(0, -(i + 1) * 1.4 + 0.35), "hi", 0.16); g.text(P(1.9, -i * 1.4 - 0.7), t, "small"); });
    return g.svg();
  },
};

// ---------- 5. Đột biến, di truyền người ----------
function chromosome(g, y, segs, label, changed = []) {
  g.text(P(-1.4, y), label, "small");
  segs.forEach((s, i) => g.rect(i * 0.5, y - 0.22, i * 0.5 + 0.5, y + 0.22, changed.includes(i) ? "fillB" : "fillA").text(P(i * 0.5 + 0.25, y), s, "small"));
}
const dotBien = {
  "kt-dot-bien-nst": () => {
    const g = fig("Các dạng đột biến cấu trúc NST (đoạn thay đổi tô đỏ)");
    chromosome(g, 0, "ABCDEFGH".split(""), "Bình thường");
    chromosome(g, -0.8, "ABCEFGH".split(""), "Mất đoạn D", []);
    chromosome(g, -1.6, "ABCBCDEFGH".split(""), "Lặp đoạn BC", [3, 4]);
    chromosome(g, -2.4, "ABEDCFGH".split(""), "Đảo đoạn CDE", [2, 3, 4]);
    chromosome(g, -3.2, ["A", "B", "C", "D", "E", "F", "M", "N"], "Chuyển đoạn", [6, 7]);
    return g.svg();
  },
  "kt-khong-phan-li": () => {
    const g = fig("Một cặp NST không phân li trong giảm phân tạo giao tử n + 1 và n − 1");
    g.box(P(2, 3), 3.6, 0.7, "Tế bào sinh giao tử (2n)", "body");
    g.box(P(0.6, 1.5), 1.6, 0.7, "n + 1", "fillB", "b").box(P(3.4, 1.5), 1.6, 0.7, "n − 1", "fillA", "b");
    g.arrow(P(1.4, 2.65), P(0.8, 1.85), "hi", 0.16).arrow(P(2.6, 2.65), P(3.2, 1.85), "hi", 0.16);
    g.text(P(-0.25, 2.4), "cặp NST không phân li", "small");
    g.box(P(0.6, -0.2), 2.4, 0.7, "2n + 1 (thể ba)", "fillB").box(P(3.4, -0.2), 2.4, 0.7, "2n − 1 (thể một)", "fillA");
    g.arrow(P(0.6, 1.15), P(0.6, 0.15), "hi", 0.16).arrow(P(3.4, 1.15), P(3.4, 0.15), "hi", 0.16);
    return g.text(P(2, 0.65), "+ giao tử n", "small").svg();
  },
  "kt-ki-hieu-pha-he": () => {
    const g = fig("Kí hiệu phả hệ");
    person(g, P(0, 0), "m", false); g.text(P(0, -0.65), "nam", "small");
    person(g, P(1.5, 0), "m", true); g.text(P(1.5, -0.65), "nam bệnh", "small");
    person(g, P(3.0, 0), "f", false); g.text(P(3.0, -0.65), "nữ", "small");
    person(g, P(4.5, 0), "f", true); g.text(P(4.5, -0.65), "nữ bệnh", "small");
    const a = P(1.0, -2), b = P(2.6, -2);
    person(g, a, "m", false); person(g, b, "f", false);
    couple(g, a, b, [P(1.3, -3.6), P(2.3, -3.6)], -3.6);
    person(g, P(1.3, -3.6), "m", false); person(g, P(2.3, -3.6), "f", false);
    return g.text(P(4.3, -2), "vợ chồng", "small").text(P(4.3, -3.6), "các con", "small").svg();
  },
  "bai-6": () => {
    const g = fig("Phả hệ Bài 6");
    const a = P(0, 0), b = P(2, 0), k1 = P(0.4, -1.8), k2 = P(1.6, -1.8);
    person(g, a, "m", false, "I.1"); person(g, b, "f", false, "I.2"); couple(g, a, b, [k1, k2], -1.8);
    person(g, k1, "m", true, "II.1"); person(g, k2, "f", false, "II.2");
    return g.svg();
  },
  "bai-9": () => {
    const g = fig("Phả hệ Bài 9 về bệnh P");
    const a = P(0.5, 0), b = P(2.9, 0), kids = [P(0, -1.9), P(1.1, -1.9), P(2.3, -1.9), P(3.4, -1.9)];
    person(g, a, "m", false, "I.1"); person(g, b, "f", false, "I.2"); couple(g, a, b, kids, -1.9);
    person(g, kids[0], "m", false, "II.1"); person(g, kids[1], "f", false, "II.2"); person(g, kids[2], "f", true, "II.3"); person(g, kids[3], "m", false, "II.4");
    return g.svg();
  },
};

// ---------- 6. Sinh thái, tiến hóa ----------
const N = { co: P(2.5, 0), cc: P(0.8, 1.4), chuot: P(4.2, 1.4), ech: P(0, 2.9), chim: P(1.9, 2.9), ran: P(4.0, 3.2), db: P(2.5, 4.6) };
const NAMES = { co: "Cỏ", cc: "Châu chấu", chuot: "Chuột", ech: "Ếch", chim: "Chim sâu", ran: "Rắn", db: "Đại bàng" };
const sinhThai = {
  "kt-gioi-han": () => {
    const g = fig("Giới hạn sinh thái về nhiệt độ của cá rô phi").axes(P(0, 0), 7.2, 3.3, "t (°C)", "mức sống");
    const X = (t) => (t / 45) * 6.6, f = (x) => { const t = (x / 6.6) * 45; return t < 5.6 || t > 42 ? 0 : 2.8 * Math.exp(-(((t - 30) / (t < 30 ? 11 : 6)) ** 2)); };
    g.poly([P(X(20), 0), ...Array.from({ length: 21 }, (_, i) => { const x = X(20 + (15 * i) / 20); return P(x, f(x)); }), P(X(35), 0)], "fillC");
    g.curve(f, X(5.6), X(42), "hi");
    for (const [t, l] of [[5.6, "5,6"], [30, "30"], [42, "42"]]) g.tick(P(X(t), 0), l, "x");
    g.line(P(X(30), 0), P(X(30), 2.8), "thin aux");
    return g.text(P(X(27.5), 1.0), "khoảng", "small").text(P(X(27.5), 0.7), "thuận lợi", "small").text(P(X(5.6), -0.65), "giới hạn dưới", "small").text(P(X(42), -0.65), "giới hạn trên", "small").svg();
  },
  "kt-luoi-thuc-an": () => {
    const g = fig("Lưới thức ăn: mũi tên chỉ từ sinh vật bị ăn đến sinh vật ăn");
    const edges = [["co", "cc"], ["co", "chuot"], ["cc", "ech"], ["cc", "chim"], ["ech", "ran"], ["chuot", "ran"], ["chuot", "db"], ["ran", "db"], ["chim", "db"]];
    for (const [a, b] of edges) arrowBetween(g, N[a], N[b], "hi", 0.45);
    for (const k in N) g.box(N[k], k === "cc" || k === "db" || k === "chim" ? 1.5 : 1.1, 0.55, NAMES[k], k === "co" ? "fillC" : "body", "small");
    return g.svg();
  },
  "kt-thap-tuoi": () => {
    const g = fig("Ba dạng tháp tuổi: trước sinh sản (dưới), sinh sản (giữa), sau sinh sản (trên)");
    const types = [["Phát triển", [3.0, 2.0, 0.8]], ["Ổn định", [2.2, 2.0, 1.2]], ["Giảm sút", [1.4, 2.0, 1.6]]];
    types.forEach(([name, ws], i) => {
      const cx = i * 3.6;
      ws.forEach((w, j) => g.rect(cx - w / 2, j * 0.6, cx + w / 2, j * 0.6 + 0.6, ["fillC", "fillA", "fillG"][j]));
      g.text(P(cx, -0.4), name, "note");
    });
    return g.svg();
  },
  "kt-thap-nang-luong": () => {
    const g = fig("Tháp năng lượng: mỗi bậc chỉ nhận khoảng 10% năng lượng của bậc dưới");
    const levels = [["Sinh vật sản xuất", 5, "100%"], ["Tiêu thụ bậc 1", 3.6, "10%"], ["Tiêu thụ bậc 2", 2.4, "1%"], ["Tiêu thụ bậc 3", 1.4, "0,1%"]];
    levels.forEach(([n, w, p], i) => { g.rect(-w / 2, i * 0.7, w / 2, i * 0.7 + 0.7, ["fillC", "fillY", "fillA", "fillB"][i]); g.text(P(0, i * 0.7 + 0.35), p, "small"); g.text(P(3.6, i * 0.7 + 0.35), n, "small"); });
    return g.svg();
  },
};

export const FIGS = {
  "sinh-hoc/01-co-the-nguoi": coThe,
  "sinh-hoc/02-di-truyen-mendel": mendel,
  "sinh-hoc/03-nhiem-sac-the": nst,
  "sinh-hoc/04-dna-rna-protein": dna,
  "sinh-hoc/05-dot-bien-di-truyen-nguoi": dotBien,
  "sinh-hoc/06-sinh-thai-tien-hoa": sinhThai,
};
