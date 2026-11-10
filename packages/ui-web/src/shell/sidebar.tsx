import type { ReactNode } from "react";

import { cn } from "../styling/class-names.ts";

export type SidebarProps = {
  /** The vault switcher, or a "No vaults yet" note. */
  header?: ReactNode | undefined;
  /** Groups of `SidebarItem`s, top to bottom. */
  children: ReactNode;
  /** Pinned to the bottom: Create vault, Join vault, Devices. */
  footer?: ReactNode | undefined;
  className?: string | undefined;
};

/** Page 40's sidebar, 240 wide: the vault, its places, then the actions that aren't about one vault. */
export function Sidebar({ header, children, footer, className }: SidebarProps) {
  return (
    <nav
      aria-label="Main"
      className={cn(
        "flex w-60 shrink-0 flex-col gap-1 border-r border-line-subtle bg-surface px-3 py-4",
        className,
      )}
    >
      {header}
      <div className="flex flex-1 flex-col gap-3 pt-2">{children}</div>
      {footer ? <div className="flex flex-col gap-0.5">{footer}</div> : null}
    </nav>
  );
}

export type SidebarGroupProps = {
  /** An overline such as "VAULT"; omit for the first group. */
  title?: string | undefined;
  children: ReactNode;
};

export function SidebarGroup({ title, children }: SidebarGroupProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {title ? <span className="px-2.5 pb-1 type-overline text-fg-subtle">{title}</span> : null}
      {children}
    </div>
  );
}
