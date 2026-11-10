import type { ReactNode } from "react";

import { Illustration, type IllustrationId } from "@ome-labs/brand/native";
import { View } from "react-native";

import { cn } from "../styling/class-names.ts";
import { depth } from "../styling/depth.ts";
import { Text } from "../styling/text.tsx";

export type EmptyStateProps = {
  illustration?: IllustrationId | undefined;
  title: string;
  body?: string | undefined;
  action?: ReactNode;
  className?: string | undefined;
};

/** Page 39's empty state: a small scene, what's missing, and the one thing to do about it. */
export function EmptyState({ illustration, title, body, action, className }: EmptyStateProps) {
  return (
    <View className={cn("items-center gap-3 px-6 py-7", className)}>
      {/* The title says what the scene shows, so the image is decorative here. It sits on a card, like a print. */}
      {illustration ? (
        <View className={cn("rounded-md", depth.card)}>
          <Illustration id={illustration} alt="" className="w-48 rounded-md" />
        </View>
      ) : null}
      <Text className="text-center type-heading-s">{title}</Text>
      {body ? (
        <Text className="max-w-[320px] text-center type-body-s text-fg-muted">{body}</Text>
      ) : null}
      {action}
    </View>
  );
}
