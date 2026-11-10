import type { ComponentProps } from "react";

import { cn } from "../styling/class-names.ts";

// Page 38: a raised surface with a sunken header band of overlines and hairline rows. Plain table elements,
// so screen readers announce rows and columns.

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    // A container, so a table can drop its less important columns when it has little room.
    <div className="@container overflow-x-auto rounded-lg bg-surface shadow-1">
      <table className={cn("w-full border-collapse text-left", className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("border-b border-line-subtle bg-sunken/60", className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-line-subtle", className)} {...props} />;
}

/** A row. With `interactive`, the whole row highlights and its first link stretches over it. */
export function TableRow({
  interactive,
  className,
  ...props
}: ComponentProps<"tr"> & { interactive?: boolean }) {
  return (
    <tr
      className={cn(
        interactive &&
          "relative transition-colors duration-fast ease-standard hover:bg-hover has-[a:focus-visible]:bg-hover",
        className,
      )}
      {...props}
    />
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn("px-4 py-2.5 type-overline font-normal text-fg-subtle", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
}

/** The link that makes a whole row clickable, without nesting interactive elements inside one another. */
export function RowLink({ className, ...props }: ComponentProps<"a">) {
  return (
    // oxlint-disable-next-line jsx-a11y/anchor-has-content -- the caller passes the row's text as children.
    <a
      className={cn(
        "focus-ring rounded-xs after:absolute after:inset-0 after:content-['']",
        className,
      )}
      {...props}
    />
  );
}
