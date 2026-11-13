// Build the KHTN study app (static PWA) into dist/.
// content/<subject>/<NN-topic>/ holds bai-hoc.md (lesson: I. basic knowledge,
// II. advanced knowledge, III. problems tagged "Cơ bản"/"Nâng cao", IV. solutions),
// goi-y.md (hints), the-ghi-nho.md (flashcards) and hinh/*.svg (figures).
// Formulas stay as TeX in <span class="m"> and are typeset on the phone by KaTeX
// (with mhchem for \ce{...}); each one is test-rendered here so mistakes show up.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import { tex } from "@mdit/plugin-tex";
import katexLib from "katex";
import "katex/contrib/mhchem";

const root = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(root, "content");
const dist = path.join(root, "dist");
const read = (p) => fs.readFileSync(p, "utf8");

const SUBJECTS = [
  { id: "vat-li", name: "Vật lí", icon: "⚡" },
  { id: "hoa-hoc", name: "Hóa học", icon: "🧪" },
  { id: "sinh-hoc", name: "Sinh học", icon: "🧬" },
];

// Short names for topics whose full title is long (used in tiles and headers).
const SHORT = {
  "vat-li-ap-suat": "Áp suất, Archimedes",
  "vat-li-chuyen-dong-luc": "Chuyển động và lực",
  "vat-li-don-bay-cong-nang-luong": "Đòn bẩy, công, năng lượng",
  "hoa-hoc-nguyen-tu-mol-phan-ung": "Nguyên tử, mol, phản ứng",
  "hoa-hoc-dung-dich": "Dung dịch, nồng độ",
  "hoa-hoc-kim-loai": "Kim loại",
  "hoa-hoc-phi-kim-bang-tuan-hoan": "Phi kim, bảng tuần hoàn",
  "hoa-hoc-phuong-phap-giai-toan": "Phương pháp giải toán",
  "sinh-hoc-nhiem-sac-the": "Nhiễm sắc thể",
  "sinh-hoc-dna-rna-protein": "DNA, RNA, protein",
  "sinh-hoc-dot-bien-di-truyen-nguoi": "Đột biến, di truyền người",
  "sinh-hoc-sinh-thai-tien-hoa": "Sinh thái, tiến hóa",
};

const issues = [];
let where = "";
let figDir = ""; // folder of the lesson being rendered, for hinh/*.svg
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const md = new MarkdownIt({ html: false, linkify: false, typographer: false }).use(tex, {
  render(content, displayMode) {
    try {
      katexLib.renderToString(content, { displayMode, throwOnError: true, strict: "ignore" });
    } catch (e) {
      issues.push(`${where}: ${e.message.slice(0, 120)}`);
    }
    // Long inline chemical equations cannot wrap; they get a scrollable box (class ce).
    const ce = !displayMode && content.includes("\\ce{") && content.length > 24 ? " ce" : "";
    return `<span class="m${displayMode ? " d" : ""}${ce}">${escapeHtml(content)}</span>`;
  },
});
// Figures: ![caption](hinh/x.svg) is inlined so it follows the app theme.
md.renderer.rules.image = (tokens, idx) => {
  const t = tokens[idx];
  const src = t.attrGet("src") || "";
  const file = path.join(figDir, src);
  if (!src.startsWith("hinh/") || !fs.existsSync(file)) {
    issues.push(`${where}: thiếu hình ${src}`);
    return "";
  }
  const svg = read(file)
    .replace(/ xmlns="[^"]*"/, "")
    .replace(/ style="[^"]*"/, "")
    .replace(/<style>[\s\S]*?<\/style>/, "")
    .replace(/<rect width="100%" height="100%" fill="#fff"\/>/, "")
    .trim();
  return `<figure class="fig">${svg}<figcaption>${escapeHtml(t.content)}</figcaption></figure>`;
};
function render(src, at) {
  where = at;
  return md.render(src.replace(/<!--[\s\S]*?-->/g, "").trim());
}
// Split text on a heading regex (needs the g flag); returns [{m, body}].
function sections(src, re) {
  const ms = [...src.matchAll(re)];
  return ms.map((m, i) => {
    const end = i + 1 < ms.length ? ms[i + 1].index : src.length;
    return { m, body: src.slice(m.index + m[0].length, end).replace(/\n-{3,}\s*$/, "").trim() };
  });
}
// Text after the line matching startRe, up to the line matching endRe.
function between(src, startRe, endRe) {
  const s = src.search(startRe);
  if (s < 0) throw new Error(`missing ${startRe}`);
  const rest = src.slice(s).replace(startRe, "");
  const e = endRe ? rest.search(endRe) : -1;
  return (e < 0 ? rest : rest.slice(0, e)).replace(/\n-{3,}\s*$/, "").trim();
}
const inline = (s, at) => ((where = at), md.renderInline(s));

