import type { ComponentProps, ReactElement } from "react";

import { useRender } from "@base-ui/react/use-render";
import { Icon, type IconName } from "@ome-labs/icons/web";

import { cn } from "../styling/class-names.ts";

export type SidebarItemProps = ComponentProps<"a"> & {
  icon: IconName;
  label: string;
  active?: boolean | undefined;
  /** A count that needs attention, such as proposals waiting for this member. */
  count?: number | undefined;
  /** Render as the router's link: `render={<Link to="/proposals" />}`. */
  render?: ReactElement | undefined;
};

/** Page 28's nav item: a link, marked as the current page when active. */
export function SidebarItem({
  icon,
  label,
  active,
  count,
  render,
  className,
  ...props
}: SidebarItemProps) {
  return useRender({
    defaultTagName: "a",
    render,
    props: {
      "aria-current": active ? "page" : undefined,
      className: cn(
        "focus-ring flex h-control-md items-center gap-2.5 rounded-md px-2.5 type-label-m text-fg-muted",
        "transition-[background-color,box-shadow,color] duration-fast ease-standard hover:bg-hover hover:text-fg",
        // The current page is raised off the sidebar like a pressed-out tab, its icon in the accent, instead of a
        // flat blue fill competing with the primary button.
        active && "bg-raised text-fg shadow-control hover:bg-raised hover:text-fg",
        className,
      ),
      children: (
        <>
          <Icon name={icon} size={16} className={active ? "text-accent-fg" : undefined} />
          <span className="flex-1 truncate">{label}</span>
          {count ? (
            <span
              className={cn(
                "rounded-full px-1.5 type-label-s",
                active
                  ? "bg-accent text-on-accent shadow-accent"
                  : "bg-sunken text-fg-muted shadow-field",
              )}
            >
              {count}
            </span>
          ) : null}
        </>
      ),
      ...props,
    },
  });
}
