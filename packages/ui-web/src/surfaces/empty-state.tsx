import type { ReactNode } from "react";

import { Illustration, Scene, type IllustrationId, type SceneId } from "@ome-labs/brand/web";

import { cn } from "../styling/class-names.ts";

export type EmptyStateProps = {
  illustration?: IllustrationId | undefined;
  /** One of the app's scenes, in place of an illustration. */
  scene?: SceneId | undefined;
  title: string;
  children?: ReactNode | undefined;
  action?: ReactNode | undefined;
  /** A bigger picture, for states that fill a whole window. */
  large?: boolean | undefined;
  className?: string | undefined;
};

/** Page 39's empty state: a small scene, what's missing, and the one thing to do about it. */
export function EmptyState({
  illustration,
  scene,
  title,
  children,
  action,
  large,
  className,
}: EmptyStateProps) {
  const picture = cn(
    "rounded-md object-cover shadow-1",
    large ? "h-[200px] w-80" : "h-[120px] w-48",
  );
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-7 text-center", className)}>
      {/* The title says what the scene shows, so the image is decorative here. */}
      {scene ? (
        <Scene id={scene} alt="" className={picture} />
      ) : illustration ? (
        <Illustration id={illustration} alt="" className={picture} />
      ) : null}
      <h3 className="type-heading-s text-fg">{title}</h3>
      {children ? <div className="max-w-[360px] type-body-s text-fg-muted">{children}</div> : null}
      {action}
    </div>
  );
}
