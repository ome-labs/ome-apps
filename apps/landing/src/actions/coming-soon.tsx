import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";

/** Where an install or download will go once Ome is out: a quiet amber label, not a button. */
export function ComingSoon({ className }: { className?: string | undefined }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2.5 self-start rounded-full bg-amber/14 py-2 pr-4 pl-2.5 text-[15px] font-medium text-amber",
        className,
      )}
    >
      <Icon name="clock" size={16} />
      Coming soon to Aztec testnet
    </p>
  );
}
