// Figures for the physics topics. Each entry: name -> () => { caption, svg }.
import { fig, P, add, sub, mul, lerp, polar, sb, unit, lineInter } from "./figlib.mjs";

// ---------- shared pieces ----------
function bridge(caption, middle) {
  const A = P(0, 0), C = P(2, 1.4), B = P(4, 0), D = P(2, -1.4), TA = P(-0.9, 0), TB = P(4.9, 0);
  const f = fig(caption).wire(TA, A).wire(B, TB)
    .res(A, C, sb("R1"), 1).res(C, B, sb("R2"), 1).res(A, D, sb("R3"), -1).res(D, B, sb("R4"), -1);
  middle(f, C, D);
  return f.node(A, "A", 135).node(B, "B", 45).node(C, "C", 90).node(D, "D", -90).term(TA, "+", 180).term(TB, "−", 0).svg();
}

// Thin lens ray diagram. f > 0 converging, f < 0 diverging; d, h in cm.
function lens(caption, f, d, h) {
  const dp = (d * f) / (d - f), hp = (-h * dp) / d, real = dp > 0;
  const xs = [-d, dp, f, -f, 2 * Math.abs(f), -2 * Math.abs(f)];
  const k = 9 / (Math.max(...xs) - Math.min(...xs) + 4);
  const X = (x) => x * k, Y = (y) => y * k * 2.2;
  const xmin = Math.min(...xs) * k - 1, xmax = Math.max(...xs) * k + 1.2;
  const H = Math.max(Y(h), Math.abs(Y(hp))) + 0.6;
  const g = fig(caption, { maxW: 340, maxH: 230 });
  g.line(P(xmin, 0), P(xmax, 0), "thin");
  if (f > 0) g.arrow(P(0, -H), P(0, H), "", 0.2).arrow(P(0, H), P(0, -H), "", 0.2);
  else {
    g.line(P(0, -H), P(0, H));
    g.path([P(-0.15, H + 0.18), P(0, H), P(0.15, H + 0.18)]).path([P(-0.15, -H - 0.18), P(0, -H), P(0.15, -H - 0.18)]);
  }
  g.dot(P(X(f), 0), f > 0 ? "F'" : "F", -90, 0.32).dot(P(X(-f), 0), f > 0 ? "F" : "F'", -90, 0.32).text(P(0.22, -0.3), "O");
  const A = P(X(-d), 0), B = P(X(-d), Y(h)), A2 = P(X(dp), 0), B2 = P(X(dp), Y(hp)), I = P(0, Y(h));
  g.arrow(A, B, "hi").text(add(A, P(0, -0.3)), "A").text(add(B, P(0, 0.3)), "B");
  // ray 1: parallel to the axis, then through (or away from) the focus
  g.flow(B, I);
  const dir1 = unit(sub(P(X(f), 0), I));
  const s1 = f > 0 ? 1 : -1;
  const end1 = add(I, mul(dir1, s1 * ((xmax - 0) / Math.abs(dir1.x))));
  g.flow(I, end1);
  // ray 2: through the optical centre
  const dir2 = unit(sub(P(0, 0), B)), end2 = add(B, mul(dir2, (xmax - B.x) / dir2.x));
  g.flow(B, end2);
  if (real) g.arrow(A2, B2, "hi").text(add(A2, P(0, 0.3)), "A'").text(add(B2, P(0, -0.3)), "B'");
  else {
    g.arrow(A2, B2, "hi aux").text(add(A2, P(-0.32, 0.28)), "A'").text(add(B2, P(0, 0.3)), "B'");
    g.line(I, B2, "ray aux").line(P(0, 0), B2, "ray aux");
  }
  return g.svg();
}

