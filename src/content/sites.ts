/**
 * Alex's own shipped, public sites named on the CV, with a screenshot of each live front page
 * (captured from the public site, cropped, served as AVIF/WebP from public/work).
 * `note` is the CV's own line. `stack` and `details` add what the dashboard has room for, read on
 * 2026-11-05 from each live site (its generator tag, theme, plugins, hosting headers, structured
 * data and sections) and from the site's source in E:\WorkAV (its package.json and theme).
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
  /** what it is built with, as the live site and its source show */
  stack: string[];
  /** what it has, as the live site shows it */
  details: string[];
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
    stack: ["WordPress block theme", "Custom Gutenberg blocks", "@wordpress/scripts", "Vitest", "Playwright + axe-core", "Figma"],
    details: [
      "A custom block theme, azuga-365: its own blocks for the map, the gallery, the team, the research and three kinds of stories (workshops, comics and interviews).",
      "Custom post types and taxonomies for the archive, so every item can be browsed and filtered.",
      "Visitors can add a story or an item to the archive through the site's own contact form.",
      "Tested with Vitest, and in the browser with Playwright and axe-core; Organization structured data.",
    ],
  },
  {
    id: "litoralinlucru",
    name: "Dincolo de Vacantele Socialiste",
    domain: "litoralinlucru.ro",
    url: "https://litoralinlucru.ro",
    roleId: "freelance-2025",
    note: "Archive of holidays in socialist-era Romania, with filtered search.",
    image: "/work/litoralinlucru",
    stack: ["WordPress block theme", "Custom Gutenberg blocks", "@wordpress/scripts", "Vitest", "Playwright + axe-core", "Figma"],
    details: [
      "A custom block theme, litoral-in-lucru: blocks for the audio archive, the map, events, research, the team, a photo strip and a video grid.",
      "The archive is organised by place (Hotel Paradiso, Gara Mangalia, the summer theatre and more), with filtered search.",
      "Images and web fonts optimised at build time (sharp, WOFF2).",
      "Tested with Vitest, and in the browser with Playwright and axe-core.",
    ],
  },
  {
    id: "arhivelelitoralului",
    name: "Arhivele Litoralului",
    domain: "arhivelelitoralului.ro",
    url: "https://arhivelelitoralului.ro",
    roleId: "freelance-2021",
    note: "Digital archive of the Romanian seaside's history, searchable by keyword, tag and year.",
    image: "/work/arhivelelitoralului",
    stack: ["WordPress", "Custom theme (Sass, Gulp)", "Elementor", "PhotoSwipe"],
    details: [
      "A custom theme, arhivele, built with Sass and Gulp, with Elementor for the editors' pages.",
      "Three collections: Arhiva Minerva, Arhiva MȚR and the Aici A Stat collection, searchable by keyword, tag and year.",
      "Photos open full screen in a PhotoSwipe lightbox.",
      "Pages for the research, the team, the videos and how to help.",
    ],
  },
  {
    id: "recuperareacasa",
    name: "RecuperareAcasa",
    domain: "recuperareacasa.ro",
    url: "https://recuperareacasa.ro",
    roleId: "freelance-2021",
    note: "Mobile-first physiotherapy home-visit booking.",
    image: "/work/recuperareacasa",
    stack: ["Next.js", "TypeScript", "Styled Components", "Resend", "Google Maps", "Vercel"],
    details: [
      "A Next.js app in TypeScript with Styled Components, deployed on Vercel.",
      "A multi-step intake form: why the visit, the problem, where it hurts, the day and the address, sent to the practice by email through a Next.js API route and Resend.",
      "Sections for the services, the team, reviews, awards and questions, and a Google Map of the practice.",
      "Built mobile-first on an Atomic Design system.",
    ],
  },
  {
    id: "eyeexcellence",
    name: "EyeExcellence",
    domain: "eyeexcellence.ro",
    url: "https://eyeexcellence.ro",
    roleId: "freelance-2021",
    note: "Healthcare platform with WCAG 2.1 work and structured data.",
    image: "/work/eyeexcellence",
    stack: ["WordPress", "Elementor Pro", "Waze directions"],
    details: [
      "An ophthalmology clinic's site in WordPress with Elementor Pro.",
      "Pages for each service (consultations, medical optics, eye surgery) and for each condition: cataract, pterygium, glaucoma, diabetic retinopathy and optical aberrations.",
      "A price list, a gallery, and directions to the clinic through Waze.",
    ],
  },
  {
    id: "orlrasnov",
    name: "OrlRasnov",
    domain: "orlrasnov.ro",
    url: "https://orlrasnov.ro",
    roleId: "freelance-2021",
    note: "Healthcare platform with WCAG 2.1 work and structured data.",
    image: "/work/orlrasnov",
    stack: ["WordPress", "Elementor", "Site Reviews", "Schema.org structured data"],
    details: [
      "An ENT practice's site in WordPress with Elementor.",
      "Services, gallery and contact pages, with a call button on every page.",
      "Patient reviews on the site (Site Reviews).",
      "Structured data for the website, its search and the practice's contact point.",
    ],
  },
  {
    id: "kemblimed",
    name: "Kemblimed",
    domain: "kemblimed.ro",
    url: "https://www.kemblimed.ro",
    roleId: "kemblimed",
    note: "An ophthalmology equipment distributor's site, designed, built and maintained on Wix.",
    image: "/work/kemblimed",
    stack: ["Wix"],
    details: [
      "Kemblimed (Kembli-Med) supplies ophthalmology devices and products in Brașov: intraocular lenses, surgical instruments, sterilisers.",
      "Pages for the products, the partners and the company, a downloadable product catalogue, and sections for congresses, video presentations and symposia.",
      "Designed, built and maintained in 2012–2013; the screenshot is the live site today.",
    ],
  },
];

export const sitesForRole = (roleId: string) => sites.filter((s) => s.roleId === roleId);
