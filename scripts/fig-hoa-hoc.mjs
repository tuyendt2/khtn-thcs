// Figures for the chemistry topics. Each entry: name -> () => { caption, svg }.
import { fig, P, add, polar } from "./figlib.mjs";

// Bond between two atom positions, drawn short of the atom labels.
function bond(g, a, b, order = 1, gap = 0.22) {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const s = P(a.x + ux * gap, a.y + uy * gap), e = P(b.x - ux * gap, b.y - uy * gap);
  if (order === 1) g.line(s, e);
  else {
    const nx = -uy * 0.07, ny = ux * 0.07;
    g.line(P(s.x + nx, s.y + ny), P(e.x + nx, e.y + ny)).line(P(s.x - nx, s.y - ny), P(e.x - nx, e.y - ny));
  }
}
function molecule(g, atoms, bonds, title, tpos) {
  for (const [i, j, o] of bonds) bond(g, atoms[i][1], atoms[j][1], o || 1);
  for (const [sym, p] of atoms) g.text(p, sym, "b");
  if (title) g.text(tpos, title, "note");
}

const dungDich = {
  "kt-do-tan": () => {
    const sx = 0.06, sy = 0.016, S = (t, s) => P(t * sx, s * sy);
    const g = fig("Đường cong độ tan của một số chất rắn theo nhiệt độ").axes(P(0, 0), 6.6, 4.3, "t (°C)", "S");
    const T = [0, 20, 40, 60, 80, 100];
    const data = [["KNO₃", [13.3, 31.6, 63.9, 110, 169, 246], "ray"], ["CuSO₄", [14.3, 20.7, 28.5, 40, 55, 75.4], "hi"], ["NaCl", [35.7, 36, 36.6, 37.3, 38.4, 39.8], ""]];
    for (const [name, v, cls] of data) {
      g.path(T.map((t, i) => S(t, v[i])), cls);
      g.text(add(S(100, v[5]), P(0.45, 0)), name, "note");
    }
    for (const t of [20, 40, 60, 80, 100]) g.tick(S(t, 0), String(t), "x");
    for (const s of [50, 100, 150, 200, 250]) g.tick(S(0, s), String(s), "y");
    return g.svg();
  },
};

const nguyenTu = {
  "kt-nguyen-tu": () => {
    const g = fig("Nguyên tử sodium (Na, Z = 11): electron xếp thành 3 lớp 2, 8, 1");
    const O = P(0, 0);
    g.circle(O, 0.42, "fillB").text(O, "+11", "b");
    const shells = [[1.0, 2], [1.6, 8], [2.2, 1]];
    for (const [r, k] of shells) {
      g.circle(O, r, "thin");
      for (let i = 0; i < k; i++) g.circle(polar(O, r, 90 + (360 * i) / k), 0.09, "fillA");
    }
    return g.text(P(2.9, 1.7), "Na", "big").text(P(2.9, -1.9), "2, 8, 1", "note").svg();
  },
  "kt-phan-ung": () => {
    const g = fig("2H₂ + O₂ → 2H₂O: liên kết thay đổi, số nguyên tử H và O giữ nguyên");
    const H = (p) => g.circle(p, 0.28, "fillA").text(p, "H", "small");
    const O = (p) => g.circle(p, 0.4, "fillB").text(p, "O", "b");
    for (const y of [0.45, -0.45]) { H(P(0, y)); H(P(0.55, y)); }
    g.text(P(1.25, 0), "+", "big");
    O(P(2.0, 0)); O(P(2.75, 0));
    g.arrow(P(3.4, 0), P(4.4, 0), "hi");
    for (const [x, y] of [[5.4, 0.55], [5.4, -0.75]]) { O(P(x, y)); H(P(x - 0.55, y + 0.3)); H(P(x + 0.55, y + 0.3)); }
    return g.text(P(0.28, -1.2), "2H₂", "note").text(P(2.38, -1.2), "O₂", "note").text(P(5.4, -1.55), "2H₂O", "note").svg();
  },
};

