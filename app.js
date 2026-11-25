(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WA = "https://wa.me/972509110414?text=";
  const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  window.smReady = true;

  /* header: clear over a full-screen hero, solid white once the page moves */
  const barEl = $("[data-bar]");
  /* it also steps out of the way on the way down and comes straight back on the way up */
  let lastY = scrollY;
  const onScroll = () => {
    if (!barEl) return;
    const y = Math.max(0, scrollY), open = barEl.classList.contains("is-open");
    barEl.classList.toggle("is-down", y > 8);
    if (Math.abs(y - lastY) < 6) return;
    const hide = !open && y > lastY && y > 120;
    barEl.classList.toggle("is-hidden", hide);
    document.documentElement.classList.toggle("bar-hidden", hide);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* menu sheet */
  const menuBtn = $("[data-menu]"), sheet = $("[data-sheet]");
  const setMenu = (open) => {
    if (!sheet) return;
    sheet.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    barEl?.classList.toggle("is-open", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
  };
  menuBtn?.addEventListener("click", () => setMenu(sheet.hidden));
  sheet?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && sheet && !sheet.hidden) { setMenu(false); menuBtn.focus(); } });
  matchMedia("(min-width: 960px)").addEventListener("change", () => setMenu(false));

  /* phone dock: on the home page it waits until the hero buttons scroll away */
  const dock = $("[data-dock]"), door = $("[data-door]");
  if (dock) {
    if (door) new IntersectionObserver(([e]) => dock.toggleAttribute("data-away", e.isIntersecting)).observe(door);
    else dock.removeAttribute("data-away");
  }

  /* hero: one entrance, and the film */
  const hero = $(".hero"), film = $("[data-film]"), filmBtn = $("[data-film-toggle]");
  const lift = () => hero?.classList.add("is-in");
  requestAnimationFrame(() => requestAnimationFrame(lift));
  setTimeout(lift, 400); /* frames do not run in a background tab; the timer still does */
  if (film) {
    const setFilm = (play) => { if (play) film.play().catch(() => {}); else film.pause(); filmBtn?.setAttribute("aria-pressed", String(!play)); filmBtn && (filmBtn.querySelector(".sr").textContent = play ? "עצירת הסרט" : "הפעלת הסרט"); };
    if (calm || navigator.connection?.saveData) setFilm(false);
    else { film.preload = "auto"; setFilm(true); }
    filmBtn?.addEventListener("click", () => setFilm(film.paused));
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && !film.paused) film.pause(); else if (e.isIntersecting && filmBtn?.getAttribute("aria-pressed") === "false") film.play().catch(() => {}); }).observe(film);
  }

  /* open now, and today's row */
  const HOURS = { 0: [660, 1200], 1: [480, 1140], 2: [610, 1140], 3: [660, 1200], 4: [610, 1140] };
  const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
  const day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes(), h = HOURS[day];
  const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  let openTxt, isOpen = false;
  if (h && mins >= h[0] && mins < h[1]) { isOpen = true; openTxt = `פתוח עכשיו, עד ${fmt(h[1])}`; }
  else if (h && mins < h[0]) openTxt = `סגור עכשיו, נפתח היום ב-${fmt(h[0])}`;
  else { let d = day; do { d = (d + 1) % 7; } while (!HOURS[d]); openTxt = `סגור עכשיו, נפתח ביום ${DAYS[d]} ב-${fmt(HOURS[d][0])}`; }
  $$("[data-open]").forEach((el) => { el.textContent = openTxt; el.hidden = false; el.classList.toggle("is-closed", !isOpen); });
  $(`.hours tr[data-day="${day}"]`)?.classList.add("is-today");

  /* each section builds itself as it arrives: its pieces rise and fade in, one after the other */
  if (!calm && "IntersectionObserver" in window) {
    const RISE = ".sec__head > *, .phead__in > *, .ahero__copy > *, .world, .voice, .strip > li, .grid > li, .qa__i, .split__copy > *, .course, .svc, .chapter__head > *, .essay, .vows li, .road__i, .facts li, .pickcard, .creed__q span, .creed__by, .close .wrap > *, .hours, .contact a, .list__k, .finder > *, .pair figure, .cert > *, .swork figure, .ncard, .rings > li, .ladder > *, .story__copy > .h1, .story__copy > .quote, .story__copy > .lead, .story__copy > .h2";
    const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-up"); rio.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
    $$(RISE).forEach((el) => {
      const i = [...el.parentElement.children].indexOf(el);
      el.classList.add("rise");
      el.style.setProperty("--d", `${Math.min(i, 6) * 80}ms`);
      rio.observe(el);
    });
  }

  /* pictures open once as they arrive */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  /* gallery filter */
  const NOTES = {
    all: "",
    stiletto: "צורת שפיץ לא משייפים על ציפורן קצרה: השיוף פוגע בקירות הציפורן, מוציא אותה מפרופורציה ומחליש אותה.",
    almond: "כדי להצר ציפורן קצרה לשקד מוותרים על חלק מהקירות התומכים, ולכן שקד דורש אורך.",
    square: "מרובע הוא המבחן: מי ששולטת בו יודעת לשייף גם כל צורה אחרת.",
    round: "קו רך ועגול, שמתאים גם כשהציפורן הטבעית קצרה.",
    squoval: "מרובע שהפינות שלו מעוגלות, ונראה נקי בכל אורך.",
    ballerina: "בנייה ארוכה שמסתיימת בקצה ישר, בשיטת הטיפסים ההפוכים.",
  };
  const grid = $("[data-grid]"), more = $("[data-more]"), note = $("[data-shape-note]");
  if (grid) {
    const PAGE = matchMedia("(min-width: 1100px)").matches ? 12 : matchMedia("(min-width: 700px)").matches ? 12 : 8;
    let shape = "all", showAll = false;
    const paint = () => {
      const match = $$(".tile", grid).filter((t) => { const ok = shape === "all" || t.dataset.shape === shape; if (!ok) t.hidden = true; return ok; });
      match.forEach((t, i) => (t.hidden = !(showAll || i < PAGE)));
      if (more) more.hidden = showAll || match.length <= PAGE;
      if (note) note.textContent = NOTES[shape] || "";
    };
    $$("button[data-shape]").forEach((b) => b.addEventListener("click", () => {
      shape = b.dataset.shape; showAll = false;
      $$("button[data-shape]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      paint();
    }));
    more?.addEventListener("click", () => { showAll = true; paint(); });
    paint();
  }

  /* lightbox */
  const lb = $("dialog[data-lb]");
  if (lb) {
    const fig = $("[data-lb-img]", lb), cap = $("[data-lb-cap]", lb);
    let list = [], i = 0;
    const show = (n) => {
      i = (n + list.length) % list.length;
      const b = list[i];
      fig.src = `assets/img/${b.dataset.lb}-800.webp`;
      fig.alt = b.querySelector("img")?.alt || "";
      cap.textContent = b.dataset.cap || "";
    };
    document.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lb]");
      if (!b) return;
      const scope = b.closest("[data-lb-scope]") || document;
      list = $$("button[data-lb]", scope).filter((x) => !x.closest("[hidden]"));
      show(list.indexOf(b));
      lb.showModal();
    });
    $("[data-lb-prev]", lb).addEventListener("click", () => show(i - 1));
    $("[data-lb-next]", lb).addEventListener("click", () => show(i + 1));
    $("[data-lb-close]", lb).addEventListener("click", () => lb.close());
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(i + 1); if (e.key === "ArrowRight") show(i - 1); });
  }

  /* treatments: tick what you want, the visit adds itself up and goes to WhatsApp */
  const bar = $("[data-visit]");
  if (bar) {
    const picks = $$("[data-pick]"), listEl = $("[data-visit-list]", bar), sumEl = $("[data-visit-sum]", bar), waEl = $("[data-visit-wa]", bar);
    const paint = () => {
      const on = picks.filter((b) => b.getAttribute("aria-pressed") === "true");
      bar.hidden = !on.length;
      dock?.toggleAttribute("data-away", !!on.length);
      if (!on.length) return;
      let lo = 0, hi = 0;
      on.forEach((b) => { lo += +b.dataset.lo; hi += +(b.dataset.hi || b.dataset.lo); });
      const sum = lo === hi ? `${lo} ₪` : `${lo}–${hi} ₪`;
      const names = on.map((b) => b.dataset.name);
      listEl.textContent = names.join(" · ");
      sumEl.textContent = sum;
      waEl.href = WA + encodeURIComponent(`שלום שחר, אני רוצה לקבוע תור לטיפולים האלה:\n${names.map((n) => "• " + n).join("\n")}\nהסכום לפי המחירון: ${sum}`);
    };
    picks.forEach((b) => b.addEventListener("click", () => { const p = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(p)); b.setAttribute("aria-label", `${p ? "הסרת" : "הוספת"} ${b.dataset.name} ${p ? "מהתור" : "לתור"}`); paint(); }));
    $("[data-visit-clear]", bar).addEventListener("click", () => { picks.forEach((b) => b.setAttribute("aria-pressed", "false")); paint(); });
  }

  /* jump rows mark the chapter being read */
  const jump = $("[data-jump]");
  if (jump) {
    const links = $$("a[href^='#']", jump), map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => a.classList.remove("is-on")); const a = map.get(e.target.id); a?.classList.add("is-on"); if (a) { /* move only the chip row sideways; scrollIntoView here also scrolled the page and fought the reader */ const row = a.closest(".chips"); if (row && row.scrollWidth > row.clientWidth) { const ar = a.getBoundingClientRect(), rr = row.getBoundingClientRect(); row.scrollTo({ left: row.scrollLeft + (ar.left + ar.width / 2) - (rr.left + rr.width / 2), behavior: calm ? "auto" : "smooth" }); } } } }), { rootMargin: "-30% 0px -60% 0px" });
    map.forEach((_, id) => { const el = document.getElementById(id); el && spy.observe(el); });
  }

  /* academy: levels */
  const tabs = $$("[data-level]");
  if (tabs.length) {
    const setLevel = (id) => { tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.level === id))); $$("[data-level-panel]").forEach((p) => (p.hidden = p.dataset.levelPanel !== id)); };
    tabs.forEach((t) => t.addEventListener("click", () => setLevel(t.dataset.level)));
    setLevel(tabs[0].dataset.level);
  }
  /* a link to a course opens its syllabus */
  const openCourse = () => { const el = location.hash && document.getElementById(location.hash.slice(1)); if (el && el.classList && el.classList.contains("course")) { const d = $("details.syl", el); if (d) d.open = true; } };
  addEventListener("hashchange", openCourse); openCourse();
  $$("[data-syl-close]").forEach((b) => b.addEventListener("click", () => { const d = b.closest("details"); d.open = false; d.closest(".course").scrollIntoView({ block: "start" }); }));
  $$("[data-kit]").forEach((f) => f.addEventListener("change", () => { const a = $("[data-syl-go]", f.closest(".syl")); const v = $("input:checked", f)?.value; if (a && v) a.href = WA + encodeURIComponent(`היי שחר, הגעתי מהאתר. אשמח לשריין מקום ל-${a.dataset.course} (${v}).`); }));

  /* the course finder */
  const form = $("[data-finder]");
  if (form) {
    const RES = {
      "First Step": "לומדים מהיסוד מניקור ולק ג׳ל: איך בנויה הציפורן, מניקור יבש ומכשירי, מריחה מדויקת ומבנה אנטומי. 4 מפגשים, אחת על אחת.",
      "Pro Touch": "המסלול הרחב למתחילות: מניקור, לק ג׳ל ובניית ציפורניים בג׳ל. נכנסים בלי ידע קודם, ומסיימים עם מקצוע ועם ביטחון. 6 מפגשים, אחת על אחת.",
      "Set Up": "קורס בנייה בג׳ל למי שכבר עובדת בלק ג׳ל: טיפס הפוך, בנייה בקליק, מילוי ותיקונים. 3 מפגשים, אחת על אחת.",
      "Underline": "השתלמות במניקור ג׳ל: סדר העבודה הנכון, מניקור בראש אחד, ומריחה אחידה שיושבת צמוד ומחזיקה. 5–6 שעות, 1:1.",
      "Fix It": "השתלמות בבנייה בג׳ל למי שכבר בונה: קליק אחד, הנחת ג׳ל מדויקת ללא נזילות, וזוויות הצמדה נכונות. 5–6 שעות, 1:1.",
      "Pure Pedicure": "פדיקור קוסמטי וטיפולי: היגיינה ועיקור, ציפורן חודרנית, יבלות וציפורניים עבות, ומה שולחים לרופא. 5 מפגשים, וציוד פדיקור במתנה.",
    };
    const WHERE = { new: "אין לי ניסיון, אני מתחילה מההתחלה", pro: "יש לי ניסיון בתחום, ואני רוצה להשתפר", pedi: "יש לי ניסיון בתחום, ואני רוצה להוסיף פדיקור" };
    const steps = { s1: $('[data-step="1"]', form), n: $('[data-step="2new"]', form), p: $('[data-step="2pro"]', form), s3: $('[data-step="3"]', form) };
    const res = $("[data-result]", form), back = $("[data-back]", form), dots = $$(".dots li", form);
    let path = [], state = {}, started = false; /* no focus on load: focusing would scroll the page down to the finder */
    const go = (el, push = true) => {
      [...Object.values(steps), res].forEach((x) => (x.hidden = x !== el));
      if (el !== res) { if (push) path.push(el); $$("input", el).forEach((i) => (i.checked = false)); }
      back.hidden = path.length <= 1 && el !== res;
      const n = el === steps.s1 ? 1 : el === steps.s3 ? 3 : el === res ? 3 : 2;
      dots.forEach((d, i) => d.classList.toggle("is-on", i < n));
      if (started) (el === res ? $("[data-result-name]", form) : $("legend", el))?.focus?.({ preventScroll: true });
    };
    form.addEventListener("change", (e) => {
      const i = e.target; if (i.type !== "radio") return;
      state[i.name] = i.value;
      if (i.name === "where") { if (i.value === "pedi") { state.goal = "Pure Pedicure"; go(steps.s3); } else go(i.value === "new" ? steps.n : steps.p); }
      else if (i.name === "goal") go(steps.s3);
      else if (i.name === "when") {
        $("[data-result-name]", form).textContent = state.goal;
        $("[data-result-why]", form).textContent = RES[state.goal];
        $("[data-result-wa]", form).href = WA + encodeURIComponent(`היי שחר, מילאתי את השאלון באתר.\n${WHERE[state.where]}.\nהמסלול שהתאים לי: ${state.goal}.\nנוח לי ללמוד ${state.when}.\nאשמח שנתאם שיחת התאמה.`);
        $("[data-result-syl]", form).href = "#" + state.goal.toLowerCase().replace(/ /g, "-");
        go(res);
      }
    });
    back.addEventListener("click", () => { if (!res.hidden) return go(path[path.length - 1], false); path.pop(); go(path[path.length - 1], false); });
    $("[data-restart]", form).addEventListener("click", () => { path = []; state = {}; go(steps.s1); });
    form.addEventListener("submit", (e) => e.preventDefault());
    go(steps.s1);
    started = true;
  }

  /* the certificate takes her name */
  const certIn = $("[data-cert-in]"), certName = $("[data-cert-name]");
  certIn?.addEventListener("input", () => { certName.textContent = certIn.value.replace(/[^A-Za-z .'-]/g, "").slice(0, 28) || "Your Name"; });

  /* concept page: the nail builds itself as the page scrolls */
  const nb = $("[data-nb]");
  if (nb && !calm) {
    const parts = $$("[data-at]", nb), steps = $$(".nb__step", nb), bars = $$(".nb__bars i", nb), N = steps.length;
    const clamp = (v) => Math.min(1, Math.max(0, v));
    let ticking = false, want = 0;
    /* film variant: frames of the build, drawn to a canvas and tied to the scroll position */
    const cv = $("canvas[data-seq]", nb), seq = cv && { n: +cv.dataset.count, ctx: cv.getContext("2d"), imgs: [] };
    const drawFrame = (f) => {
      for (let d = 0; d < seq.n; d++) { /* nearest frame that has arrived */
        const im = seq.imgs[f - d] || seq.imgs[f + d];
        if (im && im.complete && im.naturalWidth) { seq.ctx.drawImage(im, 0, 0, cv.width, cv.height); cv.classList.add("is-ready"); return; }
      }
    };
    if (seq) for (let i = 0; i < seq.n; i++) { const im = new Image(); im.decoding = "async"; im.onload = () => { if (Math.abs(i - want) < 3) drawFrame(want); }; im.src = `${cv.dataset.seq}${String(i).padStart(3, "0")}.webp`; seq.imgs.push(im); }
    const paint = () => {
      ticking = false;
      const r = nb.getBoundingClientRect(), total = r.height - innerHeight;
      const p = clamp(-r.top / total) * N, cur = Math.min(N - 1, Math.floor(p));
      steps.forEach((s, i) => s.classList.toggle("is-on", i === cur));
      bars.forEach((b, i) => b.style.setProperty("--p", clamp(p - i)));
      if (seq) { want = Math.round(clamp(-r.top / total) * (seq.n - 1)); drawFrame(want); }
      parts.forEach((el) => {
        const local = clamp((p - +el.dataset.at) / 0.7), kids = el.tagName === "g" ? $$(".nb-line", el) : [el];
        el.style.setProperty("--a", local);
        kids.forEach((k) => { const d = +(k.dataset.delay || 0); k.style.setProperty("--o", 1 - clamp((local - d) / (1 - d))); });
      });
    };
    window.smNailPaint = paint;
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    addEventListener("resize", paint);
    paint();
  }

  /* fit call form goes to WhatsApp */
  const lead = $("[data-lead]");
  lead?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(lead);
    const txt = `היי שחר, ראיתי את הקורסים באתר ואשמח לתאם שיחת התאמה.\nשם: ${d.get("name")}\nהשלב שלי היום: ${d.get("where")}\nהזמן שנוח לי ללמוד: ${d.get("when")}`;
    window.open(WA + encodeURIComponent(txt), "_blank", "noopener");
  });
})();