function graphST(caption, segs, ticksX, ticksY, opts = {}) {
  // segs: list of polylines in data units; scaled to a 7 x 4 box
  const sx = 6 / opts.tmax, sy = 3.6 / opts.smax, S = (p) => P(p[0] * sx, p[1] * sy);
  const g = fig(caption).axes(P(0, 0), 6.8, 4.3, opts.xl || "t (h)", opts.yl || "s (km)");
  for (const [x, lbl] of ticksX) g.tick(P(x * sx, 0), lbl, "x");
  for (const [y, lbl] of ticksY) { g.tick(P(0, y * sy), lbl, "y"); }
  for (const s of segs) g.path(s.pts.map(S), s.cls || "hi");
  for (const s of segs) if (s.label) g.text(add(S(s.label[0]), P(0.2, 0.3)), s.label[1], "note");
  for (const [x, y] of opts.guides || []) g.line(P(x * sx, 0), S([x, y]), "thin aux").line(P(0, y * sy), S([x, y]), "thin aux");
  for (const [x, y, lbl] of opts.dots || []) g.dot(S([x, y]), lbl, 120);
  return g.svg();
}

function uTube(caption, oilLabel, waterLabel) {
  const g = fig(caption);
  // tube walls (left arm x 0..0.7, right arm x 2.3..3.0, bottom y 0..0.7)
  g.poly([P(0, 4.4), P(0, 0), P(3, 0), P(3, 4.4), P(2.3, 4.4), P(2.3, 0.7), P(0.7, 0.7), P(0.7, 4.4)], "");
  g.poly([P(0.02, 1.6), P(0.02, 0.02), P(2.98, 0.02), P(2.98, 2.9), P(2.32, 2.9), P(2.32, 0.7), P(0.68, 0.7), P(0.68, 1.6)], "water");
  g.rect(0.02, 1.6, 0.68, 3.6, "oil");
  g.line(P(0, 1.6), P(0.7, 1.6), "thin").line(P(0.7, 1.6), P(2.3, 1.6), "thin aux");
  g.dot(P(0.35, 1.6), "A", 200, 0.3).dot(P(2.65, 1.6), "B", -20, 0.3);
  g.dim(P(0, 1.6), P(0, 3.6), oilLabel, 0.45, 1).dim(P(3, 1.6), P(3, 2.9), waterLabel, 0.45, -1);
  g.text(P(0.35, 4.0), "dầu", "note").text(P(1.5, 0.35), "nước", "note");
  return g.svg();
}

function coil(caption, labels) {
  const g = fig(caption);
  const n = 6, x0 = -1.75, dx = 0.7;
  for (let i = 0; i < n; i++) {
    const c = P(x0 + i * dx, 0);
    g.ellipse(c, 0.22, 0.8, "");
    g.arrow(add(c, P(0.22, 0.25)), add(c, P(0.22, -0.2)), "hi", 0.16);
  }
  g.wire(P(x0, -0.8), P(x0, -1.8), P(-0.3, -1.8)).src(P(-0.3, -1.8), P(0.3, -1.8)).wire(P(0.3, -1.8), P(x0 + (n - 1) * dx, -1.8), P(x0 + (n - 1) * dx, -0.8));
  g.text(P(-0.3, -1.35), "+", "note").text(P(0.3, -1.35), "−", "note");
  if (labels) {
    g.text(P(-2.5, 0), "S", "big").text(P(2.35, 0), "N", "big");
    g.arrow(P(-1.2, 0), P(1.2, 0), "", 0.2).text(P(0, 0.3), "B", "lbl");
  } else g.text(P(-2.5, 0), "?", "big").text(P(2.35, 0), "?", "big");
  return g.svg();
}

