/**
 * The motion layer: Motion (the `motion` package), loaded after the page is idle by MotionBoot and
 * never part of the first-load JS. Nothing here is needed to read or use the page: every state it
 * animates (a filter, a role opening, a preview switching) already works without it, so a visitor
 * who asks for reduced motion never loads it at all.
 *
 * Motion's mini `animate` drives the browser's own Web Animations API (compositor-friendly
 * transforms and opacity); `stagger` spaces the cards. LazyMotion with `m` components was measured
 * against this: the `m` component core would sit in the first-load bundle of every route, which has
 * no room for it, so the motion layer works on the server-rendered DOM instead.
 */
import { animate } from "motion/mini";
import { stagger } from "motion";

const ease = [0.22, 1, 0.36, 1] as const;

/** Headline figures count up to their real value (already in the HTML and shown at first paint). */
function countUp(root: ParentNode) {
  for (const el of root.querySelectorAll<HTMLElement>("[data-count]")) {
    const to = Number(el.dataset.count);
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

/** A new section's cards arrive one after another (the panel itself cross-fades by view transition). */
export function enter() {
  const cards = document.querySelectorAll<HTMLElement>("#main .panel-grid > :not(style)");
  if (cards.length === 0) return;
  animate(
    cards,
    { opacity: [0, 1], transform: ["translateY(10px)", "translateY(0)"] },
    { duration: 0.42, delay: stagger(0.05, { startDelay: 0.06 }), ease },
  );
  const main = document.getElementById("main");
  if (main) countUp(main);
}

/** Filters: the chips and groups that stay glide to their new places; the ones that return fade in. */
function installFlip() {
  const targets = (box: Element) => [...box.querySelectorAll<HTMLElement>(".skill-chip, .cloud-group, .sm-group")];
  let first: Map<HTMLElement, DOMRect> | null = null;
  const snap = (e: Event) => {
    const t = e.target as Element;
    const box = t.closest?.(".filtered");
    if (!box || !t.closest("[data-filter]")) return;
    first = new Map(targets(box).map((el) => [el, el.getBoundingClientRect()]));
  };
  document.addEventListener("pointerdown", snap, true);
  document.addEventListener("keydown", snap, true);
  document.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    const box = t.closest?.(".filtered");
    if (!box || !t.closest("[data-filter]") || !first) return;
    const before = first;
    first = null;
    for (const el of targets(box)) {
      const b = el.getBoundingClientRect();
      if (!b.width) continue;
      const a = before.get(el);
      if (!a || !a.width) {
        animate(el, { opacity: [0, 1], transform: ["scale(0.94)", "scale(1)"] }, { duration: 0.3, delay: 0.08, ease });
        continue;
      }
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        animate(el, { transform: [`translate(${dx}px, ${dy}px)`, "translate(0px, 0px)"] }, { duration: 0.4, ease });
      }
    }
  });
}

/** A role opening in the side card unfolds to its height instead of jumping open. */
function installExpand() {
  document.addEventListener(
    "toggle",
    (e) => {
      const d = e.target;
      if (!(d instanceof HTMLDetailsElement) || !d.open) return;
      const body = d.querySelector<HTMLElement>(":scope > :not(summary)");
      if (!body) return;
      const h = body.offsetHeight;
      body.style.overflow = "hidden";
      animate(body, { height: [0, h], opacity: [0, 1] }, { duration: 0.32, ease }).then(() => {
        body.style.overflow = "";
        body.style.height = "";
      });
    },
    true,
  );
}

/** Projects: the chosen preview slides in; a gallery's chosen screenshot fades in. */
function installPreview() {
  document.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name?.startsWith("shot-")) {
      const shot = document.getElementById(`${t.name}-${t.value}`);
      if (shot) animate(shot, { opacity: [0, 1] }, { duration: 0.22, ease });
      return;
    }
    if (t.name !== "project") return;
    const el = document.getElementById(`preview-${t.value}`);
    if (el) animate(el, { opacity: [0, 1], transform: ["translateX(14px)", "translateX(0)"] }, { duration: 0.34, ease });
  });
}

/** Runs once, after the first page is idle. */
export function boot() {
  document.documentElement.dataset.motion = "";
  installFlip();
  installExpand();
  installPreview();
  countUp(document);
}
