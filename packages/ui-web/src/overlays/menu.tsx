import type { ReactElement } from "react";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Icon, type IconName } from "@ome-labs/icons/web";

import { cn } from "../styling/class-names.ts";

export type MenuItem =
  | {
      label: string;
      icon?: IconName;
      shortcut?: string;
      danger?: boolean;
      disabled?: boolean;
      onSelect: () => void;
    }
  | "separator";

export type MenuProps = {
  trigger: ReactElement;
  items: MenuItem[];
  align?: "start" | "center" | "end" | undefined;
};

/** Page 37's menu: icon, label and shortcut per row; a danger row in red, last, after a separator. */
export function Menu({ trigger, items, align = "end" }: MenuProps) {
  // Separators have no identity of their own, so they are keyed by where they sit.
  const rows = items.map((item, position) => ({
    item,
    key: item === "separator" ? `separator-${position}` : item.label,
  }));

  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner align={align} sideOffset={4} className="z-50 outline-none">
          <BaseMenu.Popup
            className={cn(
              "flex w-60 flex-col gap-0.5 rounded-[10px] border border-line bg-raised p-1 shadow-2 outline-none",
              "origin-[var(--transform-origin)] transition-[opacity,scale] duration-base ease-standard",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            )}
          >
            {rows.map(({ item, key }) =>
              item === "separator" ? (
                <BaseMenu.Separator key={key} className="mx-1 my-1 h-px bg-line-subtle" />
              ) : (
                <BaseMenu.Item
                  key={key}
                  disabled={item.disabled}
                  onClick={item.onSelect}
                  className={cn(
                    "flex h-control-md cursor-default items-center gap-2.5 rounded-sm px-2.5 type-body-s outline-none",
                    "data-[highlighted]:bg-hover data-[disabled]:text-fg-disabled",
                    item.danger ? "text-danger" : "text-fg",
                  )}
                >
                  {item.icon ? (
                    <Icon name={item.icon} size={16} tone={item.danger ? "danger" : "fg-muted"} />
                  ) : null}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut ? (
                    <kbd className="type-mono-s text-fg-subtle">{item.shortcut}</kbd>
                  ) : null}
                </BaseMenu.Item>
              ),
            )}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