// ---------- 5. Điện học ----------
const dienHoc = {
  "kt-ohm": () => {
    const g = fig("Đồ thị I theo U của hai dây dẫn: R₁ < R₂").axes(P(0, 0), 5.5, 3.8, "U", "I");
    g.line(P(0, 0), P(4.4, 3.3), "hi").line(P(0, 0), P(5, 1.9), "ray");
    return g.text(P(4.6, 3.45), sb("R1"), "lbl").text(P(5.2, 2.1), sb("R2"), "lbl").svg();
  },
  "kt-noi-tiep": () => {
    const A = P(0, 0), M = P(2.6, 0), B = P(5.2, 0);
    return fig("Đoạn mạch nối tiếp: cùng cường độ I, U = U₁ + U₂")
      .res(A, M, sb("R1")).res(M, B, sb("R2")).node(M).term(A, "A", 180).term(B, "B", 0)
      .arrow(P(1.0, -0.4), P(1.7, -0.4), "hi", 0.16).text(P(1.95, -0.4), "I", "lbl")
      .dim(P(0.4, 0), P(2.4, 0), sb("U1"), 0.85, -1).dim(P(2.8, 0), P(4.8, 0), sb("U2"), 0.85, -1).svg();
  },
  "kt-song-song": () => {
    const A = P(0, 0), M = P(0.9, 0), N = P(3.9, 0), B = P(4.8, 0);
    return fig("Đoạn mạch song song: cùng hiệu điện thế U, I = I₁ + I₂")
      .wire(A, M).wire(N, B).wire(M, P(0.9, 0.85)).wire(M, P(0.9, -0.85)).wire(N, P(3.9, 0.85)).wire(N, P(3.9, -0.85))
      .res(P(0.9, 0.85), P(3.9, 0.85), sb("R1")).res(P(0.9, -0.85), P(3.9, -0.85), sb("R2"), -1)
      .arrow(P(1.3, 1.1), P(1.9, 1.1), "hi", 0.15).text(P(1.6, 1.35), sb("I1"), "lbl")
      .arrow(P(1.3, -0.6), P(1.9, -0.6), "hi", 0.15).text(P(1.6, -0.35), sb("I2"), "lbl")
      .node(M).node(N).term(A, "A", 180).term(B, "B", 0).svg();
  },
  "kt-mach-cau": () => bridge("Mạch cầu: cân bằng khi R₁/R₂ = R₃/R₄, khi đó không có dòng qua R₅", (f, C, D) => f.res(C, D, sb("R5"), 1)),
  "kt-cong-suat": () => {
    const g = fig("Công suất trên R: lớn nhất khi R = r").axes(P(0, 0), 6.5, 3.6, "R", "P");
    const Pf = (R) => (3.2 * 4 * R) / ((R + 1) ** 2);
    g.curve(Pf, 0, 6.2, "hi").line(P(1, 0), P(1, 3.2), "thin aux").line(P(0, 3.2), P(1, 3.2), "thin aux");
    return g.tick(P(1, 0), "r", "x").text(P(-0.55, 3.2), "Pₘₐₓ", "note").svg();
  },
  "bai-4": () => {
    const TA = P(0, 0), M = P(2.6, 0), N = P(5.2, 0), TB = P(6.2, 0);
    return fig("R₁ nối tiếp với cụm (R₂ song song R₃)")
      .res(TA, M, sb("R1")).wire(M, P(2.6, 0.9)).wire(M, P(2.6, -0.9)).wire(N, P(5.2, 0.9)).wire(N, P(5.2, -0.9))
      .res(P(2.6, 0.9), P(5.2, 0.9), sb("R2")).res(P(2.6, -0.9), P(5.2, -0.9), sb("R3"), -1).wire(N, TB)
      .node(M).node(N).term(TA, "A", 180).term(TB, "B", 0).svg();
  },
  "bai-9": () => bridge("Mạch cầu: R₅ nối C và D", (f, C, D) => f.res(C, D, sb("R5"), 1)),
  "bai-11": () => bridge("Ampe kế lý tưởng nối C và D", (f, C, D) => f.meter(C, D, "A")),
  "bai-12": () => {
    const T1 = P(0, 0), L = P(0.7, 0), M = P(3.1, 0), T2 = P(5.6, 0);
    return fig("Vôn kế mắc song song với R₁")
      .wire(T1, L).res(L, M, sb("R1"), -1).res(M, T2, sb("R2"), -1)
      .wire(L, P(0.7, 1.1)).wire(M, P(3.1, 1.1)).meter(P(0.7, 1.1), P(3.1, 1.1), "V")
      .node(L).node(M).term(T1, "+", 180).term(T2, "−", 0).text(P(2.8, -1.05), "U = 12 V", "note").svg();
  },
  "bai-14": () => {
    const M = P(0.4, 0), N = P(4.6, 0), xC = 0.4 + 0.25 + (12 / 18) * 3.7;
    return fig("Đèn mắc giữa đầu M và con chạy C của biến trở")
      .wire(M, P(0.65, 0)).wire(P(4.35, 0), N).box(P(2.5, 0), 3.7, 0.36)
      .wire(M, P(0.4, 1.7)).lamp(P(0.4, 1.7), P(xC, 1.7), "Đ", 1).wire(P(xC, 1.7), P(xC, 0.75))
      .arrow(P(xC, 0.75), P(xC, 0.2))
      .wire(M, P(0.4, -1.2)).src(P(0.4, -1.2), P(4.6, -1.2), "U", -1).wire(P(4.6, -1.2), N)
      .node(M, "M", 180).node(N, "N", 0).tag(P(xC, 0.75), "C", 0, 0.3).svg();
  },
  "bai-15": () => {
    const g = fig("Mạch thang vô hạn, mọi điện trở bằng R");
    const h = 1.8, w = 1.7, cells = 3;
    for (let k = 0; k < cells; k++) {
      g.res(P(k * w, 0), P((k + 1) * w, 0), "R").res(P((k + 1) * w, 0), P((k + 1) * w, -h), "R", -1);
      g.node(P((k + 1) * w, 0)).node(P((k + 1) * w, -h));
    }
    g.wire(P(0, -h), P(cells * w + 0.5, -h)).wire(P(cells * w, 0), P(cells * w + 0.5, 0));
    return g.text(P(cells * w + 0.9, -h / 2), "…", "note").term(P(0, 0), "A", 180).term(P(0, -h), "B", 180).svg();
  },
};

