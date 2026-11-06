/**
 * The interaction layer, loaded by MotionBoot once the first page is idle (never in the first-load
 * JS). Unlike the motion layer it also loads with prefers-reduced-motion: these are things to do,
 * not movement; only their drawing animations are skipped then. Everything here works on the
 * server-rendered DOM by delegated listeners, so a section switch needs no re-binding.
 *
 * - A year in focus: hovering a year on the career ladder's rail, a column of "Skills in use, by
 *   year" or a cell of the kinds strip lights that year everywhere: the chapters held in it, the
 *   chart's column, the kinds cell, and the headline figures as of that year.
 * - Play: the ladder's Play button walks the career a year at a time, the same way.
 * - A selected skill's thread: a line down the ladder through every chapter that used it.
 * - Site peek: a live site's picture in the industries card opens a larger preview.
 * - Number keys 1 to 5 switch sections.
 */
import { useUiStore } from "@/state/uiStore";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const main = () => document.getElementById("main");

/* ---------------- a year in focus ---------------- */

let playing: ReturnType<typeof setInterval> | null = null;
let clearLater: ReturnType<typeof setTimeout> | null = null;

function setYear(y: number | null) {
  const m = main();
  if (!m) return;
  if (clearLater) clearTimeout(clearLater);
  for (const el of m.querySelectorAll(".is-year")) el.classList.remove("is-year");
  for (const fig of m.querySelectorAll<HTMLElement>(".kpi-value[data-by-year]")) {
    fig.dataset.orig ??= fig.textContent ?? "";
    const detail = fig.parentElement?.querySelector<HTMLElement>(".kpi-detail");
    if (detail) detail.dataset.orig ??= detail.textContent ?? "";
    if (y === null) {
      fig.textContent = fig.dataset.orig;
      if (detail) detail.textContent = detail.dataset.orig!;
    } else {
      const v = (JSON.parse(fig.dataset.byYear!) as Record<string, number>)[y];
      if (v !== undefined) fig.textContent = String(v);
      if (detail) detail.textContent = `as of ${y}`;
    }
  }
  if (y === null) {
    delete m.dataset.year;
    return;
  }
  m.dataset.year = String(y);
  for (const el of m.querySelectorAll(`[data-years~="${y}"]`)) el.classList.add("is-year");
  for (const rail of m.querySelectorAll<HTMLElement>(".cl-rail")) {
    const from = Number(rail.dataset.from);
    const to = Number(rail.dataset.to);
    const at = rail.querySelector<HTMLElement>(".cl-at");
    if (!at) continue;
    at.style.top = `${((to - y) / (to - from)) * 100}%`;
    at.dataset.y = String(y);
  }
}

/** The year under the pointer on a ladder's rail (the CV's year at the top, the first at the bottom). */
function railYear(rail: HTMLElement, clientY: number) {
  const r = rail.getBoundingClientRect();
  const from = Number(rail.dataset.from);
  const to = Number(rail.dataset.to);
  const p = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
  return Math.round(to - p * (to - from));
}

const yearSource = (t: EventTarget | null) =>
  t instanceof Element ? t.closest<HTMLElement>(".st-col[data-y], .ky > li[data-y]") : null;

function installYears() {
  document.addEventListener("pointerover", (e) => {
    if (playing) return;
    const src = yearSource(e.target);
    if (src) setYear(Number(src.dataset.y));
  });
  document.addEventListener("pointerout", (e) => {
    if (playing) return;
    if (yearSource(e.target) && !yearSource(e.relatedTarget)) setYear(null);
  });
  document.addEventListener("focusin", (e) => {
    if (playing) return;
    const src = yearSource(e.target);
    if (src) setYear(Number(src.dataset.y));
  });
  document.addEventListener("focusout", (e) => {
    if (playing) return;
    if (yearSource(e.target) && !yearSource(e.relatedTarget)) setYear(null);
  });
  document.addEventListener("pointermove", (e) => {
    if (playing) return;
    const rail = (e.target as Element).closest?.<HTMLElement>(".cl-rail");
    if (rail) setYear(railYear(rail, e.clientY));
  });
  document.addEventListener(
    "pointerleave",
    (e) => {
      if (playing) return;
      if ((e.target as Element).classList?.contains("cl-rail")) setYear(null);
    },
    true,
  );
}

/* ---------------- play ---------------- */

function stop(button: HTMLButtonElement | null, hold: boolean) {
  if (playing) clearInterval(playing);
  playing = null;
  if (button) {
    button.setAttribute("aria-pressed", "false");
    button.querySelector(".cl-play-label")!.textContent = "Play";
  }
  if (hold) clearLater = setTimeout(() => setYear(null), 1600);
  else setYear(null);
}

function installPlay() {
  document.addEventListener("click", (e) => {
    const button = (e.target as Element).closest?.<HTMLButtonElement>(".cl-play");
    if (!button) return;
    if (playing) return stop(button, false);
    const from = Number(button.dataset.from);
    const to = Number(button.dataset.to);
    let y = from;
    button.setAttribute("aria-pressed", "true");
    button.querySelector(".cl-play-label")!.textContent = "Stop";
    setYear(y);
    playing = setInterval(() => {
      y += 1;
      if (y > to || !button.isConnected) return stop(button.isConnected ? button : null, y > to);
      setYear(y);
    }, 650);
  });
}

/* ---------------- a selected skill's thread ---------------- */

const SVG = "http://www.w3.org/2000/svg";

