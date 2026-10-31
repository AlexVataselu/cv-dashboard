/**
 * Alex's own shipped, public sites named on the CV, with a screenshot of each live front page
 * (captured from the public site, cropped, served as AVIF/WebP from public/work).
 * Every line of copy here is taken from the CV bullets in cv.ts.
 */
export interface Site {
  id: string;
  name: string;
  domain: string;
  url: string;
  /** the role on the CV it belongs to */
  roleId: string;
  /** what it is, in the CV's words */
  note: string;
  image: string;
}

export const sites: Site[] = [
  {
    id: "azuga365",
    name: "Azuga365",
    domain: "azuga365.ro",
    url: "https://azuga365.ro",
    roleId: "freelance-2025",
    note: "Online archive of Azuga's royal and industrial history.",
    image: "/work/azuga365",
  },
  {
    id: "litoralinlucru",
    name: "Dincolo de Vacantele Socialiste",
    domain: "litoralinlucru.ro",
    url: "https://litoralinlucru.ro",
    roleId: "freelance-2025",
    note: "Archive of holidays in socialist-era Romania, with filtered search.",
    image: "/work/litoralinlucru",
  },
  {
    id: "recuperareacasa",
    name: "RecuperareAcasa",
    domain: "recuperareacasa.ro",
    url: "https://recuperareacasa.ro",
    roleId: "freelance-2021",
    note: "Mobile-first physiotherapy home-visit booking.",
    image: "/work/recuperareacasa",
  },
  {
    id: "eyeexcellence",
    name: "EyeExcellence",
    domain: "eyeexcellence.ro",
    url: "https://eyeexcellence.ro",
    roleId: "freelance-2021",
    note: "Healthcare platform with WCAG 2.1 work and structured data.",
    image: "/work/eyeexcellence",
  },
  {
    id: "orlrasnov",
    name: "OrlRasnov",
    domain: "orlrasnov.ro",
    url: "https://orlrasnov.ro",
    roleId: "freelance-2021",
    note: "Healthcare platform with WCAG 2.1 work and structured data.",
    image: "/work/orlrasnov",
  },
];

export const sitesForRole = (roleId: string) => sites.filter((s) => s.roleId === roleId);
