import { Banner, Button, toast } from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";

export function Banners() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Banner
        kind="alarm"
        action={{ label: "Review", onClick: () => toast.info("Review pressed") }}
      >
        This vault's on-chain config names a committee your keeper can't verify. It won't act until
        you look.
      </Banner>
      <Banner kind="alarm">A transaction from this vault matches no approved proposal.</Banner>
      <Banner kind="warning">Member 3's keeper sent invalid read shares.</Banner>
      <Banner kind="info">
        A membership change didn't complete; its pending share was discarded.
      </Banner>
      <Banner kind="success">New members active (epoch 2).</Banner>
    </div>
  );
}

export function Toasts() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.success("New members active (epoch 2).")}>Success</Button>
      <Button
        onClick={() =>
          toast.error("Proving failed.", {
            action: { label: "Show logs", onClick: () => toast.info("Show logs pressed") },
          })
        }
      >
        Error
      </Button>
      <Button onClick={() => toast.info("Proposal 335c is ready.")}>Info</Button>
    </div>
  );
}

export const feedback: ExampleSet = {
  title: "Feedback",
  description:
    "Banners stay until the cause is gone; toasts confirm what just happened and carry one quiet action at most.",
  examples: [
    { name: "Banners", title: "Banners", Component: Banners, wide: true },
    { name: "Toasts", title: "Toasts", description: "Press one to see it.", Component: Toasts },
  ],
};
