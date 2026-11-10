import type { ReactElement, ReactNode, RefObject } from "react";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";

import { IconButton } from "../actions/icon-button.tsx";
import { cn } from "../styling/class-names.ts";

export type DialogProps = {
  title: string;
  description?: ReactNode | undefined;
  /** The element that opens it, if it isn't controlled. */
  trigger?: ReactElement | undefined;
  open?: boolean | undefined;
  onOpenChange?: (open: boolean) => void | undefined;
  /** Buttons, right-aligned at the bottom. */
  actions?: ReactNode | undefined;
  wide?: boolean | undefined;
  /** What takes focus on open. By default the first focusable element, which is the close button. */
  initialFocus?: RefObject<HTMLElement | null> | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
};

export const overlayBackdrop = cn(
  "fixed inset-0 z-40 bg-brand-night/45 transition-opacity duration-slow ease-emphasized",
  "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
);

/**
 * Page 37's dialog, for one decision. Focus moves in and is trapped; Escape and the close button dismiss it
 * and return focus to what opened it.
 */
export function Dialog({
  title,
  description,
  trigger,
  open,
  onOpenChange,
  actions,
  wide,
  initialFocus,
  children,
  className,
}: DialogProps) {
  return (
    <BaseDialog.Root {...(open === undefined ? {} : { open })} onOpenChange={onOpenChange}>
      {trigger ? <BaseDialog.Trigger render={trigger} /> : null}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={overlayBackdrop} />
        <BaseDialog.Popup
          {...(initialFocus ? { initialFocus } : {})}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-4rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-[18px] overflow-y-auto",
            "rounded-xl bg-raised p-6 shadow-4 outline-none",
            "transition-[opacity,scale] duration-slow ease-emphasized data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0",
            wide ? "max-w-[640px]" : "max-w-[480px]",
            className,
          )}
        >
          {/* The title and what it's about read as one heading, apart from the content below. */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <BaseDialog.Title className="type-heading-m text-fg">{title}</BaseDialog.Title>
              {description ? (
                <BaseDialog.Description className="type-body-s text-fg-muted">
                  {description}
                </BaseDialog.Description>
              ) : null}
            </div>
            <BaseDialog.Close render={<IconButton icon="x" label="Close" size="sm" />} />
          </div>
          {children}
          {actions ? <div className="flex justify-end gap-2">{actions}</div> : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/** A button that closes the dialog it is in, such as Cancel. */
export const DialogClose = BaseDialog.Close;
