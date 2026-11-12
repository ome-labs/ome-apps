import { installCommand } from "../site/links.ts";

type Step = { command: string; output: readonly (readonly [what: string, note: string])[] };

const session: readonly Step[] = [
  { command: installCommand, output: [["installed", "ome, omed and ome-keeper"]] },
  { command: "ome init", output: [["profile alice", "signing key sealed on this device"]] },
  {
    command: "ome doctor",
    output: [
      ["daemon", "running"],
      ["keeper", "running"],
      ["relay", "reachable"],
    ],
  },
  { command: "ome vault health", output: [["Treasury", "every keeper answering"]] },
];

const dots = ["#F07167", "#E8B04B", "#4CC38A"];

/** A terminal window running the CLI's first steps. Text, so it reads and copies like a terminal. */
export function Terminal() {
  return (
    <figure
      className="glass w-full overflow-hidden rounded-[20px] bg-ink/86 md:rounded-2xl"
      aria-label="The Ome command line"
    >
      <div className="flex h-11 items-center gap-2 border-b border-white/8 px-[18px]">
        {dots.map((colour) => (
          <span
            key={colour}
            aria-hidden
            className="size-[11px] rounded-full"
            style={{ backgroundColor: colour }}
          />
        ))}
        <span className="ml-2 font-mono text-xs text-white/60">ome — zsh</span>
      </div>
      <pre className="flex flex-col gap-2 overflow-x-auto px-4 pt-4 pb-5 font-mono text-[11px] leading-[1.75] md:px-7 md:pt-6 md:pb-7 md:text-sm">
        {session.map((step) => (
          <span key={step.command} className="block">
            <span className="block">
              <span className="text-brand-haze">$ </span>
              {step.command}
            </span>
            {step.output.map(([what, note]) => (
              <span key={what} className="block">
                <span className="text-ok">✓ </span>
                <span className="text-white/92">{what}</span>
                <span className="text-white/60">{`  ${note}`}</span>
              </span>
            ))}
          </span>
        ))}
      </pre>
    </figure>
  );
}
