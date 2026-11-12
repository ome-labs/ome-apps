import type { CSSProperties, ReactNode } from "react";

import { cn } from "@ome-labs/ui-web";

import { rgbToHex, skyAt } from "../sky/palette.ts";
import { sceneTopHex, type SkySceneId } from "../sky/scene-edges.ts";

type SectionProps = {
  /** The hour this part of the page shows, as on the clock: "9:04 am". The sky paints it. */
  hour: string;
  /** A scene at the foot of the section; the sky takes its colours from the scene's edges. */
  scene?: SkySceneId;
  /** The moon hangs over this section. */
  moon?: boolean;
  id?: string;
  labelledBy?: string;
  className?: string | undefined;
  children: ReactNode;
};

/** One hour of the page's day. Its content sits above the sky; a scene, if any, is passed in as a child. */
export function Section({ hour, scene, moon, id, labelledBy, className, children }: SectionProps) {
  const fallback = {
    "--hour-sky": scene ? sceneTopHex(scene) : rgbToHex(skyAt(hour).sky),
  } as CSSProperties;

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-hour={hour}
      data-moon={moon ? "" : undefined}
      style={fallback}
      className={cn("relative isolate px-4 md:px-8", className)}
    >
      {children}
    </section>
  );
}
