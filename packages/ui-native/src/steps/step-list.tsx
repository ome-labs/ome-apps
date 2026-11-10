import { Children, Fragment, type ReactNode } from "react";

import { View } from "react-native";

import { cn } from "../styling/class-names.ts";

export type StepListProps = {
  /** Names the process: "Founding", "Execution". */
  label: string;
  children: ReactNode;
  className?: string | undefined;
};

/** Page 33's step list: `StepRow`s in order with hairlines between. */
export function StepList({ label, children, className }: StepListProps) {
  const rows = Children.toArray(children);

  return (
    <View accessibilityRole="list" accessibilityLabel={label} className={cn(className)}>
      {rows.map((row, position) => (
        <Fragment key={(row as { key?: string }).key ?? `step-${String(position)}`}>
          {position > 0 ? <View className="h-px bg-line-subtle" /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}
