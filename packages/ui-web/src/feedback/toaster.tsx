import { useMemo } from "react";

import { Icon } from "@ome-labs/icons/web";
import { Toaster as SonnerToaster, type ToasterProps as SonnerProps } from "sonner";

import { useTheme } from "../styling/theme.tsx";

/**
 * Page 36's toasts, through Sonner: raised, outlined, bottom right, one quiet action at most.
 * Mount one `Toaster` per window, inside the `ThemeProvider`.
 */
export function Toaster(props: Omit<SonnerProps, "theme" | "toastOptions" | "icons">) {
  const { resolved } = useTheme();

  const toastOptions = useMemo<NonNullable<SonnerProps["toastOptions"]>>(
    () => ({
      unstyled: true,
      classNames: {
        toast:
          "flex w-[380px] items-center gap-2.5 rounded-lg bg-raised px-3.5 py-3 shadow-3 type-body-s text-fg",
        title: "flex-1",
        description: "type-caption text-fg-subtle",
        actionButton: "focus-ring rounded-xs type-label-s text-accent-fg hover:underline",
        cancelButton: "focus-ring rounded-xs type-label-s text-fg-muted",
      },
    }),
    [],
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
      theme={resolved}
      position="bottom-right"
      toastOptions={toastOptions}
      icons={icons}
      {...props}
    />
  );
}

/**
 * Daemon failures (`unauthorized`, `failed`, …) are toasts with the message and "Show logs", per the guide.
 * Everything else goes through Sonner's `toast` as usual.
 */
export { toast } from "sonner";