// ---------- 1. Áp suất ----------
const apSuat = {
  "kt-ap-suat-long": () => {
    const g = fig("Áp suất tại A: p = d·h, với h là độ sâu tính từ mặt thoáng");
    g.rect(0.02, 0.02, 3.98, 3.2, "water").path([P(0, 4), P(0, 0), P(4, 0), P(4, 4)]).line(P(0, 3.2), P(4, 3.2), "thin");
    g.dot(P(2.6, 1.2), "A", 0, 0.3).dim(P(2.6, 3.2), P(2.6, 1.2), "h", 0.5, -1);
    return g.text(P(1.2, 3.5), "mặt thoáng", "note").svg();
  },
  "kt-thuy-luc": () => {
    const g = fig("Máy nén thủy lực: F/f = S/s");
    g.poly([P(0.02, 0.02), P(5.98, 0.02), P(5.98, 2.4), P(3.6, 2.4), P(3.6, 0.8), P(1, 0.8), P(1, 2.9), P(0.02, 2.9)], "water");
    g.path([P(0, 4), P(0, 0), P(6, 0), P(6, 3.6)]).path([P(1, 4), P(1, 0.8), P(3.6, 0.8), P(3.6, 3.6)]);
    g.rect(0, 2.9, 1, 3.1, "fillG").rect(3.6, 2.4, 6, 2.65, "fillG");
    g.arrow(P(0.5, 4.2), P(0.5, 3.15), "hi").text(P(0.85, 3.9), "f", "lbl").arrow(P(4.8, 2.7), P(4.8, 3.8), "hi").text(P(5.15, 3.5), "F", "lbl");
    return g.text(P(0.5, 2.5), "s", "lbl").text(P(4.8, 2.05), "S", "lbl").svg();
  },
  "kt-archimedes": () => {
    const g = fig("Vật trong chất lỏng: lực đẩy F_A hướng lên, trọng lực P hướng xuống");
    g.rect(0.02, 0.02, 4.98, 3.4, "water").path([P(0, 4), P(0, 0), P(5, 0), P(5, 4)]).line(P(0, 3.4), P(5, 3.4), "thin");
    g.rect(1.8, 1.0, 3.2, 2.2, "fillG");
    g.arrow(P(2.5, 1.6), P(2.5, 0.35), "", 0.2).text(P(2.85, 0.5), "P", "lbl");
    g.arrow(P(2.5, 1.6), P(2.5, 3.0), "hi", 0.2).text(P(2.95, 2.9), "F_{A}", "lbl");
    return g.svg();
  },
  "kt-ong-chu-u": () => uTube("Ống chữ U: p_A = p_B (A, B cùng độ cao, cùng trong nước)", "h_{d}", "h_{n}"),
  "bai-8": () => uTube("Cột dầu cao 20 cm ở nhánh trái", "20 cm", "h_{n}"),
  "bai-9": () => {
    const g = fig("Khối lập phương nằm giữa lớp dầu và lớp nước");
    g.rect(0.02, 0.02, 4.98, 2.0, "water").rect(0.02, 2.0, 4.98, 3.6, "oil").path([P(0, 4.1), P(0, 0), P(5, 0), P(5, 4.1)]);
    g.line(P(0, 2.0), P(5, 2.0), "thin aux");
    g.rect(1.9, 1.3, 3.1, 2.5, "body").dim(P(3.1, 1.3), P(3.1, 2.0), "x", 0.45, -1).dim(P(1.9, 1.3), P(1.9, 2.5), "10 cm", 0.55, 1);
    return g.text(P(4.2, 3.1), "dầu", "note").text(P(4.2, 0.9), "nước", "note").svg();
  },
};