function buildTopic(subject, dir) {
  const slug = dir.replace(/^\d\d-/, "");
  const id = `${subject.id}-${slug}`;
  const number = +dir.slice(0, 2);
  const base = path.join(contentDir, subject.id, dir);
  figDir = base;
  const lesson = read(path.join(base, "bai-hoc.md"));
  const title = lesson.match(/^# (.+)$/m)[1].replace(/^Chủ đề \d+\.\s*/, "");
  const short = SHORT[`${subject.id}-${slug}`] || title.split(":")[0].replace(/\s*\(.*\)\s*$/, "").trim();
  const lead = between(lesson, /^# .+$/m, /^## I\./m);

  const knowledge = [];
  const part1 = between(lesson, /^## I\..*$/m, /^## II\./m);
  const part2 = between(lesson, /^## II\..*$/m, /^## III\./m);
  for (const [level, part] of [[1, part1], [2, part2]]) {
    for (const [i, s] of sections(part, /^### (.+)$/gm).entries()) {
      knowledge.push({
        level,
        title: inline(s.m[1].replace(/^\d+\.\s*/, ""), `${id} tiêu đề ${level}.${i + 1}`),
        html: render(s.body, `${id} kiến thức ${level}.${i + 1}`),
      });
    }
  }
  const intro = render(lead, `${id} intro`);

  const partIII = between(lesson, /^## III\..*$/m, /^## IV\./m);
  const partIV = between(lesson, /^## IV\..*$/m, null);
  const solutions = Object.fromEntries(sections(partIV, /^### Bài (\d+)\s*$/gm).map((s) => [s.m[1], s.body]));
  const hints = Object.fromEntries(
    sections(read(path.join(base, "goi-y.md")), /^## Bài (\d+) \| (\d)\s*$/gm).map((s) => {
      const [head, ...hs] = s.body.split(/^### Gợi ý \d+\s*$/m);
      return [s.m[1], { stars: +s.m[2], idea: head.replace(/^\*\*Ý tưởng:\*\*\s*/m, "").trim(), hints: hs.map((h) => h.trim()) }];
    }),
  );
  // Text before "**Bài 1" (e.g. atomic masses) is shown above the problem list.
  const firstProblem = partIII.search(/^\*\*Bài \d+/m);
  const problemsNote = firstProblem > 0 ? render(partIII.slice(0, firstProblem), `${id} ghi chú bài tập`) : "";
  const problems = sections(partIII, /^\*\*Bài (\d+) \(((?:[^()]|\([^()]*\))*)\)\.\*\*/gm).map((s) => {
    const n = s.m[1];
    const [lv, ...rest] = s.m[2].split(",").map((x) => x.trim());
    if (!/^(Cơ bản|Nâng cao)$/.test(lv)) throw new Error(`${id}: Bài ${n} thiếu nhãn Cơ bản/Nâng cao`);
    const h = hints[n];
    if (!solutions[n]) throw new Error(`${id}: thiếu lời giải Bài ${n}`);
    if (!h) throw new Error(`${id}: thiếu gợi ý Bài ${n}`);
    const w = `${id} bài ${n}`;
    return {
      n: +n,
      level: lv === "Nâng cao" ? 2 : 1,
      tag: rest.join(", "),
      stars: h.stars,
      statement: render(s.body, w),
      idea: render(h.idea, w + " ý tưởng"),
      hints: h.hints.map((x, i) => render(x, `${w} gợi ý ${i + 1}`)),
      solution: render(solutions[n], w + " lời giải"),
    };
  });
  const extra = Object.keys(hints).filter((n) => !problems.some((p) => p.n === +n));
  if (extra.length) throw new Error(`${id}: gợi ý cho bài không tồn tại: ${extra.join(", ")}`);

  const cardsSrc = read(path.join(base, "the-ghi-nho.md")).replace(/<!--[\s\S]*?-->/g, "");
  const cards = [];
  for (const g of sections(cardsSrc, /^## (.+)$/gm)) {
    const level = /\(nâng cao\)/i.test(g.m[1]) ? 2 : 1;
    const group = g.m[1].replace(/\s*\(nâng cao\)\s*/i, "").trim();
    for (const c of sections(g.body, /^### (.+)$/gm)) {
      const front = c.m[1].trim();
      cards.push({
        id: crypto.createHash("sha1").update(front).digest("hex").slice(0, 10),
        level,
        group,
        front: render(front, `${id} thẻ`),
        back: render(c.body, `${id} thẻ: ${front}`),
      });
    }
  }
  if (new Set(cards.map((c) => c.id)).size !== cards.length) throw new Error(`${id}: hai thẻ trùng mặt trước`);
  return { id, subject: subject.id, number, title, short, intro, knowledge, problemsNote, problems, cards };
}

// ---------- write dist ----------
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "katex/fonts"), { recursive: true });

const subjects = SUBJECTS.map((s) => {
  const dir = path.join(contentDir, s.id);
  const topicDirs = fs.existsSync(dir) ? fs.readdirSync(dir).filter((d) => /^\d\d-/.test(d)).sort() : [];
  return { ...s, topics: topicDirs.map((d) => buildTopic(s, d)) };
});
const data = { built: new Date().toISOString().slice(0, 10), subjects };
fs.writeFileSync(path.join(dist, "data.js"), "window.APP_DATA = " + JSON.stringify(data) + ";\n");

for (const f of fs.readdirSync(path.join(root, "src"))) fs.cpSync(path.join(root, "src", f), path.join(dist, f), { recursive: true });
const katexDist = path.join(root, "node_modules/katex/dist");
for (const f of ["katex.min.css", "katex.min.js", "contrib/mhchem.min.js"]) fs.copyFileSync(path.join(katexDist, f), path.join(dist, "katex", path.basename(f)));
for (const f of fs.readdirSync(path.join(katexDist, "fonts")).filter((f) => f.endsWith(".woff2"))) {
  fs.copyFileSync(path.join(katexDist, "fonts", f), path.join(dist, "katex/fonts", f));
}
fs.writeFileSync(path.join(dist, ".nojekyll"), "");

// Service worker: precache every file, versioned by content hash.
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name !== "sw.js" && !f.name.startsWith(".")) files.push(path.relative(dist, p));
  }
})(dist);
files.sort();
const hash = crypto.createHash("sha1");
for (const f of files) hash.update(f).update(fs.readFileSync(path.join(dist, f)));
const version = hash.digest("hex").slice(0, 12);
const swPath = path.join(dist, "sw.js");
fs.writeFileSync(
  swPath,
  read(swPath).replace("__VERSION__", version).replace("__PRECACHE__", JSON.stringify(["./", ...files.map((f) => "./" + f.split(path.sep).join("/"))])),
);

for (const s of subjects) {
  for (const t of s.topics) {
    const k = (arr) => `${arr.filter((x) => x.level === 1).length}+${arr.filter((x) => x.level === 2).length}`;
    console.log(`${s.name} ${t.number}. ${t.short}: kiến thức ${k(t.knowledge)}, bài ${k(t.problems)}, thẻ ${k(t.cards)} (cơ bản+nâng cao)`);
  }
}
const kb = Math.round(fs.statSync(path.join(dist, "data.js")).size / 1024);
console.log(`data.js: ${kb} KB, files: ${files.length}, version: ${version}`);
if (issues.length) {
  console.log(`Lỗi (${issues.length}):`);
  for (const p of issues.slice(0, 30)) console.log("  " + p);
  process.exitCode = 1;
}
