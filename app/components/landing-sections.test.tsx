import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";
import { LandingFooter, LandingHero, LandingStats } from "./landing-sections";

function render(node: ReactNode) {
  return renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);
}

function classesOf(html: string, tag: string) {
  return [...html.matchAll(new RegExp(`<${tag} class="([^"]*)"`, "g"))].map(
    (match) => match[1].split(" ")
  );
}

describe("LandingHero", () => {
  const html = render(<LandingHero />);

  it("does not centre the hero text", () => {
    expect(html).not.toContain("text-center");
  });

  it("does not centre the subcopy", () => {
    const [subcopy] = classesOf(html, "p");
    expect(subcopy).toContain("max-w-2xl");
    expect(subcopy).not.toContain("mx-auto");
  });

  it("puts the call to action on the left", () => {
    const row = classesOf(html, "div").find((classes) =>
      classes.includes("flex")
    );
    expect(row).toBeDefined();
    expect(row).not.toContain("justify-center");
  });

  it("links the call to action to the catalogue", () => {
    expect(html).toContain('href="/courses"');
    expect(html).toContain("Browse Courses");
  });
});

describe("LandingStats", () => {
  const html = render(<LandingStats totalCourses={4} totalCategories={5} />);

  it("shows the course and category counts", () => {
    expect(html).toContain(">4</p><p");
    expect(html).toContain(">Available Courses<");
    expect(html).toContain(">5</p><p");
    expect(html).toContain(">Categories<");
    expect(html).toContain(">Self-paced<");
  });

  it("does not centre the stat text", () => {
    expect(html).not.toContain("text-center");
  });

  it("keeps the three icon tiles on the left", () => {
    const tiles = classesOf(html, "div").filter((classes) =>
      classes.includes("size-12")
    );
    expect(tiles).toHaveLength(3);
    for (const tile of tiles) expect(tile).not.toContain("mx-auto");
  });
});

describe("LandingFooter", () => {
  it("does not centre the footer", () => {
    const html = render(<LandingFooter />);
    expect(html).toContain("Cadence");
    expect(html).not.toContain("text-center");
  });
});