const voCo = {
  "kt-thang-ph": () => {
    const g = fig("Thang pH: nhỏ hơn 7 là acid, bằng 7 trung tính, lớn hơn 7 là base");
    for (let i = 0; i <= 14; i++) {
      g.rect(i * 0.5, 0, i * 0.5 + 0.5, 0.6, i < 7 ? "fillB" : i === 7 ? "fillC" : "fillA");
      g.text(P(i * 0.5 + 0.25, 0.3), String(i), "small");
    }
    g.arrow(P(3.3, -0.35), P(0, -0.35), "ray").text(P(1.6, -0.7), "acid mạnh dần", "note");
    g.arrow(P(4.2, -0.35), P(7.5, -0.35), "hi").text(P(5.9, -0.7), "base mạnh dần", "note");
    const ex = [[1.5, "dạ dày", 0], [2.5, "chanh", 1], [7.4, "máu", 0], [10, "xà phòng", 0]];
    for (const [v, t, k] of ex) { const x = v * 0.5 + 0.25, y = 0.95 + k * 0.4; g.line(P(x, 0.6), P(x, y), "thin").text(P(x, y + 0.25), t, "small"); }
    return g.svg();
  },
  "kt-so-do-vo-co": () => {
    const g = fig("Quan hệ giữa các loại hợp chất vô cơ");
    const B = { kl: P(0, 3), pk: P(5, 3), ob: P(0, 1.5), oa: P(5, 1.5), ba: P(0, 0), ac: P(5, 0), mu: P(2.5, -1.4) };
    const L = { kl: "Kim loại", pk: "Phi kim", ob: "Oxide base", oa: "Oxide acid", ba: "Base", ac: "Acid", mu: "Muối" };
    for (const k in B) g.box(B[k], 2.0, 0.6, L[k], k === "mu" ? "fillY" : "body");
    const ar = (a, b, cls = "hi") => g.arrow(a, b, cls, 0.16);
    ar(P(0, 2.7), P(0, 1.8)); ar(P(5, 2.7), P(5, 1.8)); ar(P(0, 1.2), P(0, 0.3)); ar(P(5, 1.2), P(5, 0.3));
    ar(P(0.6, -0.3), P(1.9, -1.1)); ar(P(4.4, -0.3), P(3.1, -1.1));
    g.line(P(1.0, 1.5), P(4.0, 1.5), "thin aux").arrow(P(2.5, 1.5), P(2.5, -1.1), "thin aux", 0.14);
    g.line(P(1.0, 0), P(4.0, 0), "thin aux");
    return g.text(P(2.5, 1.75), "+ oxide acid", "small").text(P(3.4, 0.25), "trung hòa", "small").svg();
  },
  "kt-ket-tua-co2": () => {
    const g = fig("Kết tủa CaCO₃ theo số mol CO₂: tăng đến cực đại tại a, rồi tan dần đến 2a").axes(P(0, 0), 6.3, 3.6, "n CO₂", "n CaCO₃");
    g.path([P(0, 0), P(2.6, 2.8), P(5.2, 0)], "hi");
    g.line(P(2.6, 0), P(2.6, 2.8), "thin aux").line(P(0, 2.8), P(2.6, 2.8), "thin aux");
    g.line(P(0, 1.6), P(4.71, 1.6), "thin aux").line(P(1.49, 0), P(1.49, 1.6), "thin aux").line(P(4.71, 0), P(4.71, 1.6), "thin aux");
    g.dot(P(1.49, 1.6)).dot(P(4.71, 1.6));
    return g.tick(P(2.6, 0), "a", "x").tick(P(5.2, 0), "2a", "x").tick(P(0, 2.8), "a", "y").tick(P(1.49, 0), "x₁", "x").tick(P(4.71, 0), "x₂", "x").svg();
  },
};

