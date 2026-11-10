import type { ReactElement, ReactNode } from "react";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";

import { IconButton } from "../actions/icon-button.tsx";
import { cn } from "../styling/class-names.ts";
import { overlayBackdrop } from "./dialog.tsx";

export type SheetProps = {
  title: string;
  description?: ReactNode | undefined;
  trigger?: ReactElement | undefined;
  open?: boolean | undefined;
  onOpenChange?: (open: boolean) => void | undefined;
  footer?: ReactNode | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
};

/** Page 37's sheet, for one task (add a token, the Internals drawer): a panel from the right edge. */
export function Sheet({
  title,
  description,
  trigger,
  open,
  onOpenChange,
  footer,
  children,
  className,
}: SheetProps) {
  return (
    <BaseDialog.Root {...(open === undefined ? {} : { open })} onOpenChange={onOpenChange}>
      {trigger ? <BaseDialog.Trigger render={trigger} /> : null}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={overlayBackdrop} />
        <BaseDialog.Popup
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-[min(440px,100vw)] flex-col border-l border-line bg-raised shadow-4 outline-none",
            "transition-transform duration-slow ease-emphasized data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line-subtle px-6 py-5">
            <div className="flex flex-col gap-1">
              <BaseDialog.Title className="type-heading-m text-fg">{title}</BaseDialog.Title>
              {description ? (
                <BaseDialog.Description className="type-body-s text-fg-muted">
                  {description}
                </BaseDialog.Description>
              ) : null}
            </div>
            <BaseDialog.Close render={<IconButton icon="x" label="Close" size="sm" />} />
          </div>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">{children}</div>
          {footer ? (
            <div className="flex justify-end gap-2 border-t border-line-subtle px-6 py-4">
              {footer}
            </div>
          ) : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
