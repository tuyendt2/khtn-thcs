// Draw all KHTN figures and write them as standalone SVG files into the source
// material: <subject>/<topic>/hinh/<name>.svg (default source ../khtn8-9).
// Usage: node scripts/figures.mjs [path/to/khtn8-9]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { standalone } from "./figlib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const src = path.resolve(process.argv[2] || path.join(root, "../khtn8-9"));

let n = 0;
const missing = [];
for (const mod of ["fig-vat-li.mjs", "fig-hoa-hoc.mjs", "fig-sinh-hoc.mjs"]) {
  if (!fs.existsSync(path.join(here, mod))) continue;
  const { FIGS } = await import(pathToFileURL(path.join(here, mod)).href);
  for (const [dir, figs] of Object.entries(FIGS)) {
    if (!fs.existsSync(path.join(src, dir))) { missing.push(dir); continue; }
    fs.mkdirSync(path.join(src, dir, "hinh"), { recursive: true });
    for (const [name, make] of Object.entries(figs)) {
      fs.writeFileSync(path.join(src, dir, "hinh", `${name}.svg`), standalone(make().svg) + "\n");
      n++;
    }
  }
}
console.log(`Đã ghi ${n} hình vào ${src}`);
if (missing.length) console.log(`Bỏ qua (chưa có thư mục chủ đề): ${missing.join(", ")}`);
