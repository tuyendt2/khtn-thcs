// KHTN 8–9: an offline study app for Physics, Chemistry and Biology.
// No framework; routes live in the URL hash.
(() => {
  "use strict";
  const DATA = window.APP_DATA;
  const SUBJECTS = DATA.subjects;
  const SUBJECT = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));
  const TOPICS = SUBJECTS.flatMap((s) => s.topics.map((t) => Object.assign(t, { s })));
  const TOPIC = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
  const ALL_CARDS = TOPICS.flatMap((t) => t.cards.map((c) => ({ ...c, t })));
  const app = document.getElementById("app");
  const DAY = 86400000;
  const BOX_DAYS = [0, 1, 3, 7, 14, 30]; // Leitner box -> days until next review
  const ROUND = 20; // cards per review round
  const LEVELS = { all: "Tất cả", 1: "Cơ bản", 2: "Nâng cao" };

  // ---------- progress, stored on this device only ----------
  const KEY = "khtn-progress-v1";
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { S = {}; }
  S.cards ||= {};
  S.problems ||= {};
  S.prefs ||= {};
  const save = () => localStorage.setItem(KEY, JSON.stringify(S));
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const level = () => S.prefs.level || "all";
  const inLevel = (x) => level() === "all" || String(x.level) === level();
  const cardState = (c) => S.cards[`${c.t.id}:${c.id}`];
  const probState = (t, p) => S.problems[`${t.id}:${p.n}`];
  const isNew = (c) => !cardState(c);
  const isDueReview = (c) => { const st = cardState(c); return st && st.due <= today(); };
  const needsRedo = (t, p) => { const st = probState(t, p); return st && st.review && st.review <= today(); };
  // Cards of a scope ("all", a subject id or a topic id), filtered by the chosen level.
  const cardsOf = (scope) =>
    ALL_CARDS.filter((c) => (scope === "all" || c.t.id === scope || c.t.s.id === scope) && inLevel(c));

  function applyPrefs() {
    const theme = S.prefs.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.font = String(S.prefs.font || 0);
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#15302a" : "#0f6b5c";
  }
  applyPrefs();

  // ---------- helpers ----------
  const stars = (n) => "★".repeat(n) + "☆".repeat(4 - n);
  const date = (ms) => new Date(ms).toLocaleDateString("vi-VN");
  const lvChip = (lv) => `<span class="lv lv${lv}">${LEVELS[lv]}</span>`;
  const STATUS = {
    solo: { label: "Tự làm được", cls: "solo" },
    hint: { label: "Nhờ gợi ý", cls: "hint" },
    fail: { label: "Chưa làm được", cls: "fail" },
  };
  const statusBadge = (t, p) => {
    const st = probState(t, p);
    if (!st) return "";
    return `<span class="st ${STATUS[st.status].cls}">${needsRedo(t, p) ? "Làm lại" : STATUS[st.status].label}</span>`;
  };
  const header = (title, back) => `
    <header class="top">
      ${back ? `<a href="${back}" aria-label="Quay lại">‹</a>` : `<span style="width:8px"></span>`}
      <h1>${title}</h1>
      <button data-act="font" aria-label="Cỡ chữ">Aa</button>
      <button data-act="theme" aria-label="Đổi giao diện sáng/tối">◐</button>
    </header>`;
  const levelBar = () => `<div class="seg" role="group" aria-label="Chọn level">${Object.entries(LEVELS)
    .map(([k, v]) => `<button data-act="level" data-v="${k}" class="${level() === k ? "on" : ""}">${v}</button>`).join("")}</div>`;
  const clock = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };
  const topicStats = (t) => {
    const ps = t.problems.filter(inLevel);
    const cs = cardsOf(t.id);
    return {
      total: ps.length,
      done: ps.filter((p) => probState(t, p)).length,
      solo: ps.filter((p) => probState(t, p)?.status === "solo").length,
      redo: ps.filter((p) => needsRedo(t, p)).length,
      due: cs.filter(isDueReview).length,
      fresh: cs.filter(isNew).length,
    };
  };
  const pct = (a, b) => (b ? (100 * a) / b : 0);
  const cardCountText = (due, fresh) =>
    [due ? `${due} đến hạn` : "", fresh ? `${fresh} mới` : ""].filter(Boolean).join(" · ") || "đã ôn xong hôm nay";

  function typeset(root) {
    if (!window.katex) return;
    for (const el of root.querySelectorAll("span.m:not(.k)")) {
      const src = el.textContent;
      try {
        katex.render(src, el, { displayMode: el.classList.contains("d"), throwOnError: false, strict: "ignore" });
      } catch { el.textContent = src; }
      el.classList.add("k");
    }
  }

  // ---------- home ----------
  function home() {
    const all = TOPICS.map(topicStats);
    const total = all.reduce((a, x) => a + x.total, 0), solo = all.reduce((a, x) => a + x.solo, 0), done = all.reduce((a, x) => a + x.done, 0);
    const cs = cardsOf("all"), due = cs.filter(isDueReview).length, fresh = cs.filter(isNew).length;
    const redo = TOPICS.flatMap((t) => t.problems.filter((p) => inLevel(p) && needsRedo(t, p)).map((p) => ({ t, p })));
    return `${header("KHTN 8–9")}
    <main>
      ${levelBar()}
      <div class="card">
        <div class="grid3">
          <div><b>${done}</b><span>/${total} bài đã làm</span></div>
          <div><b>${solo}</b><span>bài tự làm được</span></div>
          <div><b>${cs.length - fresh}</b><span>/${cs.length} thẻ đã học</span></div>
        </div>
        <div class="progress"><div style="width:${pct(solo, total)}%"></div></div>
      </div>
      <a class="tile hero" href="#/on-tap/all"><span class="ico">🃏</span>
        <div><b>Ôn thẻ hôm nay</b><span>${cardCountText(due, fresh)}</span></div>
        ${due ? `<span class="badge-count">${due}</span>` : ""}</a>
      ${redo.length ? `<h2>Bài đến hạn làm lại</h2><div class="list plist">${redo.slice(0, 5)
        .map(({ t, p }) => `<a href="#/t/${t.id}/bai/${p.n}"><span class="pn">${t.s.icon}</span><span class="pt"><b>${t.short}</b> · Bài ${p.n}</span><span>${statusBadge(t, p)}</span></a>`)
        .join("")}</div>` : ""}
      <h2>Môn học</h2>
      <div class="tiles">
        ${SUBJECTS.map((s) => {
          const st = s.topics.map(topicStats), t = st.reduce((a, x) => a + x.total, 0), so = st.reduce((a, x) => a + x.solo, 0);
          return `<a class="tile subj ${s.id}" href="#/m/${s.id}"><span class="ico">${s.icon}</span>
            <div class="grow"><b>${s.name}</b><span>${s.topics.length} chủ đề · ${t} bài</span>
            <div class="progress thin"><div style="width:${pct(so, t)}%"></div></div></div></a>`;
        }).join("")}
      </div>
      <h2>Cách dùng</h2>
      <div class="card content small">
        <ol>
          <li>Chọn level ở thanh trên cùng: <b>Cơ bản</b> (theo SGK), <b>Nâng cao</b> (HSG, thi chuyên) hoặc <b>Tất cả</b>. Kiến thức, bài tập và thẻ đều được lọc theo level.</li>
          <li><b>Thẻ ghi nhớ:</b> mỗi ngày 5–10 phút. Thẻ nhớ rồi sẽ hẹn lại sau 1, 3, 7, 14, 30 ngày.</li>
          <li><b>Bài tập:</b> làm ra giấy trước. Bí thì mở <i>ý tưởng</i>, rồi <i>gợi ý 1</i>, <i>gợi ý 2</i>, cuối cùng mới xem lời giải.</li>
          <li>Làm xong, tự đánh giá. Bài "nhờ gợi ý" hẹn làm lại sau 7 ngày, bài "chưa làm được" sau 3 ngày.</li>
        </ol>
        <p class="muted">Tiến độ chỉ lưu trên máy này, không cần tài khoản.</p>
      </div>
      <details class="k"><summary>📲 Cài lên màn hình chính</summary>
        <div class="content small">
          <p id="install-slot"></p>
          <p><b>Android (Chrome):</b> bấm menu ⋮ → <i>Thêm vào màn hình chính</i> (hoặc <i>Cài đặt ứng dụng</i>).</p>
          <p><b>iPhone (Safari):</b> bấm nút Chia sẻ ⬆︎ → <i>Thêm vào MH chính</i>.</p>
          <p>Sau khi cài, app mở toàn màn hình và dùng được cả khi không có mạng.</p>
        </div>
      </details>
      <div class="foot">Cập nhật ${DATA.built} · <button data-act="reset">Xóa tiến độ</button></div>
    </main>`;
  }

  function subjectPage(s) {
    const cs = cardsOf(s.id), due = cs.filter(isDueReview).length, fresh = cs.filter(isNew).length;
    return `${header(s.name, "#/")}
    <main>
      ${levelBar()}
      <a class="tile hero" href="#/on-tap/${s.id}"><span class="ico">🃏</span>
        <div><b>Ôn thẻ ${s.name}</b><span>${cardCountText(due, fresh)}</span></div></a>
      <h2>Chủ đề</h2>
      <div class="tiles">${s.topics.map((t) => {
        const st = topicStats(t);
        return `<a class="tile" href="#/t/${t.id}"><span class="ico num-ico">${t.number}</span>
          <div class="grow"><b>${t.short}</b><span>${st.done}/${st.total} bài đã làm</span>
          <div class="progress thin"><div style="width:${pct(st.solo, st.total)}%"></div></div></div>
          ${st.redo ? `<span class="badge-count warn">${st.redo} làm lại</span>` : ""}</a>`;
      }).join("")}</div>
    </main>`;
  }

  function topicHome(t) {
    const s = topicStats(t);
    const kn = t.knowledge.filter(inLevel).length;
    return `${header(t.short, `#/m/${t.s.id}`)}
    <main>
      ${levelBar()}
      <div class="card">
        <div class="muted small">${t.s.icon} ${t.s.name} · Chủ đề ${t.number}</div>
        <h2 style="margin:.1em 0 .3em">${t.title}</h2>
        <div class="small muted">Đã làm ${s.done}/${s.total} bài · tự làm được ${s.solo}</div>
        <div class="progress"><div style="width:${pct(s.solo, s.total)}%"></div></div>
      </div>
      <div class="tiles">
        <a class="tile" href="#/t/${t.id}/kien-thuc"><span class="ico">📘</span>
          <div><b>Kiến thức</b><span>${kn} mục, có giải thích "vì sao"</span></div></a>
        <a class="tile" href="#/t/${t.id}/the"><span class="ico">🃏</span>
          <div><b>Thẻ ghi nhớ</b><span>${cardsOf(t.id).length} thẻ · ${cardCountText(s.due, s.fresh)}</span></div>
          ${s.due ? `<span class="badge-count">${s.due}</span>` : ""}</a>
        <a class="tile" href="#/t/${t.id}/bai"><span class="ico">✏️</span>
          <div><b>Bài tập</b><span>${s.total} bài, gợi ý từng bước</span></div>
          ${s.redo ? `<span class="badge-count warn">${s.redo} làm lại</span>` : ""}</a>
      </div>
    </main>`;
  }

  function knowledge(t) {
    const block = (lv, name) => {
      const items = t.knowledge.filter((k) => k.level === lv);
      if (!items.length || !(level() === "all" || level() === String(lv))) return "";
      return `<h2>${lvChip(lv)} ${name}</h2>${items.map((k, i) => `<details class="k"><summary><span class="num">${i + 1}</span><span>${k.title}</span></summary>
        <div class="content">${k.html}</div></details>`).join("")}`;
    };
    return `${header("Kiến thức", `#/t/${t.id}`)}
    <main>
      ${levelBar()}
      <h2 style="margin-top:.4em">${t.title}</h2>
      ${t.intro.trim() ? `<div class="card content small">${t.intro}</div>` : ""}
      ${block(1, "Kiến thức cơ bản")}
      ${block(2, "Kiến thức nâng cao")}
      <div class="nav"><a class="btn primary" href="#/t/${t.id}/the">Ôn bằng thẻ ghi nhớ →</a></div>
    </main>`;
  }

  // ---------- flashcards ----------
  let session = null;
  function startSession(scope, all) {
    const pool = cardsOf(scope);
    const pick = all ? [...pool].sort(() => Math.random() - 0.5) : [...pool.filter(isDueReview), ...pool.filter(isNew)];
    const queue = pick.slice(0, ROUND);
    session = { scope, lv: level(), queue, flipped: false, done: 0 };
  }
  function cards(scope) {
    if (!session || session.scope !== scope || session.lv !== level()) startSession(scope, false);
    const t = TOPIC[scope], s = SUBJECT[scope];
    const back = t ? `#/t/${t.id}` : s ? `#/m/${s.id}` : "#/";
    const title = t ? `Thẻ: ${t.short}` : s ? `Thẻ: ${s.name}` : "Ôn thẻ hôm nay";
    const top = `${header(title, back)}<main>${levelBar()}`;
    if (!session.queue.length) {
      const pool = cardsOf(scope);
      const left = pool.filter(isDueReview).length + pool.filter(isNew).length;
      const next = pool.map((c) => cardState(c)?.due).filter((d) => d > today()).sort((a, b) => a - b)[0];
      return `${top}
        <div class="card" style="text-align:center">
          <div style="font-size:2.4em">🎉</div>
          <h2>Xong một lượt</h2>
          <p class="muted">${session.done ? `Bạn vừa ôn ${session.done} thẻ.` : "Không có thẻ nào đến hạn."}
          ${left ? `<br>Còn ${left} thẻ chưa ôn hôm nay.` : next ? `<br>Lượt ôn tiếp theo: ${date(next)}.` : ""}</p>
          <div class="stack">
            ${left ? `<button class="btn primary" data-act="next-round">Ôn tiếp ${Math.min(left, ROUND)} thẻ</button>` : ""}
            ${pool.length ? `<button class="btn" data-act="all-cards">Ôn thêm ${Math.min(pool.length, ROUND)} thẻ ngẫu nhiên</button>` : ""}
            <a class="btn" href="${back}">Quay lại</a>
          </div>
        </div></main>`;
    }
    const c = session.queue[0];
    const st = cardState(c);
    return `${top}
      <div class="row small muted" style="justify-content:space-between">
        <span>Còn ${session.queue.length} thẻ</span><span>${st ? `Hộp ${st.box}/5` : "Thẻ mới"}</span></div>
      <div class="card flash" data-act="flip">
        <div class="group">${t ? "" : `${c.t.s.icon} ${c.t.short} · `}${c.group} ${c.level === 2 ? lvChip(2) : ""}</div>
        <div class="front content">${c.front}</div>
        ${session.flipped ? `<div class="back content">${c.back}</div>` : `<div class="tap">Tự nhớ lại câu trả lời, rồi chạm để lật thẻ</div>`}
      </div>
      ${session.flipped
        ? `<div class="row"><button class="btn bad" data-act="again">Chưa nhớ</button><button class="btn ok" data-act="good">Nhớ rồi</button></div>`
        : `<button class="btn primary block" data-act="flip">Lật thẻ</button>`}
    </main>`;
  }
  function rateCard(good) {
    const c = session.queue.shift();
    const key = `${c.t.id}:${c.id}`;
    const st = S.cards[key] || { box: 0 };
    if (good) {
      const box = Math.min(st.box + 1, 5);
      S.cards[key] = { box, due: today() + BOX_DAYS[box] * DAY };
      session.done++;
    } else {
      S.cards[key] = { box: 1, due: today() };
      session.queue.push(c);
    }
    session.flipped = false;
    save();
  }

  // ---------- problems ----------
  function problemList(t) {
    const ps = t.problems.filter(inLevel);
    const redo = ps.filter((p) => needsRedo(t, p));
    const row = (p) => `<a href="#/t/${t.id}/bai/${p.n}">
        <span class="pn">Bài ${p.n}</span>
        <span class="pt">${lvChip(p.level)}${p.tag ? ` <b class="small">${p.tag}</b>` : ""}<div class="content">${p.statement.replace(/<figure[\s\S]*?<\/figure>/g, "")}</div></span>
        <span style="text-align:right"><span class="stars">${stars(p.stars)}</span><br>${statusBadge(t, p)}</span></a>`;
    return `${header(`Bài tập: ${t.short}`, `#/t/${t.id}`)}
    <main>
      ${levelBar()}
      ${t.problemsNote ? `<div class="card content small">${t.problemsNote}</div>` : ""}
      ${redo.length ? `<h2>Đến hạn làm lại</h2><div class="list plist">${redo.map(row).join("")}</div>` : ""}
      <h2>${ps.length} bài</h2>
      <div class="list plist">${ps.map(row).join("")}</div>
    </main>`;
  }

  let view = { key: "", opened: 0, open: new Set() };
  const revealBlock = (id, title, html, cls = "") =>
    `<div class="reveal ${cls} ${view.open.has(id) ? "open" : ""}"><button data-act="reveal" data-id="${id}">${title}</button>
     <div class="content">${html}</div></div>`;
  function problem(t, n) {
    const list = t.problems.filter(inLevel);
    let i = list.findIndex((p) => p.n === n);
    const p = t.problems.find((x) => x.n === n);
    if (!p) return problemList(t);
    const key = `${t.id}:${n}`;
    if (view.key !== key) view = { key, opened: Date.now(), open: new Set() };
    const st = probState(t, p);
    const prev = i > 0 ? list[i - 1] : null, next = i >= 0 ? list[i + 1] : null;
    return `${header(`${t.short} · Bài ${p.n}`, `#/t/${t.id}/bai`)}
    <main>
      <div class="ptitle"><h2>Bài ${p.n}</h2>${lvChip(p.level)}<span class="stars">${stars(p.stars)}</span>
        <span class="timer" id="timer">⏱ ${clock(Date.now() - view.opened)}</span></div>
      ${p.tag ? `<div class="small muted">${p.tag}</div>` : ""}
      ${t.problemsNote ? `<div class="small muted">${t.problemsNote.replace(/<\/?p>/g, "")}</div>` : ""}
      <div class="card content">${p.statement}</div>
      ${st ? `<p class="small muted">Lần trước: ${STATUS[st.status].label} (${date(st.at)})${st.review ? ` · hẹn làm lại ${date(st.review)}` : ""}</p>` : `<p class="notice">Làm ra giấy ít nhất 15–20 phút trước khi mở gợi ý.</p>`}
      ${revealBlock("idea", "💡 Ý tưởng chính", p.idea, "idea")}
      ${p.hints.map((h, k) => revealBlock(`h${k}`, `🔎 Gợi ý ${k + 1}`, h)).join("")}
      ${revealBlock("sol", "📖 Lời giải đầy đủ", p.solution, "sol")}
      <h2>Bạn làm bài này thế nào?</h2>
      <div class="stack">
        <button class="btn ok" data-act="rate" data-v="solo">✓ Tự làm được</button>
        <button class="btn warn" data-act="rate" data-v="hint">Làm được nhờ gợi ý (làm lại sau 7 ngày)</button>
        <button class="btn bad" data-act="rate" data-v="fail">Chưa làm được (làm lại sau 3 ngày)</button>
      </div>
      <div class="nav">
        ${prev ? `<a class="btn" href="#/t/${t.id}/bai/${prev.n}">‹ Bài ${prev.n}</a>` : ""}
        ${next ? `<a class="btn" href="#/t/${t.id}/bai/${next.n}">Bài ${next.n} ›</a>` : `<a class="btn" href="#/t/${t.id}/bai">Danh sách</a>`}
      </div>
    </main>`;
  }

  // ---------- router ----------
  let tick = null;
  function route() {
    clearInterval(tick);
    const parts = location.hash.replace(/^#/, "").split("/").filter(Boolean);
    let html;
    if (parts[0] === "on-tap") html = cards(parts[1] || "all");
    else if (parts[0] === "m" && SUBJECT[parts[1]]) html = subjectPage(SUBJECT[parts[1]]);
    else if (parts[0] === "t" && TOPIC[parts[1]]) {
      const t = TOPIC[parts[1]];
      if (parts[2] === "kien-thuc") html = knowledge(t);
      else if (parts[2] === "the") html = cards(t.id);
      else if (parts[2] === "bai" && parts[3]) html = problem(t, +parts[3]);
      else if (parts[2] === "bai") html = problemList(t);
      else html = topicHome(t);
    } else html = home();
    if (!(parts[0] === "on-tap" || parts[2] === "the")) session = null;
    app.innerHTML = html;
    typeset(app);
    if (parts[2] === "bai" && parts[3]) {
      tick = setInterval(() => {
        const el = document.getElementById("timer");
        if (el) el.textContent = "⏱ " + clock(Date.now() - view.opened);
      }, 1000);
    }
    if (!parts.length) showInstall();
  }
  function rerender() { const y = scrollY; route(); scrollTo(0, y); }

  app.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const act = el.dataset.act;
    const parts = location.hash.replace(/^#/, "").split("/").filter(Boolean);
    if (act === "theme") {
      S.prefs.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      save(); applyPrefs();
    } else if (act === "font") {
      S.prefs.font = ((S.prefs.font || 0) + 1) % 3;
      save(); applyPrefs();
    } else if (act === "level") {
      S.prefs.level = el.dataset.v;
      save(); rerender();
    } else if (act === "flip") {
      if (!session.flipped) { session.flipped = true; rerender(); }
    } else if (act === "again" || act === "good") {
      rateCard(act === "good"); scrollTo(0, 0); route();
    } else if (act === "next-round") {
      startSession(session.scope, false); route();
    } else if (act === "all-cards") {
      startSession(session.scope, true); route();
    } else if (act === "reveal") {
      const id = el.dataset.id;
      if (id === "sol" && !view.open.has(id)) {
        const mins = (Date.now() - view.opened) / 60000;
        if (mins < 10 && !confirm(`Bạn mới nghĩ ${Math.max(1, Math.round(mins))} phút. Vẫn xem lời giải đầy đủ?`)) return;
      }
      view.open.has(id) ? view.open.delete(id) : view.open.add(id);
      el.parentElement.classList.toggle("open");
    } else if (act === "rate") {
      const t = TOPIC[parts[1]], n = +parts[3], v = el.dataset.v;
      const days = v === "hint" ? 7 : v === "fail" ? 3 : 0;
      S.problems[`${t.id}:${n}`] = { status: v, at: Date.now(), review: days ? today() + days * DAY : null };
      save();
      const list = t.problems.filter(inLevel), i = list.findIndex((p) => p.n === n);
      location.hash = list[i + 1] ? `#/t/${t.id}/bai/${list[i + 1].n}` : `#/t/${t.id}/bai`;
    } else if (act === "reset") {
      if (confirm("Xóa toàn bộ tiến độ thẻ ghi nhớ và bài tập trên máy này?")) { S.cards = {}; S.problems = {}; save(); route(); }
    } else if (act === "install" && deferredInstall) {
      deferredInstall.prompt(); deferredInstall = null;
    }
  });
  addEventListener("hashchange", () => { route(); scrollTo(0, 0); });

  let deferredInstall = null;
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstall = e; showInstall(); });
  function showInstall() {
    const slot = document.getElementById("install-slot");
    if (slot && deferredInstall) slot.innerHTML = `<button class="btn primary block" data-act="install">Cài ứng dụng ngay</button>`;
  }

  route();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
})();
