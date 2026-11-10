import { tokens } from "@ome-labs/tokens";
import { View } from "react-native";

import { cn } from "../styling/class-names.ts";
import { discBevel } from "../styling/depth.ts";
import { Text } from "../styling/text.tsx";

// Page 30: four fills that read in both themes, so they come from primitives rather than theme roles.
const palette = [
  [tokens.color.primitive["lake/600"], tokens.color.primitive["ink/0"]],
  [tokens.color.primitive["ink/700"], tokens.color.primitive["ink/0"]],
  [tokens.color.primitive["sun/200"], tokens.color.primitive["ink/900"]],
  [tokens.color.primitive["lake/200"], tokens.color.primitive["ink/900"]],
].map(([background, text]) => ({
  circle: { ...discBevel, backgroundColor: background },
  initial: { color: text },
}));

const sizes = {
  sm: ["size-5", "text-[10px]"],
  md: ["size-7", "text-xs"],
  lg: ["size-10", "text-[15px]"],
} as const;

export type MemberAvatarProps = {
  name: string;
  /** The member's index (1, 2, 3…), which picks a fill that stays the same everywhere. */
  index: number;
  size?: keyof typeof sizes | undefined;
  className?: string | undefined;
};

/** A member's initial on a bevelled disc. Hidden from screen readers: the name always appears beside it. */
export function MemberAvatar({ name, index, size = "md", className }: MemberAvatarProps) {
  const fill = palette[(index - 1 + palette.length) % palette.length];
  const [box, text] = sizes[size];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={fill?.circle}
      className={cn("items-center justify-center rounded-full", box, className)}
    >
      <Text className={cn("font-sans-medium", text)} style={fill?.initial}>
        {[...name.trim()][0]?.toUpperCase() ?? "?"}
      </Text>
    </View>
  );
}
