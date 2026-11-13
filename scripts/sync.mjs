// Copy lessons and figures from the source folder (default ../khtn8-9) into content/.
// Each topic folder keeps its lesson as bai-hoc.md and its figures in hinh/;
// goi-y.md and the-ghi-nho.md live only in the app and are left untouched.
// Usage: node scripts/sync.mjs [path/to/khtn8-9]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.resolve(process.argv[2] || path.join(root, "../khtn8-9"));
if (!fs.existsSync(src)) {
  console.error(`Không thấy thư mục nguồn: ${src}`);
  process.exit(1);
}

let n = 0;
for (const subject of ["vat-li", "hoa-hoc", "sinh-hoc"]) {
  const sdir = path.join(src, subject);
  if (!fs.existsSync(sdir)) continue;
  for (const dir of fs.readdirSync(sdir).filter((d) => /^\d\d-/.test(d)).sort()) {
    const from = path.join(sdir, dir), to = path.join(root, "content", subject, dir);
    fs.mkdirSync(to, { recursive: true });
    const lesson = fs.readdirSync(from).find((f) => f.endsWith(".md"));
    fs.copyFileSync(path.join(from, lesson), path.join(to, "bai-hoc.md"));
    n++;
    if (fs.existsSync(path.join(from, "hinh"))) {
      fs.rmSync(path.join(to, "hinh"), { recursive: true, force: true });
      fs.cpSync(path.join(from, "hinh"), path.join(to, "hinh"), { recursive: true });
      n += fs.readdirSync(path.join(to, "hinh")).length;
    }
    for (const f of ["goi-y.md", "the-ghi-nho.md"]) {
      if (!fs.existsSync(path.join(to, f))) console.warn(`  Chưa có ${subject}/${dir}/${f}`);
    }
  }
}
console.log(`Đã chép ${n} file từ ${src}`);
