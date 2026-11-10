import { useMemo } from "react";

import { PixelObject, type ObjectId, textureUrls, type TextureId } from "@ome-labs/brand/web";

/** One pixel object in a scene: which, how big, and where its centre sits (in % of the scene). */
export interface Placed {
  id: ObjectId;
  size: 48 | 64 | 96 | 128;
  x: number;
  y: number;
}

/**
 * A card's picture, composed from the kit: a texture as the backdrop and a few pixel objects standing on it. Sharper
 * and calmer than a full scene at card size, and every object keeps its square pixels.
 */
export function WayScene({ texture, objects }: { texture: TextureId; objects: Placed[] }) {
  const backdrop = useMemo(
    () => ({
      backgroundImage: `image-set(url("${textureUrls[texture]["1x"]}") 1x, url("${textureUrls[texture]["2x"]}") 2x)`,
      imageRendering: "pixelated" as const,
    }),
    [texture],
  );

  return (
    <div
      aria-hidden
      className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-brand-night bg-cover bg-center"
      style={backdrop}
    >
      {objects.map((object) => (
        <Object key={`${object.id}-${object.x}`} object={object} />
      ))}
    </div>
  );
}

function Object({ object }: { object: Placed }) {
  const position = useMemo(
    () => ({ left: `${object.x}%`, top: `${object.y}%` }),
    [object.x, object.y],
  );
  return (
    <PixelObject
      id={object.id}
      size={object.size}
      alt=""
      className="absolute -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_4px_0_rgba(10,22,56,0.35)]"
      style={position}
    />
  );
}
