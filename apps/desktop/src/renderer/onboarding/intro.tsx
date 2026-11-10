import { Icon, type IconName } from "@ome-labs/icons/web";
import { Banner, Button } from "@ome-labs/ui-web";
import { motion } from "motion/react";

import type { Preflight } from "../../bridge/contract.ts";
import { BrandMark } from "./brand-mark.tsx";
import { StepHeading } from "./layout.tsx";
import { Reveal, part } from "./motion.tsx";

/** What a vault does, in the three promises the product makes. */
const PROMISES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "signature",
    title: "Approve together",
    text: "Money moves only when enough members sign.",
  },
  { icon: "eye", title: "Read together", text: "Balances open only with enough members' keepers." },
  {
    icon: "key",
    title: "Your key stays here",
    text: "Your signing key is sealed on this computer.",
  },
];

/** The first screen: what Ome is, and the way in. Setting up waits for the daemon to be found. */
export function Intro({
  preflight,
  onStart,
}: {
  preflight: Preflight | undefined;
  onStart: () => void;
}) {
  const missing = preflight !== undefined && preflight.omed === null;

  return (
    <>
      <Reveal>
        <BrandMark className="size-14" />
      </Reveal>
      <StepHeading title="Welcome to Ome">
        A private multisig vault on Aztec: members approve together, and read together.
      </StepHeading>
      <ul className="flex flex-col gap-2.5">
        {PROMISES.map((promise) => (
          <motion.li
            key={promise.title}
            variants={part}
            className="flex items-center gap-3.5 rounded-lg bg-surface px-4 py-3.5 shadow-1"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-subtle text-accent-fg">
              <Icon name={promise.icon} size={16} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="type-label-m text-fg">{promise.title}</span>
              <span className="type-body-s text-fg-muted">{promise.text}</span>
            </span>
          </motion.li>
        ))}
      </ul>
      {missing ? (
        <Reveal>
          <Banner kind="warning">
            Ome's daemon isn't installed on this computer. Install Ome from ome.network, then open
            the app again.
          </Banner>
        </Reveal>
      ) : null}
      <Reveal>
        <Button variant="primary" size="lg" disabled={!preflight || missing} onClick={onStart}>
          Set up Ome
        </Button>
      </Reveal>
    </>
  );
}
