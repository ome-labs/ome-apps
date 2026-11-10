import { tokens, type TextStyleName } from "@ome-labs/tokens";

import { CopyAction } from "../bench/copy-action.tsx";
import { CopyCode } from "../bench/copy-code.tsx";
import { Page, Section } from "../bench/page.tsx";

const families = [
  {
    key: "display",
    name: "Instrument Serif",
    role: "Display: page titles and the brand's quiet moments. Regular only.",
    sample: "Dawn over Lake Texcoco",
  },
  {
    key: "sans",
    name: "Inter",
    role: "Interface: headings, body, labels. 400 to 700.",
    sample: "Approve and send",
  },
  {
    key: "mono",
    name: "JetBrains Mono",
    role: "Values: addresses, hashes, amounts and commands.",
    sample: "0x103b…c2c0",
  },
] as const;

// Specimens use the product's own sentences, so each style is seen doing its real job.
function specimenFor(name: TextStyleName) {
  if (name.startsWith("display")) return "Treasury";
  if (name.startsWith("heading")) return "Approve proposal 3eb2";
  if (name.startsWith("body"))
    return "Bob approved. One more approval to spend, then anyone can execute.";
  if (name.startsWith("numeric")) return "1,000 OMET";
  if (name.startsWith("mono"))
    return "0x103b470145425638c8644547f39d59f049462c4fbdbc73f32370e01dd681c2c0";
  if (name === "overline") return "Vault";
  if (name === "caption") return "Founded Nov 9, 2026";
  return "Members to read";
}

// Written out whole: Tailwind only generates the classes it can read in the source.
const typeClass: Record<TextStyleName, string> = {
  "display-hero": "type-display-hero",
  "display-xl": "type-display-xl",
  "display-l": "type-display-l",
  "display-m": "type-display-m",
  "display-s": "type-display-s",
  "heading-xl": "type-heading-xl",
  "heading-l": "type-heading-l",
  "heading-m": "type-heading-m",
  "heading-s": "type-heading-s",
  "body-l": "type-body-l",
  "body-m": "type-body-m",
  "body-s": "type-body-s",
  "label-m": "type-label-m",
  "label-s": "type-label-s",
  caption: "type-caption",
  overline: "type-overline",
  "mono-m": "type-mono-m",
  "mono-s": "type-mono-s",
  "numeric-l": "type-numeric-l",
  "numeric-m": "type-numeric-m",
};

function px(value: number) {
  return `${Number(value.toFixed(2))}px`;
}

export function TypographyPage() {
  const styles = Object.entries(tokens.text) as [
    TextStyleName,
    (typeof tokens.text)[TextStyleName],
  ][];

  return (
    <Page
      title="Typography"
      description="Three families, each with one job, and 20 text styles that set family, size, line height, tracking and weight together. Use the type-* class rather than single font utilities."
    >
      <Section title="Families" className="grid gap-4 desktop:grid-cols-3">
        {families.map((family) => (
          <div
            key={family.key}
            className="flex min-w-0 flex-col gap-4 rounded-xl bg-surface p-5 shadow-1"
          >
            <span
              className="truncate text-[34px] leading-tight text-fg"
              style={{ fontFamily: tokens.font.web[family.key] }}
            >
              {family.sample}
            </span>
            <div className="flex flex-col gap-1">
              <span className="type-heading-s text-fg">{family.name}</span>
              <span className="type-body-s text-fg-muted">{family.role}</span>
              <CopyCode
                value={`font-${family.key}`}
                toastLabel="Copied class"
                className="mt-1 text-accent-fg"
              />
            </div>
          </div>
        ))}
      </Section>

      <Section
        title="Text styles"
        description="Sizes and line heights in px, tracking in px at that size. Overline is the one uppercase style."
        className="flex flex-col"
      >
        {styles.map(([name, style]) => (
          <div
            key={name}
            className="group/tile grid gap-x-8 gap-y-3 border-b border-line-subtle py-5 last:border-b-0 tablet:grid-cols-[200px_1fr_auto] tablet:items-center"
          >
            <div className="flex flex-col gap-1">
              <CopyCode value={`type-${name}`} toastLabel="Copied class" className="text-fg" />
              <span className="type-caption text-fg-subtle">
                {px(style.fontSize)} / {px(style.lineHeight)} · {px(style.letterSpacing)} ·{" "}
                {style.fontWeight} · {style.webFamily}
              </span>
            </div>
            <p className={`${typeClass[name]} min-w-0 text-fg [overflow-wrap:anywhere]`}>
              {specimenFor(name)}
            </p>
            <CopyAction
              value={`type-${name}`}
              label={`Copy type-${name}`}
              toastLabel="Copied class"
            />
          </div>
        ))}
      </Section>
    </Page>
  );
}
