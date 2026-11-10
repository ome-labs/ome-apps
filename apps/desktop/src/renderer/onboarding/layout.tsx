import type { ReactNode } from "react";

import { Illustration, type IllustrationId } from "@ome-labs/brand/web";

/** The first run's window: a scene on the left, the step on the right. */
export function OnboardingLayout({
  illustration,
  children,
}: {
  illustration: IllustrationId;
  children: ReactNode;
}) {
  return (
    <div className="grid h-dvh grid-cols-[minmax(0,5fr)_minmax(0,7fr)] bg-canvas">
      <div className="relative overflow-hidden bg-sunken">
        <Illustration
          id={illustration}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <main className="flex min-h-0 overflow-y-auto">
        <div className="m-auto flex w-full max-w-[460px] flex-col gap-6 px-10 py-12">
          {children}
        </div>
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
    <header className="flex flex-col gap-2">
      {step ? <span className="type-overline text-fg-subtle">{step}</span> : null}
      <h1 className="type-display-l text-fg">{title}</h1>
      {children ? <p className="type-body-m text-fg-muted">{children}</p> : null}
    </header>
  );
}
