import { type FormEvent, useCallback, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { InvitePreview } from "@ome-labs/api";
import { Scene } from "@ome-labs/brand/web";
import { Banner, Button, MemberAvatar, Tag, TextField } from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";
import { FlowPage } from "./flow-page.tsx";
import { networkName } from "./thresholds.ts";

const message = (failure: unknown) =>
  failure instanceof Error ? failure.message : String(failure);

/** Stage 1 for a co-founder: paste the host's invite, see what it is, and join its lobby. */
export function JoinForm() {
  const navigate = useNavigate();
  const [invite, setInvite] = useState("");
  const [preview, setPreview] = useState<InvitePreview>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState<"inspect" | "join">();

  const inspect = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const code = invite.trim();
      if (code === "") {
        setError("Paste the invite you were sent.");
        return;
      }
      setPending("inspect");
      setError(undefined);
      try {
        setPreview(await callOme("lobby.inspect", { invite: code }));
      } catch (failure) {
        setPreview(undefined);
        setError(message(failure));
      } finally {
        setPending(undefined);
      }
    },
    [invite],
  );

  const join = useCallback(async () => {
    setPending("join");
    setError(undefined);
    try {
      const lobby = await callOme("lobby.join", { invite: invite.trim() });
      // Founding waits for the host to start; beginning now means this member is ready the moment they do.
      await callOme("founding.begin", { lobby: lobby.lobby });
      await navigate({ to: "/join", search: { lobby: lobby.lobby } });
    } catch (failure) {
      setError(message(failure));
      setPending(undefined);
    }
  }, [invite, navigate]);

  const change = useCallback((value: string) => {
    setInvite(value);
    setPreview(undefined);
    setError(undefined);
  }, []);
  const cancel = useCallback(() => void navigate({ to: "/home" }), [navigate]);

  return (
    <FlowPage
      title="Join a vault"
      lead="Paste the invite a co-founder sent you. You'll see the vault before you join."
    >
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex flex-col rounded-lg bg-surface px-6 shadow-1">
          <form
            className="flex items-start gap-2 border-b border-line-subtle py-6"
            onSubmit={inspect}
            noValidate
          >
            <TextField
              label="Invite"
              className="flex-1"
              placeholder="ome-invite:…"
              value={invite}
              onValueChange={change}
              mono
              disabled={pending !== undefined}
            />
            <Button type="submit" className="mt-[26px]" pending={pending === "inspect"}>
              {pending === "inspect" ? "Opening…" : "Open"}
            </Button>
          </form>

          {error ? (
            <div className="pt-5">
              <Banner kind="alarm">{error}</Banner>
            </div>
          ) : null}

          {preview ? (
            <Preview preview={preview} />
          ) : (
            <p className="py-5 type-body-s text-fg-muted">
              The vault's name, host and thresholds show here.
            </p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-line-subtle py-4">
            <Button variant="ghost" onClick={cancel} disabled={pending === "join"}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={join}
              pending={pending === "join"}
              disabled={!preview?.sameNetwork || pending === "inspect"}
            >
              {pending === "join" ? "Joining…" : "Join"}
            </Button>
          </div>
        </section>

        <aside className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-1">
          <Scene
            id={preview && !preview.sameNetwork ? "wrong-network" : "invite"}
            alt=""
            className="aspect-[16/10] w-full rounded-md object-cover"
          />
          <p className="type-body-s text-fg-muted">
            Joining puts you in the host's lobby. When they start, every member's Ome founds the
            vault together.
          </p>
        </aside>
      </div>
    </FlowPage>
  );
}

function Preview({ preview }: { preview: InvitePreview }) {
  return (
    <div className="flex flex-col gap-4 py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="type-heading-s text-fg">{preview.name}</span>
          <span className="flex items-center gap-2 type-body-s text-fg-muted">
            <MemberAvatar name={preview.hostName} index={1} size="sm" />
            Hosted by {preview.hostName}
          </span>
        </div>
        <Tag tone={preview.sameNetwork ? "neutral" : "danger"}>{networkName(preview.network)}</Tag>
      </div>
      <div className="flex flex-col gap-2">
        <span className="type-caption text-fg-subtle">Proposed thresholds</span>
        <span className="type-label-m text-fg">
          {preview.threshold} to approve · {preview.viewingThreshold} to read
        </span>
      </div>
      {preview.sameNetwork ? null : (
        <Banner kind="warning">
          This invite is for {networkName(preview.network)}, and this profile is on another network.
          Open it in a profile on {networkName(preview.network)}.
        </Banner>
      )}
    </div>
  );
}
