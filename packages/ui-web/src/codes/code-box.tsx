import { cn } from "../styling/class-names.ts";
import { CopyButton } from "../values/copy-button.tsx";

export type CodeBoxProps = {
  label: string;
  /** An invite, a join request or a pairing code. Shown truncated; copied whole. */
  value: string;
  hint?: string | undefined;
  className?: string | undefined;
};

/** Page 35's code box: a sunken mono line with a copy button, for codes members send each other. */
export function CodeBox({ label, value, hint, className }: CodeBoxProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="type-label-m text-fg">{label}</span>
      <div className="flex items-center gap-2.5 rounded-md border border-line-subtle bg-sunken py-1.5 pr-1.5 pl-3">
        <code title={value} className="min-w-0 flex-1 truncate type-mono-s text-fg">
          {value}
        </code>
        <CopyButton
          value={value}
          label={`Copy ${label.toLowerCase()}`}
          size="md"
          className="size-control-sm border border-line bg-surface"
        />
      </div>
      {hint ? <span className="type-caption text-fg-subtle">{hint}</span> : null}
    </div>
  );
}
