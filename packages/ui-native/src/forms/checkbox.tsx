import { Icon } from "@ome-labs/icons/native";
import { Root as CheckboxRoot, Indicator as CheckboxIndicator } from "@rn-primitives/checkbox";
import { Pressable } from "react-native";

import { cn } from "../styling/class-names.ts";
import { depth } from "../styling/depth.ts";
import { Text } from "../styling/text.tsx";

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean | undefined;
  className?: string | undefined;
};

/**
 * Page 26's checkbox; the whole 44 pt row toggles it. Unchecked it is a small well; checked it fills with the accent
 * and lifts like a solid button. Disabled it lies flat.
 */
export function Checkbox({ label, checked, onCheckedChange, disabled, className }: CheckboxProps) {
  return (
    <Pressable
      accessible={false}
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      className={cn("min-h-11 flex-row items-center gap-3", className)}
    >
      <CheckboxRoot
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled ?? false}
        accessibilityLabel={label}
        className={cn(
          "size-5 items-center justify-center rounded-xs border",
          checked
            ? ["border-transparent bg-accent", !disabled && depth.accent]
            : ["border-line-strong bg-surface", !disabled && depth.field],
          disabled && "border-line bg-sunken",
        )}
      >
        <CheckboxIndicator>
          <Icon name="check" size={16} tone="on-accent" />
        </CheckboxIndicator>
      </CheckboxRoot>
      <Text className={cn("flex-1", disabled && "text-fg-disabled")}>{label}</Text>
    </Pressable>
  );
}
