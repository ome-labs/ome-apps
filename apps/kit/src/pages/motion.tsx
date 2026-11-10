import { useState, useSyncExternalStore } from "react";

import { tokens } from "@ome-labs/tokens";
import { Button } from "@ome-labs/ui-web";

import { CopyCode } from "../bench/copy-code.tsx";
import { Page, Section } from "../bench/page.tsx";

const reducedQuery = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = matchMedia(reducedQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => matchMedia(reducedQuery).matches,
    () => false,
  );
}

const durationUse: Record<string, string> = {
  instant: "Keyboard actions and anything done many times a minute",
  fast: "Hover and press feedback",
  base: "Menus, tooltips, popovers",
  slow: "Dialogs and sheets",
  scene: "The dither dissolve between illustrations",
};

const easings = Object.entries(tokens.motion.easing).map(
  ([name, curve]) => [name, `cubic-bezier(${curve.join(", ")})`] as const,
);

export function MotionPage() {
  const [moved, setMoved] = useState(false);
  const reduced = usePrefersReducedMotion();

  return (
    <Page
      title="Motion"
      description="Motion answers what the member did and stays out of the way of what they do often. Under reduced motion the token stylesheet turns transitions off, and scenes swap without the dissolve."
    >
      <Section
        title="Durations"
        description="Press Play to move each dot with its duration and the standard easing."
        aside={
          <Button icon="play" onClick={() => setMoved(!moved)}>
            {moved ? "Play back" : "Play"}
          </Button>
        }
        className="flex flex-col gap-1"
      >
        {reduced ? (
          <p className="mb-3 rounded-md bg-info-subtle px-3 py-2 type-body-s text-info">
            Your system asks for reduced motion, so the dots jump instead of moving.
          </p>
        ) : null}
        {Object.entries(tokens.motion.duration).map(([name, ms]) => (
          <div
            key={name}
            className="grid items-center gap-x-6 gap-y-2 border-b border-line-subtle py-4 last:border-b-0 tablet:grid-cols-[160px_1fr_1.2fr]"
          >
            <div className="flex flex-col gap-0.5">
              <CopyCode value={`duration-${name}`} toastLabel="Copied class" className="text-fg" />
              <span className="type-caption text-fg-subtle">{ms} ms</span>
            </div>
            <span className="type-body-s text-fg-muted">{durationUse[name]}</span>
            <div className="relative h-6 rounded-full bg-sunken">
              {/* The strip is the track minus the dot, so moving it by its own width lands the dot at the end. */}
              <span
                className="absolute inset-y-1 left-1 right-5"
                style={{
                  transform: moved ? "translateX(100%)" : "none",
                  transition: `transform ${ms}ms ${easings[0]?.[1] ?? "ease"}`,
                }}
              >
                <span className="block size-4 rounded-full bg-accent shadow-accent" />
              </span>
            </div>
          </div>
        ))}
      </Section>

      <Section
        title="Easings"
        description="Standard for things that move on screen; emphasized for things that enter, such as dialogs."
        className="grid gap-4 tablet:grid-cols-2"
      >
        {easings.map(([name, curve]) => (
          <div key={name} className="flex flex-col gap-3 rounded-xl bg-surface p-5 shadow-1">
            <CopyCode value={`ease-${name}`} toastLabel="Copied class" className="text-fg" />
            <CopyCode value={curve} toastLabel="Copied curve" className="text-fg-subtle" />
          </div>
        ))}
      </Section>
    </Page>
  );
}
