import { createContext, use, type CSSProperties, type ReactNode } from "react";

import { tokens, type ColorName, type ThemeName } from "@ome-labs/tokens";
import { cn } from "@ome-labs/ui-web";

// The token stylesheet sets the light palette on :root and the dark one on [data-theme="dark"], so a light
// panel inside a dark page would inherit dark values. A frame sets every colour and shadow variable inline
// instead, which lets the kit show both themes side by side whatever the page's own theme is.
function themeVariables(theme: ThemeName) {
  const colors = Object.entries(tokens.color.variable).map(([name, variable]) => [
    variable,
    tokens.color[theme][name as ColorName],
  ]);
  const shadows = Object.entries(tokens.shadow).map(([name, value]) => [
    `--ome-shadow-${name}`,
    value[theme],
  ]);

  return { colorScheme: theme, ...Object.fromEntries([...colors, ...shadows]) } as CSSProperties;
}

const frames = { light: themeVariables("light"), dark: themeVariables("dark") };

/** A region drawn in one theme, whatever the rest of the page uses. */
export function ThemeFrame({
  theme,
  className,
  children,
}: {
  theme: ThemeName;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div data-theme={theme} style={frames[theme]} className={cn("bg-canvas text-fg", className)}>
      {children}
    </div>
  );
}

export const SplitContext = createContext(false);

/** Renders a page twice, light then dark, when the header's Split view is on. */
export function ThemedPage({ children }: { children: ReactNode }) {
  const split = use(SplitContext);
  if (!split) return children;

  return (
    <div className="grid min-h-full desktop:grid-cols-2">
      <ThemeFrame theme="light" className="min-w-0 border-line-subtle desktop:border-r">
        {children}
      </ThemeFrame>
      <ThemeFrame theme="dark" className="min-w-0">
        {children}
      </ThemeFrame>
    </div>
  );
}
