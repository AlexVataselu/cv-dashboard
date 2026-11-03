import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { cv } from "@/content/cv";
import { registerSkills } from "@/state/skillCatalog";

registerSkills(cv.skills.map((s) => [s.id, s.name]));

afterEach(() => {
  cleanup();
});
