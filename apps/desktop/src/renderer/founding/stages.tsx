import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";

export type Stage = "details" | "lobby" | "founding" | "done";

const STAGES: { id: Exclude<Stage, "done">; label: string }[] = [
  { id: "details", label: "Name and thresholds" },
  { id: "lobby", label: "Gather co-founders" },
  { id: "founding", label: "Found the vault" },
];

/** Where the member is in creating or joining a vault: three numbered stages joined by a line. */
export function Stages({ current, joining }: { current: Stage; joining?: boolean | undefined }) {
  const at = current === "done" ? STAGES.length : STAGES.findIndex((stage) => stage.id === current);
  const stages = joining
    ? [{ id: "details", label: "Open the invite" }, ...STAGES.slice(1)]
    : STAGES;

  return (
    <ol className="flex items-center gap-3" aria-label="Steps">
      {stages.map((stage, index) => {
        const done = index < at;
        const active = index === at;
        return (
          <li
            key={stage.id}
            className="flex items-center gap-3"
            aria-current={active ? "step" : undefined}
          >
            {index > 0 ? (
              <span
                aria-hidden
                className={cn("h-px w-10", done || active ? "bg-accent" : "bg-line")}
              />
            ) : null}
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full type-label-s tabular-nums",
                done && "bg-accent text-on-accent",
                active && "bg-accent-subtle text-accent-fg inset-ring inset-ring-accent",
                !done && !active && "bg-sunken text-fg-subtle",
              )}
            >
              {done ? <Icon name="check" size={16} className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                "type-label-m",
                active ? "text-fg" : done ? "text-fg-muted" : "text-fg-subtle",
              )}
            >
              {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** A page of the flow: its stage strip, title and lead, then the stage itself. */
export function FlowPage({
  stage,
  joining,
  title,
  lead,
  children,
}: {
  stage: Stage;
  joining?: boolean;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-7">
      <Stages current={stage} joining={joining} />
      <header className="flex flex-col gap-1.5">
        <h1 className="type-heading-xl text-fg">{title}</h1>
        <p className="type-body-m text-fg-muted">{lead}</p>
      </header>
      {/* The stage's columns follow the page's width, not the window's: the sidebar takes part of it. */}
      <div className="@container">{children}</div>
    </div>
  );
}
