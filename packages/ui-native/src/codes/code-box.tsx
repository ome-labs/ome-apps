import { View } from "react-native";

import { cn } from "../styling/class-names.ts";
import { depth } from "../styling/depth.ts";
import { Text } from "../styling/text.tsx";
import { CopyButton } from "../values/copy-button.tsx";

export type CodeBoxProps = {
  label: string;
  /** An invite, a join request or a pairing code. Shown on two lines at most; copied whole. */
  value: string;
  hint?: string | undefined;
  className?: string | undefined;
};

/** Page 35's code box: a mono value in a well, the same sunken surface as an input, with a copy button. */
export function CodeBox({ label, value, hint, className }: CodeBoxProps) {
  return (
    <View className={cn("gap-2", className)}>
      <Text className="type-label-m">{label}</Text>
      <View
        className={cn(
          "flex-row items-center gap-1 rounded-md border border-line-subtle bg-sunken pl-3",
          depth.field,
        )}
      >
        <Text numberOfLines={2} className="flex-1 py-2.5 type-mono-s">
          {value}
        </Text>
        <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
      </View>
      {hint ? <Text className="type-caption text-fg-subtle">{hint}</Text> : null}
    </View>
  );
}