// ---------- 2. Chuyển động, lực ----------
const chuyenDong = {
  "kt-do-thi-s-t": () => graphST("Đồ thị s – t: đường dốc hơn ứng với tốc độ lớn hơn, đoạn nằm ngang là đứng yên",
    [{ pts: [[0, 0], [2, 60]], cls: "ray", label: [[2, 60], "nhanh"] }, { pts: [[0, 0], [1.5, 20], [2.5, 20], [4, 40]], cls: "hi", label: [[4, 40], "chậm, có nghỉ"] }],
    [], [], { tmax: 4.5, smax: 65, yl: "s", xl: "t" }),
  "kt-luc-can-bang": () => {
    const g = fig("Hai lực cân bằng: trọng lực P và phản lực N");
    g.line(P(0, 0), P(5, 0)).rect(1.8, 0, 3.2, 1.0, "fillG");
    g.arrow(P(2.5, 0.5), P(2.5, -1.0)).text(P(2.85, -0.85), "P", "lbl").arrow(P(2.5, 0.5), P(2.5, 2.0), "hi").text(P(2.85, 1.85), "N", "lbl");
    return g.svg();
  },
  "kt-gap-nhau": () => {
    const A = P(0, 0), B = P(7, 0), C = P(2.8, 0);
    const g = fig("Hai xe chuyển động ngược chiều từ A và B, gặp nhau tại C");
    g.line(A, B, "thin").dot(A, "A", -90).dot(B, "B", -90).dot(C, "C", -90);
    g.arrow(P(0, 0.4), P(1.4, 0.4), "hi").text(P(0.7, 0.7), "v₁", "lbl").arrow(P(7, 0.4), P(5.6, 0.4), "ray").text(P(6.3, 0.7), "v₂", "lbl");
    return g.dim(A, B, "L", 0.9, -1).svg();
  },
  "bai-3": () => graphST("Đồ thị quãng đường – thời gian của người đi xe đạp",
    [{ pts: [[0, 0], [1, 12], [1.5, 12], [2.5, 30]] }],
    [[1, "1"], [1.5, "1,5"], [2.5, "2,5"]], [[12, "12"], [30, "30"]], { tmax: 3, smax: 33, guides: [[1, 12], [2.5, 30]] }),
  "bai-12": () => graphST("Người đi bộ (xuất phát 6 h) và người đi xe đạp (xuất phát 7 h)",
    [{ pts: [[0, 0], [2.5, 12.5]], cls: "hi", label: [[2.5, 12.5], "đi bộ"] }, { pts: [[1, 0], [2.2, 18]], cls: "ray", label: [[2.2, 18], "xe đạp"] }],
    [[1, "7 h"], [1.5, "7 h 30"], [2, "8 h"]], [[7.5, "7,5"]], { tmax: 2.8, smax: 19, xl: "t", guides: [[1.5, 7.5]], dots: [[1.5, 7.5, ""]] }),
};

