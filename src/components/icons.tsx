import type { SVGProps } from "react";

/** One outline set, 16px, 1.5px stroke, currentColor. Decorative: every use sits beside a text label. */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="icon"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MailIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5" />
    <path d="m2.5,4.5,5.5,4,5.5-4" />
  </Icon>
);
export const FileIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M9.25,1.75h-5a1,1,0,0,0-1,1v10.5a1,1,0,0,0,1,1h7.5a1,1,0,0,0,1-1v-8z" />
    <path d="M9.25,1.75v3.5h3.5M8,7.5v4.25M6.25,10,8,11.75,9.75,10" />
  </Icon>
);
export const ExternalIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M5.5,3.5h7v7M12.5,3.5l-9,9" />
  </Icon>
);
export const LinkedInIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="1.75" y="1.75" width="12.5" height="12.5" rx="2" />
    <path d="M5,7v4.5M5,4.75v.01M8,11.5V7m0,2.25c0-1.25.9-2.25,2-2.25s1.75.75,1.75,2v2.5" />
  </Icon>
);
export const GitHubIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6,13.25c-3 .9-3-1.5-4.25-1.75m8.5,3v-2.4c0-.7.07-1-.35-1.4,2-.22,3.85-1,3.85-4.35a3.4,3.4,0,0,0-.92-2.35,3.15,3.15,0,0,0-.06-2.35s-.75-.22-2.45.92a8.4,8.4,0,0,0-4.4,0C4.2,1.53,3.45,1.75,3.45,1.75a3.15,3.15,0,0,0-.06,2.35,3.4,3.4,0,0,0-.92,2.37c0,3.33,1.85,4.11,3.85,4.34-.42.4-.42.8-.35,1.39v2.4" />
  </Icon>
);
export const SunIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="8" cy="8" r="2.75" />
    <path d="M8,1.5v1.25M8,13.25v1.25M1.5,8h1.25M13.25,8h1.25M3.4,3.4l.9.9M11.7,11.7l.9.9M3.4,12.6l.9-.9M11.7,4.3l.9-.9" />
  </Icon>
);
export const MoonIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M13.5,9.6A5.75,5.75,0,1,1,6.4,2.5a4.5,4.5,0,0,0,7.1,7.1z" />
  </Icon>
);
export const PinIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M8,14.25s4.75-4.1,4.75-7.75a4.75,4.75,0,0,0-9.5,0C3.25,10.15,8,14.25,8,14.25z" />
    <circle cx="8" cy="6.5" r="1.75" />
  </Icon>
);
export const ChevronDownIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m4,6,4,4,4-4" />
  </Icon>
);
export const ArrowRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3,8h10M9,4l4,4-4,4" />
  </Icon>
);
export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="7" cy="7" r="4.25" />
    <path d="m10.25 10.25 3.25 3.25" />
  </Icon>
);
