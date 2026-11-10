import { type ReactNode, useCallback } from "react";

import type { IllustrationId } from "@ome-labs/brand/web";
import { Button, type ButtonProps, EmptyState } from "@ome-labs/ui-web";

import { TitleStrip } from "./window-chrome.tsx";

/** A state that replaces the whole window: the daemon isn't there, or the app is still reaching it. */
export function FullScreen({
  illustration,
  title,
  children,
  action,
}: {
  illustration: IllustrationId;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="relative grid h-dvh place-items-center bg-canvas p-10">
      <TitleStrip />
      <EmptyState illustration={illustration} title={title} action={action} className="max-w-md">
        {children}
      </EmptyState>
    </div>
  );
}

/** A button that runs `run` with no arguments, so a click event never reaches a function that takes options. */
export function RunButton({
  run,
  variant = "primary",
  children,
}: {
  run: () => unknown;
  variant?: ButtonProps["variant"];
  children: ReactNode;
}) {
  const click = useCallback(() => void run(), [run]);
  return (
    <Button variant={variant} onClick={click}>
      {children}
    </Button>
  );
}