function drawThreads(animate: boolean) {
  const id = useUiStore.getState().selectedSkill;
  for (const cl of document.querySelectorAll<HTMLElement>(".cl")) {
    const svg = cl.querySelector<SVGSVGElement>(".cl-thread");
    if (!svg) continue;
    svg.replaceChildren();
    if (!id) continue;
    const lit = [...cl.querySelectorAll<HTMLElement>(".cl-ch")].filter(
      (ch) => ch.offsetParent !== null && ch.querySelector('[data-highlight="true"]'),
    );
    if (lit.length === 0) continue;
    const box = cl.getBoundingClientRect();
    if (!box.width || !box.height) continue;
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    const pts = lit.map((ch) => {
      const r = ch.getBoundingClientRect();
      return { x: r.left - box.left, y: r.top - box.top + r.height / 2 };
    });
    const x0 = pts[0].x - 9;
    let d = `M${x0} ${pts[0].y}V${pts.at(-1)!.y}`;
    for (const p of pts) d += `M${x0} ${p.y}H${p.x}`;
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "cl-thread-line");
    svg.append(path);
    for (const p of pts) {
      const dot = document.createElementNS(SVG, "circle");
      dot.setAttribute("cx", String(x0));
      dot.setAttribute("cy", String(p.y));
      dot.setAttribute("r", "3.5");
      dot.setAttribute("class", "cl-thread-dot");
      svg.append(dot);
    }
    if (animate && !reduced()) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], {
        duration: Math.min(900, 300 + pts.length * 90),
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
      svg
        .querySelectorAll("circle")
        .forEach((c, i) => c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 120 + i * 80, fill: "backwards" }));
    }
  }
}

function installThreads() {
  // after SkillLinks has marked the chapters for the new skill
  const later = (animate: boolean) => requestAnimationFrame(() => requestAnimationFrame(() => drawThreads(animate)));
  useUiStore.subscribe((s, prev) => {
    if (s.selectedSkill !== prev.selectedSkill) later(true);
  });
  let t: ReturnType<typeof setTimeout> | undefined;
  addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => drawThreads(false), 120);
  });
  later(false);
}

/* ---------------- site peek ---------------- */

let peek: HTMLElement | null = null;

function hidePeek() {
  if (!peek) return;
  peek.hidden = true;
  document.querySelector("[aria-describedby='site-peek']")?.removeAttribute("aria-describedby");
}

function showPeek(a: HTMLAnchorElement) {
  const pic = a.querySelector("picture");
  if (!pic) return;
  if (!peek) {
    peek = document.createElement("div");
    peek.id = "site-peek";
    peek.className = "peek";
    peek.setAttribute("role", "tooltip");
    document.body.append(peek);
  }
  const big = pic.cloneNode(true) as HTMLElement;
  for (const s of big.querySelectorAll("source")) s.sizes = "360px";
  const img = big.querySelector("img")!;
  img.loading = "eager";
  img.alt = "";
  const frame = document.createElement("span");
  frame.className = "peek-shot";
  frame.append(big);
  const name = document.createElement("b");
  name.textContent = a.dataset.name ?? "";
  const note = document.createElement("span");
  note.textContent = a.dataset.note ?? "";
  const where = document.createElement("span");
  where.className = "tnum";
  where.textContent = [a.dataset.domain, a.dataset.period].filter(Boolean).join(" · ");
  peek.replaceChildren(frame, name, note, where);
  peek.hidden = false;
  a.setAttribute("aria-describedby", "site-peek");
  // Place it beside the picture, on the side with room, inside the screen. Under the big-screen
  // zoom, getBoundingClientRect is in screen pixels and `left`/`top` in zoomed ones.
  const z = Number(getComputedStyle(document.documentElement).zoom) || 1;
  const r = a.getBoundingClientRect();
  const w = peek.offsetWidth;
  const h = peek.offsetHeight;
  const vw = innerWidth / z;
  const vh = innerHeight / z;
  const left = r.left / z - w - 12 >= 8 ? r.left / z - w - 12 : Math.min(r.right / z + 12, vw - w - 8);
  const top = Math.min(Math.max(8, (r.top + r.height / 2) / z - h / 2), vh - h - 8);
  peek.style.left = `${left}px`;
  peek.style.top = `${top}px`;
  if (!reduced()) peek.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 160 });
}

function installPeek() {
  const site = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLAnchorElement>("a.ind-site") : null);
  document.addEventListener("pointerover", (e) => {
    const a = site(e.target);
    if (a && !site(e.relatedTarget)) showPeek(a);
  });
  document.addEventListener("pointerout", (e) => {
    if (site(e.target) && site(e.relatedTarget) !== site(e.target)) hidePeek();
  });
  document.addEventListener("focusin", (e) => {
    const a = site(e.target);
    if (a) showPeek(a);
    else hidePeek();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hidePeek();
  });
  addEventListener("scroll", hidePeek, true);
}

/* ---------------- number keys ---------------- */

function installKeys() {
  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || !/^[1-9]$/.test(e.key)) return;
    if (useUiStore.getState().paletteOpen) return;
    const t = e.target as HTMLElement;
    if (t.closest?.("input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='dialog'], dialog")) return;
    const tab = document.querySelectorAll<HTMLAnchorElement>(".section-nav .tab")[Number(e.key) - 1];
    if (!tab) return;
    e.preventDefault();
    tab.classList.add("tab-press");
    setTimeout(() => tab.classList.remove("tab-press"), 200);
    tab.click();
  });
}

/** Runs once, after the first page is idle. */
export function boot() {
  document.documentElement.dataset.interact = "";
  installYears();
  installPlay();
  installThreads();
  installPeek();
  installKeys();
}

/** A section switch: nothing stays in focus from the page before, and threads redraw on the new one. */
export function enter() {
  if (playing) stop(null, false);
  hidePeek();
  requestAnimationFrame(() => requestAnimationFrame(() => drawThreads(false)));
}
