import type { ReactNode } from "react";

import { Illustration, type IllustrationId } from "@ome-labs/brand/web";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

import { TitleStrip } from "../shell/window-chrome.tsx";
import { type Direction, Reveal, scene, step } from "./motion.tsx";

/**
 * The first run's window: a scene on the left, anchored to its left edge as the kit draws it, and the step on the
 * right in a narrower column, centred in its half. `stepKey` changes when the step does, which crossfades the scene and moves the step in
 * `direction`; `footer` sits in the bottom-right corner.
 */
export function OnboardingLayout({
  illustration,
  stepKey = illustration,
  direction = 1,
  children,
  footer,
}: {
  illustration: IllustrationId;
  stepKey?: string;
  direction?: Direction;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative grid h-dvh grid-cols-[minmax(0,56fr)_minmax(0,44fr)] bg-canvas">
        <TitleStrip />
        <div className="relative overflow-hidden bg-brand-night">
          <AnimatePresence initial={false}>
            <motion.div
              key={illustration}
              variants={scene}
              initial="enter"
              animate="shown"
              exit="leave"
              className="absolute inset-0"
            >
              <Illustration
                id={illustration}
                alt=""
                className="h-full w-full object-cover object-left"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <main className="relative flex min-h-0 flex-col overflow-x-hidden overflow-y-auto">
          {/* Centred both ways, the bottom padding a little larger so the block sits just above true centre (tall
              headings and the pills below would otherwise make it look low). Text stays left-aligned inside. */}
          <div className="m-auto w-full max-w-[524px] px-8 pt-16 pb-[calc(4rem+5vh)]">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={stepKey}
                custom={direction}
                variants={step}
                initial="enter"
                animate="shown"
                exit="leave"
                className="flex flex-col gap-7"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          {footer ? <div className="absolute right-6 bottom-5">{footer}</div> : null}
        </main>
      </div>
    </MotionConfig>
  );
}

/** A step's heading: where it sits in the setup, its title and what it's for. */
export function StepHeading({
  step: position,
  title,
  children,
}: {
  step?: string | undefined;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Reveal>
      <header className="flex flex-col gap-3">
        {position ? <span className="type-overline text-fg-subtle">{position}</span> : null}
        {/* The welcome is a title page; the steps after it are forms and take a smaller heading. */}
        <h1 className={position ? "type-display-l text-fg" : "type-display-xl text-fg"}>{title}</h1>
        {children ? <p className="type-body-l text-fg-muted">{children}</p> : null}
      </header>
    </Reveal>
  );
}
