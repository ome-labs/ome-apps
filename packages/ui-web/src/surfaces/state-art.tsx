import { StateObject, type StateObjectId } from "@ome-labs/brand/web";

import { cn } from "../styling/class-names.ts";

export type StateArtProps = {
  id: StateObjectId;
  /** The longest side in pixels; leave it out for the drawing's own size. */
  size?: number | undefined;
  /** Leave out for the manifest's alt text; pass "" when a title next to it says the same. */
  alt?: string | undefined;
  className?: string | undefined;
};

/**
 * A state object (pages 13b, 13c) that follows the theme: both drawings are in the page and the stylesheet shows
 * the one for the nearest `data-theme`, or for the system when the app follows it. No flash, no theme hook.
 */
export function StateArt({ id, size, alt, className }: StateArtProps) {
  return (
    <>
      <StateObject
        id={id}
        theme="light"
        size={size}
        alt={alt}
        className={cn("ome-art-light", className)}
      />
      <StateObject
        id={id}
        theme="dark"
        size={size}
        alt={alt}
        className={cn("ome-art-dark", className)}
      />
    </>
  );
}
