import { Banner, Button } from "@ome-labs/ui-web";

import type { Preflight } from "../../bridge/contract.ts";
import { BrandMark } from "./brand-mark.tsx";
import { StepHeading } from "./layout.tsx";

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
      <BrandMark className="size-14" />
      <StepHeading title="Welcome to Ome">
        A private multisig vault on Aztec: members approve together, and read together.
      </StepHeading>
      {missing ? (
        <Banner kind="warning">
          Ome's daemon isn't installed on this computer. Install Ome from ome.network, then open the
          app again.
        </Banner>
      ) : null}
      <div>
        <Button variant="primary" size="lg" disabled={!preflight || missing} onClick={onStart}>
          Set up Ome
        </Button>
      </div>
    </>
  );
}