// ---------- 3. Đòn bẩy, công, năng lượng ----------
const donBay = {
  "kt-don-bay": () => {
    const g = fig("Đòn bẩy cân bằng: F₁·d₁ = F₂·d₂");
    g.rect(0, 0, 6, 0.18, "fillG").poly([P(2, 0), P(1.65, -0.7), P(2.35, -0.7)], "body").text(P(2, -1.0), "O", "lbl");
    g.arrow(P(0.1, 0.2), P(0.1, 1.5), "hi").text(P(0.45, 1.3), sb("F1"), "lbl").arrow(P(5.9, 1.5), P(5.9, 0.2), "ray").text(P(5.5, 1.3), sb("F2"), "lbl");
    return g.dim(P(0.1, 0), P(2, 0), sb("d1"), 1.5, -1).dim(P(2, 0), P(5.9, 0), sb("d2"), 1.5, -1).svg();
  },
  "kt-rong-roc": () => {
    const g = fig("Ròng rọc động: lực kéo F = P/2");
    g.line(P(0, 4), P(3, 4), "thick").circle(P(1.5, 2), 0.5, "body").dot(P(1.5, 2));
    g.line(P(1, 4), P(1, 2)).line(P(2, 2), P(2, 4.6)).arrow(P(2, 4.2), P(2, 5.0), "hi").text(P(2.35, 4.9), "F", "lbl");
    g.line(P(1.5, 2), P(1.5, 1.2)).rect(1.0, 0.4, 2.0, 1.2, "fillG").arrow(P(1.5, 0.8), P(1.5, -0.3)).text(P(1.85, -0.15), "P", "lbl");
    return g.svg();
  },
  "kt-mat-nghieng": () => {
    const g = fig("Mặt phẳng nghiêng dài l, cao h: F·l = P·h (không ma sát)");
    const A = P(0, 0), B = P(5, 0), C = P(5, 2), u = unit(sub(C, A)), n = P(-u.y, u.x);
    g.poly([A, B, C], "fillY");
    const q = add(A, mul(u, 2.6)), b0 = q, b1 = add(q, mul(u, 0.9)), b2 = add(b1, mul(n, 0.6)), b3 = add(b0, mul(n, 0.6));
    g.poly([b0, b1, b2, b3], "fillG");
    const cm = add(lerp(b0, b2, 0.5), P(0, 0));
    g.arrow(cm, add(cm, mul(u, 1.4)), "hi").text(add(cm, add(mul(u, 1.3), mul(n, 0.35))), "F", "lbl");
    return g.dim(A, C, "l", 0.5, 1).dim(B, C, "h", 0.4, -1).svg();
  },
  "kt-con-lac": () => {
    const O = P(0, 3), L = 2.6, g = fig("Con lắc: ở hai biên thế năng lớn nhất, ở vị trí thấp nhất động năng lớn nhất");
    g.line(P(-1, 3), P(1, 3), "thick").arc(O, L, 220, 320, "thin aux");
    for (const a of [220, 270, 320]) { const p = polar(O, L, a); g.line(O, p, a === 270 ? "" : "thin").circle(p, 0.2, a === 270 ? "fillB" : "fillA"); }
    g.text(add(polar(O, L, 220), P(-0.5, 0.3)), "W_{t} max", "note").text(add(polar(O, L, 320), P(0.5, 0.3)), "W_{t} max", "note");
    return g.text(add(polar(O, L, 270), P(0, -0.5)), "W_{đ} max", "note").svg();
  },
  "bai-7": () => {
    const g = fig("Thanh AB dài 1 m, điểm tựa O cách A 30 cm, trọng tâm G ở giữa thanh");
    g.rect(0, 0, 6, 0.16, "fillG").poly([P(1.8, 0), P(1.5, -0.6), P(2.1, -0.6)], "body").text(P(1.8, -0.9), "O", "lbl");
    g.text(P(-0.25, 0.1), "A", "lbl").text(P(6.25, 0.1), "B", "lbl").dot(P(3, 0.08), "G", 90, 0.32);
    g.arrow(P(3, 0), P(3, -1.3)).text(P(3.4, -1.15), "P₀", "lbl").arrow(P(0.05, 0), P(0.05, -1.3), "hi").text(P(0.45, -1.15), "P_{A}", "lbl");
    return g.dim(P(0, 0.16), P(1.8, 0.16), "30 cm", 0.5, 1).dim(P(1.8, 0.16), P(3, 0.16), "20 cm", 0.5, 1).svg();
  },
};

