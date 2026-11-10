import type { ComponentType } from "react";

import { composeStories } from "@storybook/react";
import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, test } from "vitest";

// Every story, rendered as Storybook renders it, checked with axe. Colour contrast is left to the tokens'
// own test: jsdom doesn't compute styles, so axe can't measure it here.
const modules = import.meta.glob<Parameters<typeof composeStories>[0]>(
  "../stories/**/*.stories.tsx",
  { eager: true },
);

const stories = Object.entries(modules).flatMap(([file, module]) =>
  Object.entries(composeStories(module)).map(
    ([name, Story]) =>
      [`${file.replace("../stories/", "")} › ${name}`, Story as ComponentType] as const,
  ),
);

describe("stories", () => {
  test.each(stories)("%s renders with no axe violations", async (_, Story) => {
    const { container } = render(<Story />);

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(
      results.violations.map(
        (violation) =>
          `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
      ),
    ).toEqual([]);
  });
});
