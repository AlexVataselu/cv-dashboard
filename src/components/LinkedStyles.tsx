import { cv } from "@/content/cv";
import { kindOf } from "@/content/career";

/**
 * Linked views with no JS: inside a `.linked` area, hovering or focusing anything that names a role
 * (`data-link`, a timeline row or a result) lights everything that belongs to that role
 * (`data-roles`: the row itself, its results, the skills it used, its row in the role list), in the
 * role's own hue. One rule per role, written from the CV data, so a new role needs no CSS edit.
 * React hoists the <style> into <head> and writes it once however many sections render it.
 */
export function LinkedStyles() {
  const css = cv.roles
    .map((r) => {
      const k = kindOf(r.id);
      return `.linked:has([data-link="${r.id}"]:is(:hover,:focus-visible)) [data-roles~="${r.id}"]{background:var(--hue-${k}-tint);box-shadow:inset 0 0 0 1px var(--hue-${k})}`;
    })
    .join("");
  return (
    <style href="linked-roles" precedence="medium">
      {css}
    </style>
  );
}