// ---------- 4. Nhiệt học ----------
const nhietHoc = {
  "kt-doi-luu": () => {
    const g = fig("Đối lưu khi đun nước: nước nóng nổi lên ở giữa, nước lạnh chìm xuống ở hai bên");
    g.rect(0.02, 0.02, 4.98, 3.2, "water").path([P(0, 3.8), P(0, 0), P(5, 0), P(5, 3.8)]);
    for (const x of [2.1, 2.5, 2.9]) g.poly([P(x - 0.2, -0.15), P(x + 0.2, -0.15), P(x, -0.75)].map((p) => P(p.x, -0.9 - p.y)), "fillB");
    g.arrow(P(2.5, 0.4), P(2.5, 2.7), "ray").arrow(P(2.3, 2.9), P(0.9, 2.9), "hi").arrow(P(2.7, 2.9), P(4.1, 2.9), "hi");
    g.arrow(P(0.6, 2.7), P(0.6, 0.5), "hi").arrow(P(4.4, 2.7), P(4.4, 0.5), "hi").arrow(P(0.9, 0.3), P(2.2, 0.3), "hi").arrow(P(4.1, 0.3), P(2.8, 0.3), "hi");
    return g.svg();
  },
  "kt-chuyen-the": () => {
    const g = fig("Nhiệt độ của nước đá khi được đun liên tục (không theo tỉ lệ)").axes(P(0, 0), 8.3, 4.6, "thời gian", "t (°C)");
    const pts = [P(0, -0.6), P(1, 0.0), P(2.6, 0.0), P(4.6, 3.6), P(7.8, 3.6)];
    g.path(pts, "hi").tick(P(0, 3.6), "100", "y").tick(P(0, -0.6), "−10", "y");
    g.text(P(1.8, 0.35), "nóng chảy", "note").text(P(6.2, 3.95), "sôi", "note").text(P(4.4, 1.7), "nước nóng lên", "note").text(P(1.0, -0.75), "đá", "note");
    return g.svg();
  },
};

// ---------- 6. Điện từ ----------
const dienTu = {
  "kt-duong-suc": () => {
    const g = fig("Đường sức từ của nam châm thẳng: đi ra từ cực N, đi vào cực S");
    for (const b of [0.9, 1.6, 2.4]) {
      g.curve((x) => b * Math.sqrt(Math.max(0, 1 - (x / 1.5) ** 2)), -1.5, 1.5, "thin");
      g.curve((x) => -b * Math.sqrt(Math.max(0, 1 - (x / 1.5) ** 2)), -1.5, 1.5, "thin");
      g.arrow(P(0.05, b), P(-0.1, b), "", 0.18).arrow(P(0.05, -b), P(-0.1, -b), "", 0.18);
    }
    g.rect(-1.5, -0.35, 0, 0.35, "fillA").rect(0, -0.35, 1.5, 0.35, "fillB");
    g.arrow(P(1.5, 0), P(2.6, 0), "", 0.18).arrow(P(-2.6, 0), P(-1.5, 0), "", 0.18);
    return g.text(P(-0.75, 0), "S", "b").text(P(0.75, 0), "N", "b").svg();
  },
  "kt-ong-day": () => coil("Ống dây có dòng điện như nam châm thẳng; đầu bên phải là cực N", true),
  "kt-truyen-tai": () => {
    const g = fig("Truyền tải điện năng đi xa");
    const labels = ["Nhà máy điện", "Máy tăng áp", "Đường dây tải điện (cao thế)", "Máy hạ áp", "Nơi tiêu thụ"];
    labels.forEach((t, i) => g.box(P(0, -i * 1.3), 4.6, 0.8, t, i === 2 ? "fillY" : "body"));
    for (let i = 0; i < 4; i++) g.arrow(P(0, -i * 1.3 - 0.4), P(0, -(i + 1) * 1.3 + 0.4), "hi", 0.16);
    return g.text(P(0, -6.0), "U lớn → I nhỏ → hao phí nhỏ", "note").svg();
  },
  "bai-1": () => coil("Ống dây Bài 1: chiều dòng điện trên mặt trước các vòng dây theo mũi tên", false),
  "bai-2": () => {
    const g = fig("Dây dẫn có dòng điện đặt giữa hai cực nam châm chữ U");
    g.rect(0, 2.4, 5, 3.0, "fillB").rect(0, -0.6, 5, 0, "fillA").text(P(2.5, 2.7), "N", "b").text(P(2.5, -0.3), "S", "b");
    for (const x of [0.8, 4.2]) g.arrow(P(x, 2.3), P(x, 0.15), "thin aux", 0.16);
    g.arrow(P(0.2, 1.2), P(4.8, 1.2), "hi").text(P(4.5, 1.5), "I", "lbl");
    return g.svg();
  },
};

