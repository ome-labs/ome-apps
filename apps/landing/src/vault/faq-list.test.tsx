import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { faqPage } from "../site/structured-data.ts";
import { FaqList } from "./faq-list.tsx";
import { faq } from "./faq.ts";

describe("FaqList", () => {
  it("renders every answer in the page, the first one open", () => {
    const { container } = render(<FaqList />);
    const items = container.querySelectorAll("details");

    expect(items).toHaveLength(faq.length);
    expect(items[0]?.open).toBe(true);
    for (const { answer } of faq) expect(screen.getByText(answer)).toBeDefined();
  });

  it("lists the same questions for search", () => {
    expect(faqPage(faq).mainEntity.map((entry) => entry.name)).toEqual(
      faq.map((item) => item.question),
    );
  });
});
