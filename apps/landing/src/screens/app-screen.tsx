import { cn } from "@ome-labs/ui-web";

import audit1x from "./audit@1x.webp";
import audit2x from "./audit@2x.webp";
import members1x from "./members@1x.webp";
import members2x from "./members@2x.webp";
import overview1x from "./overview@1x.webp";
import overview2x from "./overview@2x.webp";
import review1x from "./review@1x.webp";
import review2x from "./review@2x.webp";

// The desktop app on its sample data, in the light theme, captured at 1280 × 800 from the renderer's browser mode
// (see the README). They show the app as it is, so they're retaken when its screens change.
const screens = {
  overview: {
    sources: [overview1x, overview2x],
    alt: "The Ome desktop app's vault overview: proposals that need you, recent activity, balances and the vault's health.",
  },
  review: {
    sources: [review1x, review2x],
    alt: "A proposal in the Ome desktop app: what happens in plain words, the calls as rebuilt on this device, and the approvals so far.",
  },
  members: {
    sources: [members1x, members2x],
    alt: "The members of a vault in the Ome desktop app, with each member's keeper and when it was last seen.",
  },
  audit: {
    sources: [audit1x, audit2x],
    alt: "A keeper's audit log in the Ome desktop app: every read request it answered, who asked and for what.",
  },
} as const;

export type ScreenId = keyof typeof screens;

type AppScreenProps = {
  id: ScreenId;
  /** The space it takes on the page, for picking 1x or 2x. */
  sizes?: string;
  className?: string | undefined;
  /** Load it before it nears the viewport; for the first screen on a page. */
  eager?: boolean;
};

/** A screen of the desktop app, framed like a window on the sky. */
export function AppScreen({
  id,
  sizes = "(min-width: 1280px) 1200px, 100vw",
  className,
  eager,
}: AppScreenProps) {
  const { sources, alt } = screens[id];

  return (
    <img
      src={sources[0]}
      srcSet={`${sources[0]} 1280w, ${sources[1]} 2560w`}
      sizes={sizes}
      width={1280}
      height={800}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn(
        "aspect-[1280/800] h-auto w-full rounded-[clamp(8px,1.1vw,14px)] bg-brand-paper object-cover object-left-top shadow-[0_30px_100px_rgb(5_8_20/0.42)] outline outline-1 outline-white/50",
        className,
      )}
    />
  );
}
