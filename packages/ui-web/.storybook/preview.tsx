import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";

import "../src/styles.css";
import { Toaster } from "../src/feedback/toaster.tsx";
import { TooltipProvider } from "../src/overlays/tooltip.tsx";
import { ThemeProvider, type ThemePreference } from "../src/styling/theme.tsx";

const preview: Preview = {
  parameters: {
    layout: "padded",
    backgrounds: { disable: true },
    // Every story is checked against WCAG AA; a violation fails the a11y panel and the test run.
    a11y: { test: "error" },
  },
  decorators: [
    (Story, context) => (
      // Keyed on the toolbar theme so the provider, and Sonner with it, pick up a switch.
      <ThemeProvider
        key={context.globals.theme}
        initial={(context.globals.theme as ThemePreference | undefined) ?? "light"}
      >
        <TooltipProvider delay={300}>
          <div className="text-fg">
            <Story />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    ),
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
  ],
};

export default preview;