// ---------- 7. Quang học ----------
const quangHoc = {
  "kt-khuc-xa": () => {
    const g = fig("Khúc xạ từ không khí vào nước: r < i");
    const i = 50, r = (Math.asin(Math.sin((i * Math.PI) / 180) / 1.33) * 180) / Math.PI;
    g.rect(-3, -2.6, 3, 0, "water").line(P(-3, 0), P(3, 0), "thin").line(P(0, 2.6), P(0, -2.6), "thin aux");
    const S = polar(P(0, 0), 2.6, 90 + i), R = polar(P(0, 0), 2.6, -90 + r);
    g.flow(S, P(0, 0)).flow(P(0, 0), R).angle(P(0, 0), P(0, 1), S, 0.7, "i").angle(P(0, 0), R, P(0, -1), 0.8, "r");
    return g.text(P(-2.1, 0.4), "không khí", "note").text(P(-2.4, -0.4), "nước", "note").text(P(0.3, 2.4), "N", "lbl").svg();
  },
  "kt-tkht-that": () => lens("Thấu kính hội tụ, vật ngoài khoảng tiêu cự: ảnh thật, ngược chiều", 10, 25, 3),
  "kt-tkht-ao": () => lens("Thấu kính hội tụ, vật trong khoảng tiêu cự: ảnh ảo, cùng chiều, lớn hơn vật", 12, 8, 1.6),
  "kt-tkpk": () => lens("Thấu kính phân kì: ảnh ảo, cùng chiều, nhỏ hơn vật", -12, 24, 3),
  "bai-2": () => lens("Vật cách thấu kính hội tụ 36 cm, f = 12 cm", 12, 36, 3),
  "bai-3": () => lens("Vật cách thấu kính hội tụ 6 cm, f = 12 cm", 12, 6, 2),
  "bai-4": () => lens("Vật cách thấu kính phân kì 24 cm, f = 12 cm", -12, 24, 3),
  "bai-10": () => {
    const A = P(0, 0), B = P(4, 0), C = P(0, 4);
    const g = fig("Lăng kính vuông cân: phản xạ toàn phần ở mặt huyền");
    g.poly([A, B, C], "fillA");
    g.flow(P(-1.8, 1), P(0, 1)).flow(P(0, 1), P(3, 1)).flow(P(3, 1), P(3, 0)).flow(P(3, 0), P(3, -1.6));
    g.line(P(2.3, 0.3), P(3.7, 1.7), "thin aux");
    return g.text(P(3.6, 1.15), "45°", "note").svg();
  },
  "bai-11": () => {
    const g = fig("Đèn ở đáy bể: chỉ các tia có góc tới nhỏ hơn i_gh mới ló ra");
    const h = 2.4, R = h * (3 / Math.sqrt(7));
    g.rect(-4.4, 0, 4.4, h, "water").line(P(-4.4, h), P(4.4, h), "thin").line(P(-4.4, 0), P(4.4, 0));
    const S = P(0, 0);
    g.dot(S, "S", -90).flow(S, P(R, h)).flow(P(R, h), P(4.4, h + 0.02)).flow(S, P(-R, h)).flow(P(-R, h), P(-4.4, h + 0.02));
    g.line(P(R, h), P(R, h + 1.0), "thin aux").line(P(R, h), P(R, h - 0.9), "thin aux");
    g.angle(P(R, h), P(R, h - 1), S, 0.6, "i_{gh}");
    return g.dim(P(0, h), P(R, h), "R", 0.55, 1).dim(P(-4.0, 0), P(-4.0, h), "h", 0.3, 1).svg();
  },
};

export const FIGS = {
  "vat-li/01-ap-suat": apSuat,
  "vat-li/02-chuyen-dong-luc": chuyenDong,
  "vat-li/03-don-bay-cong-nang-luong": donBay,
  "vat-li/04-nhiet-hoc": nhietHoc,
  "vat-li/05-dien-hoc": dienHoc,
  "vat-li/06-dien-tu": dienTu,
  "vat-li/07-quang-hoc": quangHoc,
};
