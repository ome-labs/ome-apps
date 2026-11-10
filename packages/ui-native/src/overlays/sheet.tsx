import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { tokens } from "@ome-labs/tokens";
import { View } from "react-native";
import { ReduceMotion, useReducedMotion } from "react-native-reanimated";
import { useResolveClassNames } from "uniwind";

import { Text } from "../styling/text.tsx";

export type SheetProps = {
  title: string;
  description?: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

/**
 * The phone's sheet (review, unlock, add token), from the bottom and sized to its content. Needs
 * `BottomSheetModalProvider` at the app root. Swipe down or tap the backdrop to dismiss.
 */
export function Sheet({ title, description, open, onOpenChange, children }: SheetProps) {
  const ref = useRef<BottomSheetModal>(null);
  const reduceMotion = useReducedMotion();
  const background = useResolveClassNames("bg-raised rounded-t-2xl");
  const handle = useResolveClassNames("bg-line-strong");

  useEffect(() => {
    if (open) ref.current?.present();
    else ref.current?.dismiss();
  }, [open]);

  const animation = useMemo(
    () => ({
      duration: tokens.motion.duration.slow,
      reduceMotion: reduceMotion ? ReduceMotion.Always : ReduceMotion.System,
    }),
    [reduceMotion],
  );

  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.45} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={() => onOpenChange(false)}
      backdropComponent={backdrop}
      backgroundStyle={background}
      handleIndicatorStyle={handle}
      accessibilityLabel={title}
      animationConfigs={animation}
    >
      <BottomSheetView>
        <View className="gap-4 px-5 pt-1 pb-8">
          <View className="gap-1">
            <Text accessibilityRole="header" className="type-heading-m">
              {title}
            </Text>
            {description ? <Text className="type-body-s text-fg-muted">{description}</Text> : null}
          </View>
          {children}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
