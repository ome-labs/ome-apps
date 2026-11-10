import { type ReactNode, useCallback } from "react";

import type { IllustrationId } from "@ome-labs/brand/web";
import { Button, EmptyState } from "@ome-labs/ui-web";

/** A state that replaces the whole window: the daemon isn't there, or the app is still reaching it. */
export function FullScreen({
  illustration,
  title,
  children,
  onRetry,
}: {
  illustration: IllustrationId;
  title: string;
  children?: ReactNode;
  /** Offers "Try again", which calls this. */
  onRetry?: (() => unknown) | undefined;
}) {
  const retry = useCallback(() => void onRetry?.(), [onRetry]);

  return (
    <div className="grid h-dvh place-items-center bg-canvas p-10">
      <EmptyState
        illustration={illustration}
        title={title}
        action={
          onRetry ? (
            <Button variant="primary" onClick={retry}>
              Try again
            </Button>
          ) : undefined
        }
        className="max-w-md"
      >
        {children}
      </EmptyState>
    </div>
  );
}
