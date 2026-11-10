import { useCallback, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { FoundingState, FoundingStep, FoundingStepId, LobbyView } from "@ome-labs/api";
import { Illustration } from "@ome-labs/brand/web";
import { Address, Banner, Button, StatusBadge, StepList, StepRow } from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";
import { useNow } from "../shell/now.ts";
import { FlowPage } from "./stages.tsx";

const LABELS: Record<FoundingStepId, string> = {
  agree: "Agree on the plan",
  dkg: "Generate the shared key",
  derive: "Derive the vault",
  register: "Register with your keeper",
  deploy: "Deploy the vault",
  verify: "Verify on chain",
};

/** What a step is doing, in this member's terms; the daemon's own detail once the step finishes. */
function detail(step: FoundingStep, lobby: LobbyView, hostName: string): string | undefined {
  const host = lobby.role === "host";
  if (step.status === "pending") {
    if (step.id === "deploy") return host ? "You deploy it" : `${hostName} deploys it`;
    return undefined;
  }
  if (step.status === "active") {
    switch (step.id) {
      case "agree":
        return host ? "Sharing the plan" : `Waiting for ${hostName} to start`;
      case "dkg":
        return `Every keeper takes part · ${lobby.members.length} keepers`;
      case "deploy":
        return host ? "Sending the deployment" : `Waiting for ${hostName} to deploy`;
      case "verify":
        return "Checking the vault's settings on chain";
      default:
        return undefined;
    }
  }
  if (step.status === "done" && step.detail) {
    if (step.id === "derive" || step.id === "deploy") {
      return `${step.detail.slice(0, 10)}…${step.detail.slice(-6)}`;
    }
    return step.detail;
  }
  return undefined;
}

function elapsed(step: FoundingStep, now: number): string | undefined {
  if (step.startedAt === null) return undefined;
  const seconds = Math.max(0, (step.finishedAt ?? now) - step.startedAt);
  return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}

/** Stage 3: the founding running in every member's Ome at once, step by step; then the vault, or what failed. */
export function FoundingPanel({
  lobby,
  founding,
}: {
  lobby: LobbyView;
  founding: FoundingState | null;
}) {
  const now = useNow();
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);
  const hostName = lobby.members.find((member) => member.index === 1)?.name ?? "the host";

  const failed = founding?.error ?? null;
  const done = founding?.done === true && !failed;
  const blamed = failed?.blamed
    .map((identity) => lobby.members.find((member) => member.identity === identity)?.name)
    .filter(Boolean);

  const retry = useCallback(async () => {
    setRetrying(true);
    await callOme("founding.begin", { lobby: lobby.lobby }).catch(() => undefined);
    setRetrying(false);
  }, [lobby.lobby]);
  const vault = founding?.vault;
  const open = useCallback(() => {
    if (vault) void navigate({ to: "/vaults/$vault", params: { vault } });
  }, [vault, navigate]);
  const home = useCallback(() => void navigate({ to: "/home" }), [navigate]);

  return (
    <FlowPage
      stage={done ? "done" : "founding"}
      joining={lobby.role === "guest"}
      title={done ? `${lobby.name} is ready` : `Founding ${lobby.name}`}
      lead={
        done
          ? "Every member's keeper verified the vault on chain."
          : `All ${lobby.members.length} of you run these steps together. Keep Ome open until it finishes.`
      }
    >
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex flex-col rounded-lg bg-surface shadow-1">
          <header className="flex items-center justify-between border-b border-line-subtle px-6 py-4">
            <h2 className="type-heading-s text-fg">Steps</h2>
            <StatusBadge kind="step" status={failed ? "failed" : done ? "done" : "active"} />
          </header>
          <StepList label={`Founding ${lobby.name}`} className="px-6 py-2">
            {(founding?.steps ?? []).map((step) => (
              <StepRow
                key={step.id}
                status={step.status}
                label={LABELS[step.id]}
                detail={step.status === "failed" ? failed?.message : detail(step, lobby, hostName)}
                time={elapsed(step, now)}
              />
            ))}
          </StepList>
        </section>

        <aside className="flex flex-col gap-5 rounded-lg bg-surface p-5 shadow-1">
          <Illustration
            id={failed ? "blocked" : done ? "vault-founded" : "key-generation"}
            alt=""
            className="aspect-[16/10] w-full rounded-md object-cover"
          />
          {failed ? (
            <>
              <Banner kind="alarm">
                {LABELS[failed.step]} failed
                {blamed && blamed.length > 0 ? ` (${blamed.join(", ")})` : ""}. {failed.message}
              </Banner>
              <div className="flex gap-2">
                <Button variant="primary" icon="refresh" onClick={retry} pending={retrying}>
                  Try again
                </Button>
                <Button variant="ghost" onClick={home}>
                  Back to Home
                </Button>
              </div>
            </>
          ) : done && founding?.vault ? (
            <>
              <div className="flex flex-col gap-1.5">
                <span className="type-caption text-fg-subtle">Vault address</span>
                <Address address={founding.vault} copy />
              </div>
              <Button variant="primary" icon="arrow-right" onClick={open}>
                Open {lobby.name}
              </Button>
            </>
          ) : (
            <p className="type-body-s text-fg-muted">
              The members' keepers generate the vault's shared key together, then{" "}
              {lobby.role === "host" ? "you deploy" : `${hostName} deploys`} it. It takes a minute
              or two.
            </p>
          )}
        </aside>
      </div>
    </FlowPage>
  );
}
