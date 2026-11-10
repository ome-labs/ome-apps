import { useEffect, type ReactNode } from "react";

import { tokens } from "@ome-labs/tokens";
import { Close, Content, Description, Overlay, Portal, Root, Title } from "@rn-primitives/dialog";
import { View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { IconButton } from "../actions/icon-button.tsx";
import { cn } from "../styling/class-names.ts";
import { depth } from "../styling/depth.ts";
import { Text } from "../styling/text.tsx";

const easeOut = Easing.bezier(...tokens.motion.easing.emphasized);

export type DialogProps = {
  title: string;
  description?: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Buttons, stacked full width at the bottom. */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string | undefined;
};

/**
 * Page 37's dialog, for one decision, on the highest elevation. Needs a `PortalHost` at the app root
 * (`@rn-primitives/portal`). Long tasks belong in a `Sheet` instead.
 */
export function Dialog({ open, onOpenChange, ...layer }: DialogProps) {
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogLayer {...layer} />
      </Portal>
    </Root>
  );
}

/**
 * The scrim and the card, mounted by the portal only while open. On mount the scrim fades in and the card rises out
 * of a slight shrink, centred because a dialog belongs to the screen rather than to the button that opened it. Shared
 * values rather than a layout animation keep it on the UI thread and testable; closing is instant, as the portal
 * unmounts. Reduce Motion jumps straight to the end.
 */
function DialogLayer({
  title,
  description,
  actions,
  children,
  className,
}: Omit<DialogProps, "open" | "onOpenChange">) {
  const shown = useSharedValue(0);

  useEffect(() => {
    shown.set(
      withTiming(1, {
        duration: tokens.motion.duration.base,
        easing: easeOut,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [shown]);

  const scrim = useAnimatedStyle(() => ({ opacity: shown.get() }));
  const card = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [{ scale: interpolate(shown.get(), [0, 1], [0.96, 1]) }],
  }));

  return (
    <Animated.View style={scrim} className="absolute inset-0">
      <Overlay className="flex-1 items-center justify-center bg-brand-night/45 p-4">
        <Animated.View style={card} className="w-full max-w-[480px]">
          <Content className={cn("gap-4 rounded-xl bg-raised p-5", depth.dialog, className)}>
            <View className="flex-row items-start justify-between gap-3">
              <Title asChild>
                <Text className="flex-1 pt-2.5 type-heading-m">{title}</Text>
              </Title>
              <Close asChild>
                <IconButton icon="x" label="Close" />
              </Close>
            </View>
            {description ? (
              <Description asChild>
                <Text className="type-body-s text-fg-muted">{description}</Text>
              </Description>
            ) : null}
            {children}
            {actions ? <View className="gap-2">{actions}</View> : null}
          </Content>
        </Animated.View>
      </Overlay>
    </Animated.View>
  );
}
