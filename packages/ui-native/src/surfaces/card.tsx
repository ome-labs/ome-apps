import type { ReactNode } from "react";

import { View, type ViewProps } from "react-native";

import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";

/** Page 39's card: the surface every group of content sits on. */
export function Card({
  className,
  ...props
}: Omit<ViewProps, "className"> & { className?: string | undefined }) {
  return (
    <View
      className={cn("gap-4 rounded-lg border border-line-subtle bg-surface p-4", className)}
      {...props}
    />
  );
}

export type CardHeaderProps = {
  title: string;
  subtitle?: string | undefined;
  action?: ReactNode;
};

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1 gap-0.5">
        <Text accessibilityRole="header" className="type-heading-s">
          {title}
        </Text>
        {subtitle ? <Text className="type-caption text-fg-subtle">{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

/** A label and value row with a hairline under it. */
export function DetailRow({
  label,
  children,
  last,
}: {
  label: string;
  children: ReactNode;
  last?: boolean | undefined;
}) {
  return (
    <View
      className={cn(
        "min-h-11 flex-row items-center justify-between gap-4 py-2",
        !last && "border-b border-line-subtle",
      )}
    >
      <Text className="type-body-s text-fg-muted">{label}</Text>
      <View className="shrink items-end">
        {typeof children === "string" ? <Text className="type-body-s">{children}</Text> : children}
      </View>
    </View>
  );
}
