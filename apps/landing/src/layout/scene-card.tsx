import type { ReactNode } from "react";

import type { SceneArt } from "../art/art-files.ts";
import { PixelArt } from "../art/pixel-art.tsx";

type SceneCardProps = {
  scene: SceneArt;
  title: string;
  body: string;
  /** A small amber label above the title: what it's called, or "planned". */
  tag?: string;
};

/** A card with a window onto one of the app's scenes. Cards in a row share the tallest one's height. */
export function SceneCard({ scene, title, body, tag }: SceneCardProps) {
  return (
    <div className="h-full">
      <article className="glass-soft flex h-full flex-col gap-3.5 rounded-2xl p-3 md:p-3.5">
        <PixelArt
          scene={scene}
          alt=""
          className="aspect-[16/9] h-auto w-full rounded-[14px] object-cover"
        />
        <div className="flex flex-col gap-2 px-1.5 pb-1.5">
          {tag ? <span className="font-mono text-xs text-amber">{tag}</span> : null}
          <h3 className="text-lg font-semibold md:text-xl">{title}</h3>
          <p className="text-sm leading-[1.5] text-white/88 md:text-[15px]">{body}</p>
        </div>
      </article>
    </div>
  );
}

/** A row of cards: stacked on a phone, side by side from a tablet up, all one height. */
export function CardRow({ columns, children }: { columns: 2 | 3 | 4; children: ReactNode }) {
  const grid = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 xl:grid-cols-4" }[
    columns
  ];

  return (
    <div className={`mx-auto grid w-full max-w-[1200px] gap-3.5 md:gap-6 ${grid}`}>{children}</div>
  );
}
