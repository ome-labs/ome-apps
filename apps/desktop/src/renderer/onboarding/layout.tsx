import type { ReactNode } from "react";

import { Illustration, type IllustrationId } from "@ome-labs/brand/web";

import { TitleStrip } from "../shell/window-chrome.tsx";

/**
 * The first run's window: a scene on the left, anchored to its left edge as the kit draws it, and the step on the
 * right, left-aligned in a column that grows with the window. `footer` sits in the bottom-right corner.
 */
export function OnboardingLayout({
  illustration,
  children,
  footer,
}: {
  illustration: IllustrationId;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative grid h-dvh grid-cols-[minmax(0,44fr)_minmax(0,56fr)] bg-canvas">
      <TitleStrip />
      <div className="relative overflow-hidden bg-brand-night">
        <Illustration
          id={illustration}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-left"
        />
      </div>
      <main className="relative flex min-h-0 flex-col overflow-y-auto">
        <div className="my-auto px-[clamp(40px,6vw,96px)] py-16">
          <div className="flex max-w-[520px] flex-col gap-7">{children}</div>
        </div>
        {footer ? <div className="absolute right-6 bottom-5">{footer}</div> : null}
      </main>
    </div>
  );
}

/** A step's heading: where it sits in the setup, its title and what it's for. */
export function StepHeading({
  step,
  title,
  children,
}: {
  step?: string | undefined;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      {step ? <span className="type-overline text-fg-subtle">{step}</span> : null}
      {/* The welcome is a title page; the steps after it are forms and take a smaller heading. */}
      <h1 className={step ? "type-display-l text-fg" : "type-display-xl text-fg"}>{title}</h1>
      {children ? <p className="type-body-l text-fg-muted">{children}</p> : null}
    </header>
  );
}