const kimLoai = {
  "kt-day-hoat-dong": () => {
    const g = fig("Dãy hoạt động hóa học của kim loại: mức độ hoạt động giảm dần theo chiều mũi tên");
    const rows = [["K", "Na", "Ba", "Ca", "Mg", "Al", "Zn", "Fe", "Ni"], ["Sn", "Pb", "(H)", "Cu", "Hg", "Ag", "Pt", "Au"]];
    rows.forEach((r, ri) => {
      const y = -ri * 1.7;
      r.forEach((e, i) => g.box(P(i, y), 1, 0.7, e, e === "(H)" ? "fillY" : ri === 0 && i < 4 ? "fillB" : ri === 1 && i > 2 ? "fillC" : "fillA", "b"));
      g.arrow(P(-0.5, y - 0.6), P(r.length - 0.5, y - 0.6), "ray", 0.18);
    });
    return g.text(P(1.5, 0.65), "tác dụng với nước", "small").text(P(5.5, 0.65), "đẩy được H khỏi acid (đến Pb)", "small").svg();
  },
  "kt-dinh-sat": () => {
    const g = fig("Fe + CuSO₄ → FeSO₄ + Cu: đồng đỏ bám vào đinh sắt, dung dịch nhạt màu xanh");
    g.rect(0.02, 0.02, 3.98, 2.6, "fillA").path([P(0, 3.4), P(0, 0), P(4, 0), P(4, 3.4)]);
    g.poly([P(1.7, 3.8), P(1.95, 3.8), P(2.15, 0.4), P(1.9, 0.4)], "fillG");
    g.poly([P(1.79, 2.6), P(2.04, 2.6), P(2.15, 0.4), P(1.9, 0.4)], "fillB");
    g.text(P(3.0, 3.6), "đinh sắt", "note").line(P(2.4, 3.55), P(1.95, 3.3), "thin");
    g.text(P(3.15, 1.5), "Cu bám", "note").line(P(2.6, 1.5), P(2.1, 1.4), "thin");
    return g.text(P(1.0, 0.5), "dd CuSO₄", "note").svg();
  },
};

const phiKim = {
  "kt-bang-tuan-hoan": () => {
    const g = fig("Ba chu kì đầu của bảng tuần hoàn: kim loại (xanh), phi kim (lục), khí hiếm (vàng)", { maxW: 340, maxH: 260 });
    const rows = [
      [[1, "H", 1, "pk"], [8, "He", 2, "kh"]],
      [[1, "Li", 3, "kl"], [2, "Be", 4, "kl"], [3, "B", 5, "pk"], [4, "C", 6, "pk"], [5, "N", 7, "pk"], [6, "O", 8, "pk"], [7, "F", 9, "pk"], [8, "Ne", 10, "kh"]],
      [[1, "Na", 11, "kl"], [2, "Mg", 12, "kl"], [3, "Al", 13, "kl"], [4, "Si", 14, "pk"], [5, "P", 15, "pk"], [6, "S", 16, "pk"], [7, "Cl", 17, "pk"], [8, "Ar", 18, "kh"]],
    ];
    const cls = { kl: "fillA", pk: "fillC", kh: "fillY" }, w = 0.9;
    ["IA", "IIA", "IIIA", "IVA", "VA", "VIA", "VIIA", "VIIIA"].forEach((n, i) => g.text(P(i * w, 0.75), n, "small"));
    rows.forEach((r, ri) => {
      g.text(P(-0.8, -ri * w), String(ri + 1), "note");
      for (const [c, sym, z, k] of r) {
        const p = P((c - 1) * w, -ri * w);
        g.rect(p.x - w / 2, p.y - w / 2, p.x + w / 2, p.y + w / 2, cls[k]).text(add(p, P(0.08, -0.1)), sym, "b").text(add(p, P(-0.27, 0.27)), String(z), "small");
      }
    });
    g.text(P(-0.8, 1.2), "Chu kì", "small");
    g.arrow(P(0, -2.4), P(6.3, -2.4), "hi").text(P(3.15, -2.75), "tính phi kim tăng →", "note");
    return g.arrow(P(6.9, 0.3), P(6.9, -2.0), "ray").text(P(3.15, -3.1), "↓ tính kim loại tăng (trong một nhóm)", "note").svg();
  },
};

