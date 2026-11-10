import { tokens, type ColorName, type ThemeName } from "@ome-labs/tokens";
import { cn } from "@ome-labs/ui-web";

import { CopyCode } from "../bench/copy-code.tsx";
import { Page, Section } from "../bench/page.tsx";
import { copyText } from "../clipboard/copy-text.ts";
import { contrast, grade } from "../colour/contrast.ts";
import { roleGroups, utilityFor } from "../colour/roles.ts";

const primitives = Object.entries(tokens.color.primitive).reduce<
  Record<string, [string, string][]>
>((scales, [name, hex]) => {
  const [scale = name, step = ""] = name.split("/");
  (scales[scale] ??= []).push([step, hex]);
  return scales;
}, {});

const themes: ThemeName[] = ["light", "dark"];

// Labels on a primitive swatch take whichever of night ink or white reads on it.
const ink = tokens.color.primitive["ink/900"];
const paper = tokens.color.primitive["ink/0"];

function RoleCard({ role }: { role: ColorName }) {
  const variable = tokens.color.variable[role];

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-lg bg-surface shadow-1">
      <div className="grid h-16 grid-cols-2">
        {themes.map((theme) => (
          <button
            key={theme}
            type="button"
            aria-label={`Copy ${role} in ${theme}: ${tokens.color[theme][role]}`}
            onClick={() => void copyText(tokens.color[theme][role], `Copied ${role} (${theme})`)}
            className="focus-ring cursor-pointer shadow-[inset_0_-1px_0_var(--ome-border-subtle)] transition-[filter] duration-fast hover:brightness-95"
            style={{ backgroundColor: tokens.color[theme][role] }}
          />
        ))}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 px-3 py-2.5">
        <CopyCode value={utilityFor(role)} toastLabel="Copied class" className="text-fg" />
        <CopyCode
          value={`var(${variable})`}
          toastLabel="Copied variable"
          className="text-fg-subtle"
        />
        <div className="flex gap-3 text-fg-muted">
          {themes.map((theme) => (
            <CopyCode
              key={theme}
              value={tokens.color[theme][role]}
              toastLabel={`Copied ${role} (${theme})`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const textChecks: [ColorName, ColorName][] = [
  ["fg", "canvas"],
  ["fg-muted", "surface"],
  ["fg-subtle", "surface"],
  ["accent-fg", "surface"],
  ["on-accent", "accent"],
  ["success", "success-subtle"],
  ["warning", "warning-subtle"],
  ["danger", "danger-subtle"],
  ["info", "info-subtle"],
  ["neutral", "neutral-subtle"],
];

function ContrastChip({ text, on, theme }: { text: ColorName; on: ColorName; theme: ThemeName }) {
  const foreground = tokens.color[theme][text];
  const background = tokens.color[theme][on];
  const ratio = contrast(foreground, background);
  const verdict = grade(ratio);

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg bg-surface p-2 pr-3 shadow-1">
      <span
        className="flex h-10 w-12 shrink-0 items-center justify-center rounded-md type-heading-s"
        style={{ color: foreground, backgroundColor: background }}
        aria-hidden
      >
        Aa
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate type-mono-s text-fg">
          {text} on {on}
        </span>
        <span className="type-caption text-fg-subtle">{ratio.toFixed(2)} : 1</span>
      </span>
      <span
        className={cn(
          "rounded-xs px-1.5 py-0.5 type-label-s",
          verdict === "AA" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning",
        )}
      >
        {verdict}
      </span>
    </div>
  );
}

export function ColourPage() {
  return (
    <Page
      title="Colour"
      description="Lake is the one accent, set against a cool ink neutral. Code uses the semantic roles, which change with the theme; each card shows light on the left and dark on the right. Click a half to copy its hex, or a line to copy the class or variable."
    >
      {roleGroups.map((group) => (
        <Section key={group.title} title={group.title} description={group.description}>
          <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 desktop:grid-cols-5">
            {group.roles.map((role) => (
              <RoleCard key={role} role={role} />
            ))}
          </div>
        </Section>
      ))}

      <Section
        title="Text contrast"
        description="Every text role on the surface it is used on, measured in both themes. Body text needs 4.5 : 1 (AA)."
        className="grid gap-6 desktop:grid-cols-2"
      >
        {themes.map((theme) => (
          <div key={theme} className="flex flex-col gap-2">
            <h3 className="type-label-m text-fg-muted capitalize">{theme}</h3>
            {textChecks.map(([text, on]) => (
              <ContrastChip key={`${text}-${on}`} text={text} on={on} theme={theme} />
            ))}
          </div>
        ))}
      </Section>

      <Section
        title="Primitive scales"
        description="The raw values the roles point at. They aren't utilities: reach for a semantic role in code so both themes stay right. Click a step to copy its hex."
        className="flex flex-col gap-6"
      >
        {Object.entries(primitives).map(([scale, steps]) => (
          <div key={scale} className="flex flex-col gap-2">
            <h3 className="type-label-m text-fg capitalize">{scale}</h3>
            <div className="grid grid-cols-4 overflow-hidden rounded-lg shadow-1 tablet:grid-cols-[repeat(auto-fit,minmax(64px,1fr))]">
              {steps.map(([step, hex]) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => void copyText(hex, `Copied ${scale}/${step}`)}
                  className="focus-ring flex h-20 cursor-pointer flex-col justify-end p-2 text-left transition-[filter] duration-fast hover:brightness-95"
                  style={{
                    backgroundColor: hex,
                    color: contrast(ink, hex) >= 4.5 ? ink : paper,
                  }}
                >
                  <span className="type-label-s">{step}</span>
                  <span className="type-mono-s opacity-80">{hex}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </Section>
    </Page>
  );
}
