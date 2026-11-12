import type { ReactNode } from "react";

import { PixelArt } from "../art/pixel-art.tsx";
import type { SkySceneId } from "../sky/scene-edges.ts";

type SceneBackdropProps = {
  id: SkySceneId;
  /** Drawn over the scene in its own coordinates (lantern glows); positioned in percent of 320 × 200. */
  children?: ReactNode;
};

/**
 * A scene standing at the foot of its section, 320 × 200 logical pixels wide and centred, so a phone sees its
 * middle. The sky canvas paints it into the sky; the image is there for the first paint, for search and for
 * readers without script.
 */
export function SceneBackdrop({ id, children }: SceneBackdropProps) {
  return (
    <div
      data-sky-scene={id}
      className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[calc(200*var(--k))] w-[calc(320*var(--k))] -translate-x-1/2"
    >
      <PixelArt
        illustration={id}
        alt=""
        loading={id === "hero-dawn" ? "eager" : "lazy"}
        fetchPriority={id === "hero-dawn" ? "high" : "auto"}
        className="scene-fade size-full"
      />
      {children}
    </div>
  );
}

/** The lanterns in the night scene (hero-night), in its logical pixels. */
export const nightLanterns: readonly (readonly [number, number])[] = [
  [104, 170],
  [119, 144],
  [160, 133],
  [205, 147],
  [251, 162],
];

/** A lantern's warm light, breathing over the night scene. */
export function LanternGlow({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <span
      className="lantern-glow absolute size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_214_140/0.55),rgb(255_214_140/0))] md:size-24"
      style={{
        left: `${(x / 320) * 100}%`,
        top: `${(y / 200) * 100}%`,
        animationDelay: `${delay}ms`,
      }}
    />
  );
}
