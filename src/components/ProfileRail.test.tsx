import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cv } from "@/content/cv";
import { ProfileRail } from "./ProfileRail";

describe("ProfileRail", () => {
  it("shows name, title, location and availability", () => {
    render(<ProfileRail />);
    expect(screen.getByText("Alex Vataselu")).toBeTruthy();
    expect(screen.getByText("Senior Frontend Engineer")).toBeTruthy();
    expect(screen.getByText("Brașov, Romania · Remote (EU)")).toBeTruthy();
    expect(screen.getByText(/open to work/i)).toBeTruthy();
  });

  it("has an Email me mailto link and PDF, LinkedIn, GitHub links", () => {
    render(<ProfileRail />);
    const mail = screen.getByRole("link", { name: "Email me" });
    expect(mail.getAttribute("href")).toBe("mailto:vataselu.alex@gmail.com");
    expect(screen.getByRole("link", { name: /pdf/i }).getAttribute("href")).toBe(cv.links.pdf);
    expect(screen.getByRole("link", { name: /linkedin/i }).getAttribute("href")).toBe(cv.links.linkedin);
    expect(screen.getByRole("link", { name: /github/i }).getAttribute("href")).toBe(cv.links.github);
  });

  it("renders the photo with alt text and no phone number", () => {
    const { container } = render(<ProfileRail />);
    expect(screen.getByAltText("Alex Vataselu")).toBeTruthy();
    expect(container.innerHTML).not.toMatch(/tel:|\+?\d[\d\s-]{8,}\d/);
  });
});
