import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";

import type { PagePath } from "../site/pages.ts";

type PillLinkProps = {
  /** A page of the site, a place on this page, or a full URL elsewhere (marked with an outward arrow). */
  to: PagePath | `#${string}` | `https://${string}`;
  /** `light` is the white call to action; `ghost` is glass for the second choice. */
  kind?: "light" | "ghost";
  children: ReactNode;
  className?: string | undefined;
};

const kinds = {
  light:
    "bg-white text-brand-night shadow-[0_6px_18px_rgb(5_8_20/0.2)] hover:bg-[#e3eafb] hover:shadow-[0_10px_26px_rgb(5_8_20/0.3)]",
  ghost:
    "border border-white/30 bg-white/10 text-white backdrop-blur-xl hover:border-white/50 hover:bg-white/20",
};

/** The website's button: a pill whose arrow slides in on hover (motion/fast). */
export function PillLink({ to, kind = "light", children, className }: PillLinkProps) {
  const external = to.startsWith("https://");
  const anchor = to.startsWith("#");
  const classes = cn(
    "group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium transition-[background-color,border-color,box-shadow] duration-150 ease-standard",
    kinds[kind],
    className,
  );
  const arrow = (
    <Icon
      name={external ? "arrow-up-right" : "arrow-right"}
      size={16}
      className={cn(
        "transition-[opacity,transform] duration-150 ease-standard",
        external
          ? "opacity-70"
          : "-ml-1 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100",
      )}
    />
  );

  if (external || anchor) {
    return (
      <a href={to} className={classes} rel={external ? "noreferrer" : undefined}>
        {children}
        {arrow}
      </a>
    );
  }

  return (
    <Link to={to as PagePath} className={classes}>
      {children}
      {arrow}
    </Link>
  );
}
