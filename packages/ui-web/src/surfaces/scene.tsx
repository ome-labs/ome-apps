import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { Illustration, type IllustrationId } from "@ome-labs/brand/web";
import { tokens } from "@ome-labs/tokens";
import { animate, useReducedMotion } from "motion/react";

import { cn } from "../styling/class-names.ts";

// Page 18: scenes never cross-fade. Pixels switch in ordered-dither steps (Bayer 8×8) over six frames, so a
// change of scene looks like the art itself, not a video effect.

const bayerSize = 8;
const frames = tokens.motion.sceneSteps;

/**
 * The 8×8 Bayer threshold (0–63) at a cell: the bits of `x XOR y` and `y`, interleaved and reversed. Same
 * values as the textbook recursive construction, without building the matrix.
 */
function bayer(x: number, y: number): number {
  const mixed = x ^ y;
  let value = 0;

  for (let bit = 0; bit < 3; bit += 1) {
    value |= ((mixed >> bit) & 1) << (5 - 2 * bit);
    value |= ((y >> bit) & 1) << (4 - 2 * bit);
  }

  return value;
}

/** One mask tile per frame: the cells whose threshold is below that frame's share are opaque. */
const masks = (() => {
  const cells = bayerSize * bayerSize;
  const grid = Array.from({ length: bayerSize }, (_, index) => index);

  return Array.from({ length: frames + 1 }, (_, frame) => {
    const limit = (frame / frames) * cells;
    const rects = grid.flatMap((y) =>
      grid.flatMap((x) =>
        bayer(x, y) < limit ? [`<rect x="${x}" y="${y}" width="1" height="1"/>`] : [],
      ),
    );
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">${rects.join("")}</svg>`;

    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  });
})();

export type SceneProps = {
  id: IllustrationId;
  alt?: string | undefined;
  className?: string | undefined;
};

/** An illustration that changes scene with the kit's dither dissolve (the execute sequence, founding). */
export function Scene({ id, alt, className }: SceneProps) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(id);
  const [frame, setFrame] = useState(0);

  // With reduced motion the new scene simply replaces the old one.
  const settled = reduceMotion ? id : shown;
  const incoming = settled === id ? null : id;

  useEffect(() => {
    if (!incoming) return;

    const controls = animate(0, frames, {
      duration: tokens.motion.duration.scene / 1000,
      ease: "linear",
      onUpdate: (value) => setFrame(Math.floor(value)),
      onComplete: () => {
        setShown(incoming);
        setFrame(0);
      },
    });

    return () => controls.stop();
  }, [incoming]);

  // The art is drawn at 320 × 200 and shown at ×3 or more, so one dither cell is three screen pixels.
  const maskStyle = useMemo<CSSProperties>(
    () => ({
      maskImage: masks[frame],
      maskSize: "24px 24px",
      WebkitMaskImage: masks[frame],
      WebkitMaskSize: "24px 24px",
    }),
    [frame],
  );

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Illustration
        id={settled}
        {...(alt === undefined ? {} : { alt })}
        className="block size-full object-cover"
      />
      {incoming ? (
        <Illustration
          id={incoming}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover"
          style={maskStyle}
        />
      ) : null}
    </div>
  );
}
