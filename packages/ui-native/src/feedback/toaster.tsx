import { useMemo } from "react";

import { Icon } from "@ome-labs/icons/native";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner-native";
import { useResolveClassNames } from "uniwind";

import { cn } from "../styling/class-names.ts";
import { depth } from "../styling/depth.ts";
import { useResolvedTheme } from "../styling/theme.ts";

/**
 * Page 36's toasts through sonner-native: raised above the screen on the toast shadow (its ring is the outline), at
 * the top, one action at most. Mount one inside the app's gesture handler and safe area providers.
 */
export function Toaster(props: Omit<ToasterProps, "theme" | "toastOptions" | "icons">) {
  const theme = useResolvedTheme();
  // sonner-native takes style objects, so the kit's classes are resolved for the current theme.
  const toast = useResolveClassNames(cn("rounded-lg bg-raised px-3.5 py-3", depth.toast));
  const title = useResolveClassNames("type-body-s text-fg");
  const description = useResolveClassNames("type-caption text-fg-subtle");
  const action = useResolveClassNames("type-label-s text-accent-fg");

  const toastOptions = useMemo(
    () => ({
      style: toast,
      titleStyle: title,
      descriptionStyle: description,
      actionButtonTextStyle: action,
    }),
    [toast, title, description, action],
  );

  const icons = useMemo(
    () => ({
      success: <Icon name="check-circle" size={20} tone="success" />,
      error: <Icon name="x-circle" size={20} tone="danger" />,
      info: <Icon name="info" size={20} tone="accent-fg" />,
      warning: <Icon name="alert-triangle" size={20} tone="warning" />,
    }),
    [],
  );

  return (
    <SonnerToaster
      theme={theme}
      position="top-center"
      toastOptions={toastOptions}
      icons={icons}
      {...props}
    />
  );
}

export { toast } from "sonner-native";
