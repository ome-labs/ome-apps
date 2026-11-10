import { Avatar, type AvatarSource, cn } from "@ome-labs/ui-web";

/** A picture that opens its picker: the picture is the control, so it needs no "Change" button beside it. */
export function AvatarButton({
  name,
  source,
  shape = "circle",
  size,
  label,
  disabled,
  onClick,
}: {
  name: string;
  source: AvatarSource | undefined;
  shape?: "circle" | "square";
  size: number;
  label: string;
  disabled?: boolean | undefined;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "focus-ring flex shrink-0 transition-opacity duration-fast ease-standard hover:opacity-80 disabled:opacity-60",
        shape === "circle" ? "rounded-full" : "rounded-md",
      )}
    >
      <Avatar name={name} source={source} shape={shape} size={size} />
    </button>
  );
}
