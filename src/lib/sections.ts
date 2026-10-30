export const SECTIONS = [
  { id: "overview", href: "/", label: "Overview" },
  { id: "experience", href: "/experience", label: "Experience" },
  { id: "skills", href: "/skills", label: "Skills" },
  { id: "projects", href: "/projects", label: "Projects" },
  { id: "education", href: "/education", label: "Education" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
