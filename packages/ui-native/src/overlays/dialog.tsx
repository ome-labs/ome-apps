import type { ReactNode } from "react";

import { Close, Content, Description, Overlay, Portal, Root, Title } from "@rn-primitives/dialog";
import { View } from "react-native";

import { IconButton } from "../actions/icon-button.tsx";
import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";

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
 * Page 37's dialog, for one decision. Needs a `PortalHost` at the app root (`@rn-primitives/portal`).
 * Long tasks belong in a `Sheet` instead.
 */
export function Dialog({
  title,
  description,
  open,
  onOpenChange,
  actions,
  children,
  className,
}: DialogProps) {
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Portal>
        <Overlay className="absolute inset-0 items-center justify-center bg-brand-night/45 p-4">
          <Content
            className={cn(
              "w-full max-w-[480px] gap-4 rounded-xl border border-line bg-raised p-5 shadow-4",
              className,
            )}
          >
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
        </Overlay>
      </Portal>
    </Root>
  );
}
