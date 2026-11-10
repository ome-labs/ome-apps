import type { ReactNode } from "react";

import { Select as BaseSelect } from "@base-ui/react/select";
import { Icon } from "@ome-labs/icons/web";

import { cn } from "../styling/class-names.ts";

export type SelectOption<Value extends string> = {
  value: Value;
  label: string;
  /** Something before the label, such as a token monogram. */
  leading?: ReactNode | undefined;
  /** Quiet text at the end, such as a balance. */
  meta?: string | undefined;
  disabled?: boolean | undefined;
};

export type SelectProps<Value extends string> = {
  options: SelectOption<Value>[];
  value?: Value | null | undefined;
  defaultValue?: Value | undefined;
  onValueChange?: (value: Value) => void | undefined;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  /** Accessible name, when the select isn't inside a `Field`. */
  "aria-label"?: string | undefined;
  className?: string | undefined;
};

/** Page 25's select: a field-height trigger that opens a raised list under it. */
export function Select<Value extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Choose…",
  disabled,
  className,
  ...props
}: SelectProps<Value>) {
  return (
    <BaseSelect.Root<Value>
      items={options}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      onValueChange={(next) => {
        if (next !== null) onValueChange?.(next);
      }}
      disabled={disabled}
    >
      <BaseSelect.Trigger
        aria-label={props["aria-label"]}
        className={cn(
          "flex h-control-md w-full items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-left",
          "type-body-s text-fg outline-none transition-[border-color,box-shadow] duration-fast ease-standard",
          "focus-visible:border-accent focus-visible:shadow-focus data-[popup-open]:border-accent",
          "data-[disabled]:cursor-not-allowed data-[disabled]:bg-sunken data-[disabled]:text-fg-disabled",
          className,
        )}
      >
        <BaseSelect.Value className="flex min-w-0 flex-1 items-center gap-2">
          {(current: Value | null) => {
            const option = options.find((item) => item.value === current);
            if (!option) return <span className="text-fg-subtle">{placeholder}</span>;

            return (
              <>
                {option.leading}
                <span className="truncate">{option.label}</span>
                {option.meta ? (
                  <span className="ml-auto type-mono-s text-fg-subtle">{option.meta}</span>
                ) : null}
              </>
            );
          }}
        </BaseSelect.Value>
        <BaseSelect.Icon className="text-fg-subtle">
          <Icon name="chevrons-up-down" size={16} className="size-3.5" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner
          sideOffset={4}
          alignItemWithTrigger={false}
          className="z-50 outline-none"
        >
          <BaseSelect.Popup
            className={cn(
              "min-w-[var(--anchor-width)] rounded-lg border border-line bg-raised p-1 shadow-2 outline-none",
              "origin-[var(--transform-origin)] transition-[opacity,scale] duration-base ease-standard",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            )}
          >
            <BaseSelect.List>
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    "flex h-control-md cursor-default items-center gap-2 rounded-sm px-2.5 type-body-s text-fg outline-none",
                    "data-[highlighted]:bg-hover data-[disabled]:text-fg-disabled",
                  )}
                >
                  {option.leading}
                  <BaseSelect.ItemText className="flex-1 truncate">
                    {option.label}
                  </BaseSelect.ItemText>
                  {option.meta ? (
                    <span className="type-mono-s text-fg-subtle">{option.meta}</span>
                  ) : null}
                  <BaseSelect.ItemIndicator className="text-accent-fg">
                    <Icon name="check" size={16} />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
