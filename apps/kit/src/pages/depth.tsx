import { tokens, type ThemeName } from "@ome-labs/tokens";

import { CopyCode } from "../bench/copy-code.tsx";
import { Page, Section } from "../bench/page.tsx";
import { ThemeFrame } from "../theme/theme-frame.tsx";

// Class names are written out whole: Tailwind only generates the classes it can read in the source.
const shadows = [
  { name: "shadow-1", use: "Cards and tiles resting on the canvas" },
  { name: "shadow-2", use: "Hovered cards, popovers and menus" },
  { name: "shadow-3", use: "Toasts and floating panels" },
  { name: "shadow-4", use: "Dialogs and sheets" },
  { name: "shadow-control", use: "Secondary buttons and inputs at rest" },
  { name: "shadow-accent", use: "Solid accent and danger buttons" },
  { name: "shadow-pressed", use: "A control while it is held" },
  { name: "shadow-field", use: "The well a text field sits in" },
  { name: "shadow-focus", use: "The keyboard focus ring" },
] as const;

const radii = [
  ["rounded-xs", "xs"],
  ["rounded-sm", "sm"],
  ["rounded-md", "md"],
  ["rounded-lg", "lg"],
  ["rounded-xl", "xl"],
  ["rounded-2xl", "2xl"],
  ["rounded-full", "full"],
] as const;

const radiusUse: Record<string, string> = {
  xs: "Tags, kbd",
  sm: "Tooltips, segments",
  md: "Buttons, inputs",
  lg: "Cards, toasts",
  xl: "Dialogs",
  "2xl": "Hero panels",
  full: "Avatars, counts",
};

function ShadowGrid({ theme }: { theme: ThemeName }) {
  return (
    <ThemeFrame theme={theme} className="flex flex-col gap-4 rounded-xl p-5 tablet:p-6">
      <h3 className="type-label-m text-fg-muted capitalize">{theme}</h3>
      <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3">
        {shadows.map((shadow) => (
          <div
            key={shadow.name}
            className={`${shadow.name} ${shadow.name === "shadow-accent" ? "bg-accent text-on-accent" : "bg-surface text-fg"} flex min-h-24 flex-col justify-between gap-2 rounded-lg p-3`}
          >
            <CopyCode value={shadow.name} toastLabel="Copied class" />
            <span className="type-caption opacity-80">{shadow.use}</span>
          </div>
        ))}
      </div>
    </ThemeFrame>
  );
}

export function DepthPage() {
  return (
    <Page
      title="Depth & spacing"
      description="Depth marks what sits above the page, not decoration: most content rests at shadow-1, and only overlays climb higher. In light the shadows cast; in dark, where a shadow barely reads, they light the top edge instead."
    >
      <Section title="Elevation" className="grid gap-4 desktop:grid-cols-2">
        <ShadowGrid theme="light" />
        <ShadowGrid theme="dark" />
      </Section>

      <Section
        title="Radius"
        description="Smaller things get smaller corners; nothing but avatars and counts is a pill."
      >
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4 desktop:grid-cols-7">
          {radii.map(([className, name]) => (
            <div key={name} className="flex flex-col gap-2">
              <div className={`${className} h-20 border border-line-strong bg-accent-subtle`} />
              <CopyCode value={className} toastLabel="Copied class" className="text-fg" />
              <span className="type-caption text-fg-subtle">
                {tokens.radius[name]} px · {radiusUse[name]}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Spacing"
        description="A 4 px base. Tailwind's spacing utilities follow it: p-4 is 16 px."
        className="flex flex-col gap-2"
      >
        {Object.entries(tokens.space).map(([step, value]) => (
          <div key={step} className="grid grid-cols-[64px_64px_1fr] items-center gap-4">
            <CopyCode value={`p-${step}`} toastLabel="Copied class" className="text-fg" />
            <span className="type-mono-s text-fg-subtle">{value} px</span>
            <span className="h-3 rounded-xs bg-accent" style={{ width: value }} />
          </div>
        ))}
      </Section>

      <Section
        title="Control heights"
        description="Every button, input and select uses one of three heights so rows line up."
        className="flex flex-wrap items-end gap-6"
      >
        {(["sm", "md", "lg"] as const).map((size) => (
          <div key={size} className="flex flex-col items-start gap-2">
            <div
              className="flex w-28 items-center justify-center rounded-md bg-surface type-label-s text-fg-muted shadow-control"
              style={{ height: tokens.control[size] }}
            >
              {tokens.control[size]} px
            </div>
            <CopyCode value={`h-control-${size}`} toastLabel="Copied class" className="text-fg" />
          </div>
        ))}
      </Section>
    </Page>
  );
}
