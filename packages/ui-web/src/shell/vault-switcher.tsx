import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Logo } from "@ome-labs/brand/web";
import { approvalsLabel } from "@ome-labs/format";
import { Icon } from "@ome-labs/icons/web";

import { cn } from "../styling/class-names.ts";

export type VaultChoice = {
  address: string;
  name: string;
  alias: string;
  threshold: number;
  members: number;
};

export type VaultSwitcherProps = {
  vaults: VaultChoice[];
  current: string;
  onSelect: (address: string) => void;
  className?: string | undefined;
};

/** Page 40's switcher at the top of the sidebar: the vault's name, its alias and threshold, and the others. */
export function VaultSwitcher({ vaults, current, onSelect, className }: VaultSwitcherProps) {
  const vault = vaults.find((item) => item.address === current) ?? vaults[0];
  if (!vault) return null;

  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger
        className={cn(
          "focus-ring flex w-full items-center gap-2.5 rounded-[10px] border border-line-subtle bg-canvas p-2.5 text-left",
          "transition-colors duration-fast ease-standard hover:bg-hover",
          className,
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-on-accent">
          <Logo variant="mark" tone="mono" title="" className="size-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate type-label-m text-fg">{vault.name}</span>
          <span className="truncate type-mono-s text-fg-subtle">
            {vault.alias} · {vault.threshold} of {vault.members}
          </span>
        </span>
        <Icon name="chevrons-up-down" size={16} tone="fg-subtle" className="size-3.5" />
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner align="start" sideOffset={4} className="z-50">
          <BaseMenu.Popup className="flex w-[var(--anchor-width)] flex-col gap-0.5 rounded-[10px] border border-line bg-raised p-1 shadow-2 outline-none">
            <BaseMenu.RadioGroup
              value={current}
              onValueChange={(value) => onSelect(value as string)}
            >
              {vaults.map((item) => (
                <BaseMenu.RadioItem
                  key={item.address}
                  value={item.address}
                  className="flex cursor-default items-center gap-2.5 rounded-sm px-2.5 py-2 outline-none data-[highlighted]:bg-hover"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate type-label-m text-fg">{item.name}</span>
                    <span className="type-caption text-fg-subtle">
                      {approvalsLabel(item.threshold, item.members)}
                    </span>
                  </span>
                  <BaseMenu.RadioItemIndicator>
                    <Icon name="check" size={16} tone="accent-fg" />
                  </BaseMenu.RadioItemIndicator>
                </BaseMenu.RadioItem>
              ))}
            </BaseMenu.RadioGroup>
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
