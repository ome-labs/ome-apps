import { Icon, type IconName } from "@ome-labs/icons/native";
import type { ColorName } from "@ome-labs/tokens";
import { View } from "react-native";

import { Button } from "../actions/button.tsx";
import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";
import { toneClasses } from "../styling/tones.ts";

const kinds = {
  alarm: { tone: "danger", icon: "alert-circle", colour: "danger" },
  warning: { tone: "warning", icon: "alert-triangle", colour: "warning" },
  info: { tone: "neutral", icon: "info", colour: "neutral" },
  success: { tone: "success", icon: "check-circle", colour: "success" },
} as const satisfies Record<
  string,
  { tone: keyof typeof toneClasses; icon: IconName; colour: ColorName }
>;

export type BannerProps = {
  kind: keyof typeof kinds;
  children: string;
  action?: { label: string; onPress: () => void } | undefined;
  className?: string | undefined;
};

/** Page 36's banner. An alarm is announced at once; banners never animate after they appear. */
export function Banner({ kind, children, action, className }: BannerProps) {
  const style = kinds[kind];
  const tone = toneClasses[style.tone];

  return (
    <View
      accessibilityRole={kind === "alarm" ? "alert" : "summary"}
      accessibilityLiveRegion={kind === "alarm" ? "assertive" : "polite"}
      className={cn(
        "gap-3 rounded-[10px] px-4 py-3",
        tone.fill,
        kind === "alarm" && "border border-danger",
        className,
      )}
    >
      <View className="flex-row gap-3">
        <Icon name={style.icon} size={20} tone={style.colour} />
        <Text className="flex-1 type-body-s">{children}</Text>
      </View>
      {action ? (
        <Button className="self-start" onPress={action.onPress}>
          {action.label}
        </Button>
      ) : null}
    </View>
  );
}
