// How the first run moves between steps. The step leaves quickly, toward where it came from; the next one arrives
// from the side it's heading to, its parts a beat apart. The scene behind crossfades slowly. With reduced motion,
// only the fades remain.
import type { ReactNode } from "react";

import { tokens } from "@ome-labs/tokens";
import { motion, type Variants } from "motion/react";

const { duration, easing } = tokens.motion;
const ms = (value: number) => value / 1000;

/** 1 forward, -1 back. */
export type Direction = 1 | -1;

export const step: Variants = {
  enter: {},
  shown: { transition: { staggerChildren: 0.045, delayChildren: 0.03 } },
  leave: (direction: Direction) => ({
    opacity: 0,
    x: direction * -12,
    transition: { duration: ms(duration.fast), ease: easing.standard },
  }),
};

/** A part of a step, arriving in turn; `Reveal` wraps one, or give it to a motion element directly. */
export const part: Variants = {
  enter: (direction: Direction) => ({ opacity: 0, x: direction * 20 }),
  shown: { opacity: 1, x: 0, transition: { duration: ms(duration.slow), ease: easing.emphasized } },
};

export const scene: Variants = {
  enter: { opacity: 0, scale: 1.04 },
  shown: {
    opacity: 1,
    scale: 1,
    transition: { duration: ms(duration.scene), ease: easing.emphasized },
  },
  leave: { opacity: 0, transition: { duration: ms(duration.scene), ease: easing.standard } },
};

/** One part of a step that arrives in turn: the heading, a field, the buttons. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={part} className={className}>
      {children}
    </motion.div>
  );
}
