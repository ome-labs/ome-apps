import { cn } from "@ome-labs/ui-web";

type SeatsProps = {
  /** Stones for approvals to spend, lanterns for keepers to read. */
  kind: "spend" | "read";
  lit: number;
  of: number;
  className?: string | undefined;
};

/** A row of seats with some of them taken: stones for approvals, lanterns for keepers that answer. */
export function Seats({ kind, lit, of, className }: SeatsProps) {
  const label =
    kind === "spend" ? `${lit} approvals of ${of} members` : `${lit} keepers of ${of} members`;

  return (
    <div className={cn("flex items-end gap-3.5", className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: of }, (_, index) => ({ seat: index + 1, on: index < lit })).map(
        ({ seat, on }) =>
          kind === "spend" ? (
            <span
              key={seat}
              aria-hidden
              className={cn(
                "h-[22px] w-[30px] rounded-[50%]",
                on ? "bg-white shadow-[0_4px_10px_rgb(5_8_20/0.25)]" : "bg-white/18",
              )}
            />
          ) : (
            <span
              key={seat}
              aria-hidden
              className="relative flex h-[76px] w-[26px] flex-col items-center"
            >
              {on ? (
                <span className="lantern-glow absolute -top-3.5 left-1/2 size-[46px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(245_201_138/0.75),rgb(245_201_138/0))]" />
              ) : null}
              <span
                className={cn(
                  "relative mt-0.5 h-3.5 w-3 rounded-[3px]",
                  on ? "bg-amber" : "bg-[#3a4366]",
                )}
              />
              <span className="relative h-[54px] w-1 bg-deep/80" />
            </span>
          ),
      )}
    </div>
  );
}
