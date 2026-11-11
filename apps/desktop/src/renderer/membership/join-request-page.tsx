import { useCallback, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { RotationState } from "@ome-labs/api";
import { Scene } from "@ome-labs/brand/web";
import { Banner, Button, CodeBox, QrCode, TextField } from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";
import { Page } from "../shell/page.tsx";
import { RotationProgress } from "./rotation-progress.tsx";

/**
 * `/join-request`: joining a vault that already exists. The newcomer's keeper signs a join request; a member adds it to
 * a membership change and sends back the plan; pasting it here starts this member's side of the change. No vote is
 * needed from the newcomer: the members approve it.
 */
export function JoinRequestPage() {
  const navigate = useNavigate();
  const [request, setRequest] = useState<string>();
  const [pending, setPending] = useState<"request" | "plan">();
  const [error, setError] = useState<string>();
  const [plan, setPlan] = useState("");
  const [rotation, setRotation] = useState<RotationState>();

  const make = useCallback(async () => {
    setPending("request");
    setError(undefined);
    try {
      setRequest((await callOme("membership.request", {})).request);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(undefined);
    }
  }, []);
  const begin = useCallback(async () => {
    setPending("plan");
    setError(undefined);
    try {
      setRotation(await callOme("membership.begin", { plan: plan.trim() }));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(undefined);
    }
  }, [plan]);
  const open = useCallback(() => {
    if (rotation) void navigate({ to: "/vaults/$vault", params: { vault: rotation.plan.vault } });
  }, [navigate, rotation]);
  const valid = plan.trim().startsWith("ome-rotation-v0:");
  const submit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (valid) void begin();
    },
    [begin, valid],
  );

  return (
    <Page
      title="Join an existing vault"
      lead="A vault already running takes new members through a membership change. Send a member your join request; they send back a plan."
    >
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          {error ? <Banner kind="alarm">{error}</Banner> : null}
          {rotation ? (
            <RotationProgress
              vault={rotation.plan.vault}
              rotation={rotation}
              joining
              onDone={open}
            />
          ) : (
            <>
              <Step
                number={1}
                title="Send your join request"
                text="It names you, your Aztec account and your keeper, signed by the keeper. It holds no secrets."
              >
                {request ? (
                  <div className="flex flex-col items-start gap-5 @2xl:flex-row">
                    <QrCode value={request} label="Join request, to scan" size={152} />
                    <CodeBox label="Join request" value={request} className="min-w-0 flex-1" />
                  </div>
                ) : (
                  <div>
                    <Button
                      variant="primary"
                      icon="user-plus"
                      onClick={make}
                      pending={pending === "request"}
                    >
                      Make my join request
                    </Button>
                  </div>
                )}
              </Step>
              <Step
                number={2}
                title="Paste the plan they send back"
                text="Once a member adds your request to a membership change, they send you its plan. Your keeper then takes part."
              >
                <form className="flex items-start gap-2" onSubmit={submit}>
                  <TextField
                    label="Plan"
                    className="flex-1"
                    mono
                    placeholder="ome-rotation-v0:…"
                    value={plan}
                    onValueChange={setPlan}
                    error={
                      plan.trim() && !valid ? "A plan starts with ome-rotation-v0:" : undefined
                    }
                    disabled={pending === "plan"}
                  />
                  <Button
                    type="submit"
                    className="mt-[26px]"
                    pending={pending === "plan"}
                    disabled={!valid}
                  >
                    Join
                  </Button>
                </form>
              </Step>
            </>
          )}
        </div>
        <aside className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-1">
          <Scene
            id="join-request"
            alt=""
            className="aspect-[16/10] w-full rounded-md object-cover"
          />
          <p className="type-body-s text-fg-muted">
            The members' keepers share the vault's viewing key anew with you in it, so you can read
            what arrives from then on. The members approve the change; you don't need to.
          </p>
        </aside>
      </div>
    </Page>
  );
}

function Step({
  number,
  title,
  text,
  children,
}: {
  number: number;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-surface p-6 shadow-1">
      <header className="flex items-start gap-3">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sunken type-label-s text-fg-muted">
          {number}
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="type-heading-s text-fg">{title}</h2>
          <p className="type-body-s text-fg-muted">{text}</p>
        </div>
      </header>
      {children}
    </section>
  );
}
