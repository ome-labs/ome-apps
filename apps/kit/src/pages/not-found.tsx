import { Link } from "@tanstack/react-router";

import { EmptyState } from "@ome-labs/ui-web";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <EmptyState
        illustration="no-vaults"
        title="This page isn't in the kit"
        action={
          <Link
            to="/"
            className="focus-ring inline-flex h-control-md items-center rounded-md border border-line bg-surface px-3 type-label-m text-fg hover:bg-hover"
          >
            Back to the overview
          </Link>
        }
      >
        Check the address, or press ⌘K to search pages and examples.
      </EmptyState>
    </div>
  );
}
