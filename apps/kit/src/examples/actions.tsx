import { Button, IconButton } from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";

export function ButtonVariants() {
  return (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          <Button size={size} variant="primary" icon="signature">
            Approve
          </Button>
          <Button size={size} variant="secondary">
            Review
          </Button>
          <Button size={size} variant="ghost">
            Cancel
          </Button>
          <Button size={size} variant="danger">
            Reject
          </Button>
        </div>
      ))}
    </div>
  );
}

export function ButtonStates() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" icon="plus">
        New proposal
      </Button>
      <Button variant="primary" disabled>
        Approve
      </Button>
      <Button disabled>Review</Button>
      <Button variant="danger" disabled>
        Remove member
      </Button>
    </div>
  );
}

export function IconButtons() {
  return (
    <div className="flex items-center gap-2">
      <IconButton icon="more-horizontal" label="More actions" />
      <IconButton icon="refresh" label="Refresh" variant="secondary" />
      <IconButton icon="lock" label="Lock signer" size="sm" />
      <IconButton icon="lock" label="Lock signer" size="md" />
      <IconButton icon="lock" label="Lock signer" size="lg" variant="secondary" />
      <IconButton icon="lock" label="Lock signer" disabled />
    </div>
  );
}

export const actions: ExampleSet = {
  title: "Actions",
  description:
    "Four button styles in three sizes. Primary is for the one action a screen exists for; disabled is a sunken fill so the label stays legible.",
  examples: [
    { name: "ButtonVariants", title: "Variants and sizes", Component: ButtonVariants },
    { name: "ButtonStates", title: "With an icon, and disabled", Component: ButtonStates },
    {
      name: "IconButtons",
      title: "Icon buttons",
      description: "Every icon button carries a label for assistive technology.",
      Component: IconButtons,
    },
  ],
};
