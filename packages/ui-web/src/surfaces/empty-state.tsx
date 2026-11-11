import type { ReactNode } from "react";

import {
  Illustration,
  PixelObject,
  Scene,
  type IllustrationId,
  type ObjectId,
  type SceneId,
  type StateObjectId,
} from "@ome-labs/brand/web";

import { cn } from "../styling/class-names.ts";
import { StateArt } from "./state-art.tsx";

export type EmptyStateProps = {
  illustration?: IllustrationId | undefined;
  /** One of the app's scenes, in place of an illustration. */
  scene?: SceneId | undefined;
  /** A single pixel object, for a quieter state than a scene. */
  object?: ObjectId | undefined;
  /** A state object (page 13b): a built thing on its shadow, drawn for each theme. The usual choice in a card. */
  state?: StateObjectId | undefined;
  title: string;
  children?: ReactNode | undefined;
  action?: ReactNode | undefined;
  /** The picture: `md` inside a card, `lg` for states that fill a window, `xl` for a page that is only this. */
  size?: "md" | "lg" | "xl" | undefined;
  className?: string | undefined;
};

// Scenes are drawn on a 320 × 200 grid, so each size keeps that shape.
// State objects are sized by their longest side.
const STATE_SIZE = { md: 120, lg: 168, xl: 220 };

const PICTURE = {
  md: "h-[120px] w-48",
  lg: "h-[200px] w-80",
  xl: "aspect-[8/5] w-[480px] max-w-full",
};

/** Page 39's empty state: a state object or a small scene, what's missing, and the one thing to do about it. */
export function EmptyState({
  illustration,
  scene,
  object,
  state,
  title,
  children,
  action,
  size = "md",
  className,
}: EmptyStateProps) {
  const picture = cn("rounded-md object-cover shadow-1", PICTURE[size]);
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-7 text-center", className)}>
      {/* The title says what the scene shows, so the image is decorative here. */}
      {scene ? (
        <Scene id={scene} alt="" className={picture} />
      ) : illustration ? (
        <Illustration id={illustration} alt="" className={picture} />
      ) : state ? (
        <StateArt id={state} size={STATE_SIZE[size]} alt="" className="mb-1" />
      ) : object ? (
        <PixelObject id={object} size={96} alt="" className="mb-1" />
      ) : null}
      <h3 className="type-heading-s text-fg">{title}</h3>
      {children ? <div className="max-w-[360px] type-body-s text-fg-muted">{children}</div> : null}
      {action}
    </div>
  );
}
