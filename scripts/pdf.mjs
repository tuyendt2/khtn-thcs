// Export the whole KHTN material (README + every topic of every subject) to one PDF.
// Usage: node scripts/pdf.mjs [path/to/khtn8-9] [output.pdf]
// Needs Google Chrome (or Chromium) and the dev dependency playwright-core.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import { tex } from "@mdit/plugin-tex";
import katex from "katex";
import "katex/contrib/mhchem";
import { chromium } from "playwright-core";

const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(process.argv[2] || path.join(here, "../khtn8-9"));
const out = path.resolve(process.argv[3] || path.join(root, "khtn8-9.pdf"));
const CHROME = process.env.CHROME || ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find((p) => fs.existsSync(p));
const SUBJECTS = [["vat-li", "Vật lí"], ["hoa-hoc", "Hóa học"], ["sinh-hoc", "Sinh học"]];

let current = "";
const md = new MarkdownIt({ html: false }).use(tex, {
  render: (content, displayMode) => katex.renderToString(content, { displayMode, throwOnError: false, strict: "ignore" }),
});
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const t = tokens[idx], src = t.attrGet("src") || "";
  if (!/^(https?|file):/.test(src)) t.attrSet("src", "file://" + path.join(root, path.dirname(current), src));
  t.attrSet("alt", t.content);
  return self.renderToken(tokens, idx, options);
};
// Links between .md files become in-document anchors.
const idOf = (rel) => "f-" + rel.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet("href") || "";
  if (/\.md$/.test(href)) tokens[idx].attrSet("href", "#" + idOf(path.normalize(path.join(path.dirname(current), href))));
  return self.renderToken(tokens, idx, options);
};

const sections = [];
const toc = [];
const add = (rel, cls = "") => {
  current = rel;
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  sections.push(`<section class="doc ${cls}" id="${idOf(rel)}">${md.render(src)}</section>`);
  return (src.match(/^# (.+)$/m) || [, rel])[1];
};
add("README.md");
for (const [id, name] of SUBJECTS) {
  const dir = path.join(root, id);
  if (!fs.existsSync(dir)) continue;
  const topics = fs.readdirSync(dir).filter((d) => /^\d\d-/.test(d)).sort();
  if (!topics.length) continue;
  sections.push(`<section class="doc subject"><h1 class="subject-title">${name}</h1></section>`);
  toc.push({ subject: name });
  for (const t of topics) {
    const file = fs.readdirSync(path.join(dir, t)).find((f) => f.endsWith(".md"));
    const rel = path.join(id, t, file);
    toc.push({ id: idOf(rel), title: add(rel) });
  }
}
const tocHtml = `<section class="doc toc"><h1>Mục lục</h1><ul>${toc
  .map((x) => (x.subject ? `<li class="sub">${x.subject}</li>` : `<li><a href="#${x.id}">${x.title}</a></li>`)).join("")}</ul></section>`;
sections.splice(1, 0, tocHtml);

const css = path.join(here, "node_modules/katex/dist/katex.min.css");
const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>KHTN 8–9</title>
<link rel="stylesheet" href="file://${css}"><style>
  body { font-family: "Noto Serif", "DejaVu Serif", serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; }
  section.doc { break-before: page; } section.doc:first-of-type { break-before: auto; }
  h1 { font-size: 20pt; color: #0f6b5c; border-bottom: 2px solid #0f6b5c; padding-bottom: 4px; }
  h2 { font-size: 15pt; color: #0f6b5c; margin-top: 1.4em; break-after: avoid; }
  h3 { font-size: 12.5pt; margin-top: 1.2em; break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
  table { border-collapse: collapse; margin: .8em 0; font-size: 10pt; break-inside: avoid; }
  th, td { border: 1px solid #999; padding: 4px 7px; vertical-align: top; } th { background: #e3f3ef; }
  blockquote { margin: .8em 0; padding: .4em .9em; border-left: 4px solid #3aa38f; background: #eef7f4; }
  blockquote p { margin: .3em 0; }
  .katex-display { margin: .6em 0; } .katex { font-size: 1.05em; }
  a { color: #0f6b5c; text-decoration: none; } hr { border: none; border-top: 1px solid #bbb; margin: 1.5em 0; }
  p:has(> img) { text-align: center; break-inside: avoid; }
  p:has(> img) img { display: block; margin: .3em auto; max-width: 75%; max-height: 80mm; }
  .subject { display: flex; align-items: center; justify-content: center; height: 230mm; }
  .subject-title { font-size: 40pt; border: none; text-align: center; }
  .toc ul { list-style: none; padding: 0; line-height: 2; font-size: 12pt; } .toc li.sub { font-weight: bold; color: #0f6b5c; margin-top: .6em; }
  .toc li:not(.sub) { padding-left: 1.2em; }
</style></head><body>${sections.join("\n")}</body></html>`;
const tmp = path.join(path.dirname(out), ".khtn-pdf.html");
fs.writeFileSync(tmp, html);
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage();
await page.goto("file://" + tmp, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: out, format: "A4", printBackground: true, displayHeaderFooter: true,
  headerTemplate: `<div style="font-size:8px;width:100%;text-align:center;color:#777;font-family:serif">KHTN 8 – 9: Vật lí, Hóa học, Sinh học từ cơ bản đến nâng cao</div>`,
  footerTemplate: `<div style="font-size:9px;width:100%;text-align:center;color:#555;font-family:serif"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
  margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
});
await browser.close();
fs.rmSync(tmp);
console.log(`Đã xuất ${out}`);