const huuCo = {
  "kt-ctct": () => {
    const g = fig("Công thức cấu tạo: methane, ethylene, ethanol, acetic acid", { maxW: 340, maxH: 260 });
    const u = 0.75;
    // methane at (0, 0)
    molecule(g, [["C", P(0, 0)], ["H", P(0, u)], ["H", P(0, -u)], ["H", P(-u, 0)], ["H", P(u, 0)]], [[0, 1], [0, 2], [0, 3], [0, 4]], "methane CH₄", P(0, -1.35));
    // ethylene at (3.4, 0)
    const e = 3.4;
    molecule(g, [["C", P(e - 0.4, 0)], ["C", P(e + 0.4, 0)], ["H", P(e - 1.0, 0.55)], ["H", P(e - 1.0, -0.55)], ["H", P(e + 1.0, 0.55)], ["H", P(e + 1.0, -0.55)]],
      [[0, 1, 2], [0, 2], [0, 3], [1, 4], [1, 5]], "ethylene C₂H₄", P(e, -1.35));
    // ethanol at row 2
    const y2 = -3.0;
    molecule(g, [["H", P(-u, y2)], ["C", P(0, y2)], ["C", P(u, y2)], ["O", P(2 * u, y2)], ["H", P(3 * u, y2)], ["H", P(0, y2 + u)], ["H", P(0, y2 - u)], ["H", P(u, y2 + u)], ["H", P(u, y2 - u)]],
      [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [1, 6], [2, 7], [2, 8]], "ethanol C₂H₅OH", P(u, y2 - 1.35));
    // acetic acid
    const x3 = 3.6;
    molecule(g, [["H", P(x3 - u, y2)], ["C", P(x3, y2)], ["C", P(x3 + u, y2)], ["O", P(x3 + u, y2 + u)], ["O", P(x3 + 2 * u, y2)], ["H", P(x3 + 3 * u, y2)], ["H", P(x3, y2 + u)], ["H", P(x3, y2 - u)]],
      [[0, 1], [1, 2], [2, 3, 2], [2, 4], [4, 5], [1, 6], [1, 7]], "acetic acid CH₃COOH", P(x3 + u, y2 - 1.35));
    return g.svg();
  },
};

const phuongPhap = {
  "kt-so-do-phuong-phap": () => {
    const g = fig("Gợi ý chọn phương pháp giải", { maxH: 270 });
    g.box(P(3.0, 0), 6.0, 0.6, "Đổi dữ kiện ra số mol, viết PTHH", "fillY", "small");
    const rows = [
      ["Biết lượng 2 chất phản ứng?", "Chất hết, chất dư"],
      ["Hỗn hợp nhiều chất?", "Lập hệ / trung bình"],
      ["Khối lượng rắn thay đổi?", "Tăng giảm khối lượng"],
      ["Nhiều phản ứng, hỏi tổng?", "Bảo toàn KL, nguyên tố"],
      ["Chưa biết hóa trị?", "Biện luận hóa trị"],
    ];
    rows.forEach(([q, m], i) => {
      const y = -1.1 * (i + 1);
      g.box(P(0.6, y), 4.2, 0.7, q, "body", "small").box(P(5.4, y), 3.8, 0.7, m, "fillC", "small").arrow(P(2.7, y), P(3.5, y), "hi", 0.14);
    });
    return g.svg();
  },
};

export const FIGS = {
  "hoa-hoc/01-nguyen-tu-mol-phan-ung": nguyenTu,
  "hoa-hoc/02-dung-dich": dungDich,
  "hoa-hoc/03-hop-chat-vo-co": voCo,
  "hoa-hoc/04-kim-loai": kimLoai,
  "hoa-hoc/05-phi-kim-bang-tuan-hoan": phiKim,
  "hoa-hoc/06-huu-co": huuCo,
  "hoa-hoc/07-phuong-phap-giai-toan": phuongPhap,
};
