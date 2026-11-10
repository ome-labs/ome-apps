import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  Illustration,
  Logo,
  PixelObject,
  manifest,
  type LogoTone,
  type LogoVariant,
} from "./index.ts";

const variants: LogoVariant[] = ["lockup-horizontal", "lockup-stacked", "mark", "wordmark"];
const tones: LogoTone[] = ["light", "dark", "mono"];

describe("Logo", () => {
  test.each(variants.flatMap((variant) => tones.map((tone) => [variant, tone] as const)))(
    "%s in %s renders as an image named Ome",
    (variant, tone) => {
      render(<Logo variant={variant} tone={tone} height={24} />);

      expect(screen.getByRole("img", { name: "Ome" })).toBeInstanceOf(SVGSVGElement);
    },
  );

  test("a decorative logo is hidden from assistive technology", () => {
    const { container } = render(<Logo variant="mark" title="" />);

    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("art", () => {
  test("every illustration renders with its alt text and a 2x source", () => {
    for (const { id, alt } of manifest.illustrations) {
      const { unmount } = render(<Illustration id={id} />);
      const image = screen.getByRole("img", { name: alt });

      expect(image.getAttribute("srcset")).toContain("@2x.webp 2x");
      unmount();
    }
  });

  test("every pixel object renders with its alt text", () => {
    for (const { id, alt } of manifest.objects) {
      const { unmount } = render(<PixelObject id={id} size={32} />);

      expect(screen.getByRole("img", { name: alt }).getAttribute("src")).toMatch(/svg/);
      unmount();
    }
  });
});
