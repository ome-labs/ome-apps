import { Link } from "@tanstack/react-router";

import { Illustration, manifest } from "@ome-labs/brand/web";
import { Icon, iconNames } from "@ome-labs/icons/web";

import { CopyAction } from "../bench/copy-action.tsx";
import { Section } from "../bench/page.tsx";
import { nav } from "../nav.ts";

const componentPages = nav[3].items.length;

// Counts read from the registries the pages render, so they can't disagree with what's shown.
const contents = [
  [iconNames.length, "icons"],
  [manifest.illustrations.length, "illustrations"],
  [manifest.objects.length, "pixel objects"],
  [manifest.stateObjects.length, "state objects"],
  [manifest.textures.length, "textures"],
  [componentPages, "component pages"],
] as const;

const usage = `/* the app's Tailwind entry */
@import "@ome-labs/ui-web/styles.css";`;

const usageTsx = `import { Logo } from "@ome-labs/brand/web";
import { Icon } from "@ome-labs/icons/web";
import { ThemeProvider, Toaster, TooltipProvider, Button } from "@ome-labs/ui-web";

export function App() {
  return (
    <ThemeProvider initial="system">
      <TooltipProvider>
        <Logo variant="lockup-horizontal" height={24} />
        <Button variant="primary" icon="plus">New proposal</Button>
        <Icon name="vault" size={20} label="Vault" />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}`;

export function OverviewPage() {
  const [, foundations, brand, components] = nav;

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-16 px-4 pt-8 pb-24 tablet:px-10">
      <section className="grid items-center gap-8 overflow-hidden rounded-2xl bg-surface p-6 shadow-2 tablet:grid-cols-[1fr_1.1fr] tablet:p-10">
        <div className="flex flex-col gap-5">
          <h1 className="type-display-l text-balance text-fg">The Ome kit</h1>
          <p className="max-w-[460px] type-body-l text-pretty text-fg-muted">
            Every colour, text style, mark, icon, scene and component that Ome's apps are built
            from, in light and dark, ready to copy into code or download for a design.
          </p>
          <p className="flex flex-wrap items-center gap-2 type-body-s text-fg-subtle">
            Press
            <kbd className="rounded-xs border border-line-subtle bg-sunken px-1.5 type-mono-s text-fg-muted">
              ⌘K
            </kbd>
            to search pages and examples.
          </p>
        </div>
        <Illustration
          id="hero-dawn"
          fetchPriority="high"
          className="h-auto w-full rounded-lg shadow-1"
        />
      </section>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line-subtle shadow-1 tablet:grid-cols-5 [&>*:last-child]:col-span-2 tablet:[&>*:last-child]:col-span-1">
        {contents.map(([count, label]) => (
          <div key={label} className="flex flex-col-reverse gap-1 bg-surface px-5 py-4">
            <dt className="type-body-s text-fg-muted">{label}</dt>
            <dd className="type-numeric-m text-fg">{count}</dd>
          </div>
        ))}
      </dl>

      {[foundations, brand].map((section) => (
        <Section key={section.label} title={section.label}>
          <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
            {section.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group focus-ring flex flex-col gap-3 rounded-xl bg-surface p-5 shadow-1 transition-shadow duration-base ease-standard hover:shadow-2"
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-accent-subtle text-accent-fg">
                  <Icon name={item.icon} size={20} />
                </span>
                <span className="type-heading-s text-fg">{item.title}</span>
                <span className="type-body-s text-fg-muted">{item.description}</span>
              </Link>
            ))}
          </div>
        </Section>
      ))}

      <Section
        title={components.label}
        description="Every @ome-labs/ui-web component with its variants and states, on the guide's sample story: the Treasury vault, Alice, Bob and Carol, OMET, and proposals 3eb2, 335c and 868c."
      >
        <ul className="grid gap-x-6 tablet:grid-cols-2 desktop:grid-cols-3">
          {components.items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="focus-ring flex items-center gap-3 rounded-md border-b border-line-subtle px-2 py-3 transition-colors duration-fast hover:bg-hover"
              >
                <Icon name={item.icon} size={16} className="text-fg-subtle" />
                <span className="type-label-m text-fg">{item.title}</span>
                <span className="min-w-0 flex-1 truncate type-body-s text-fg-subtle">
                  {item.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Packages"
        description="The kit is the packages below, rendered. Apps import them through their exports, never their src/ folders."
      >
        <div className="overflow-x-auto rounded-xl bg-surface shadow-1">
          <table className="w-full min-w-[640px] text-left">
            <thead className="type-label-s text-fg-subtle">
              <tr className="border-b border-line-subtle">
                <th className="px-5 py-3 font-medium">Package</th>
                <th className="px-5 py-3 font-medium">Version</th>
                <th className="px-5 py-3 font-medium">What it holds</th>
              </tr>
            </thead>
            <tbody className="type-body-s">
              {import.meta.env.KIT_PACKAGES.map((pkg) => (
                <tr key={pkg.name} className="border-b border-line-subtle last:border-b-0">
                  <td className="px-5 py-3 type-mono-s whitespace-nowrap text-fg">{pkg.name}</td>
                  <td className="px-5 py-3 type-mono-s text-fg-muted">{pkg.version}</td>
                  <td className="px-5 py-3 text-fg-muted">{pkg.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Using the kit" className="grid gap-4 desktop:grid-cols-2">
        {[
          ["styles.css", usage],
          ["app.tsx", usageTsx],
        ].map(([file, code]) => (
          <div
            key={file}
            className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-surface shadow-1"
          >
            <div className="flex items-center justify-between border-b border-line-subtle px-4 py-1.5">
              <span className="type-mono-s text-fg-muted">{file}</span>
              <CopyAction value={code ?? ""} label={`Copy ${file}`} />
            </div>
            <pre className="overflow-x-auto bg-sunken px-5 py-4 type-mono-s text-fg-muted [font-variant-ligatures:none]">
              <code>{code}</code>
            </pre>
          </div>
        ))}
      </Section>
    </div>
  );
}
