import type { ComponentProps, ReactNode } from "react";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";

import { cn } from "../styling/class-names.ts";

export type TabsProps<Value extends string> = Omit<
  ComponentProps<typeof BaseTabs.Root>,
  "onValueChange" | "children"
> & {
  tabs: { value: Value; label: string; content: ReactNode }[];
  onValueChange?: (value: Value) => void | undefined;
};

/** Page 28's tabs: an underline under the selected label that slides between tabs. */
export function Tabs<Value extends string>({
  tabs,
  onValueChange,
  className,
  ...props
}: TabsProps<Value>) {
  return (
    <BaseTabs.Root
      onValueChange={(value) => onValueChange?.(value as Value)}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <BaseTabs.List className="relative flex gap-5 border-b border-line-subtle">
        {tabs.map((tab) => (
          <BaseTabs.Tab
            key={tab.value}
            value={tab.value}
            className="focus-ring rounded-xs px-0.5 py-2 type-label-m text-fg-subtle transition-colors duration-fast ease-standard hover:text-fg data-[selected]:text-fg"
          >
            {tab.label}
          </BaseTabs.Tab>
        ))}
        <BaseTabs.Indicator className="absolute bottom-[-1px] left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] rounded-full bg-accent transition-[left,width] duration-base ease-standard" />
      </BaseTabs.List>
      {tabs.map((tab) => (
        <BaseTabs.Panel key={tab.value} value={tab.value} className="outline-none">
          {tab.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
