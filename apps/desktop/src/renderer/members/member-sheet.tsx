// One member's technical identity: the keys and keeper the vault knows them by, each copyable, for checking a key
// out of band or debugging how two keepers reach each other.
import type { ReactNode } from "react";

import type { Point } from "@ome-labs/api";
import { connectionOf, timeAgo } from "@ome-labs/format";
import { Address, CopyButton, Hash, MemberAvatar, Sheet, StatusBadge, Tag } from "@ome-labs/ui-web";

import { useNow } from "../shell/now.ts";
import type { MemberRow } from "./live.ts";

export function MemberSheet({
  row,
  onOpenChange,
}: {
  row: MemberRow;
  onOpenChange: (open: boolean) => void;
}) {
  const { member, peer } = row;
  const now = useNow();

  return (
    <Sheet
      title={member.name}
      description={member.you ? "You, on this computer." : `Member ${member.index} of the vault.`}
      open
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <MemberAvatar name={member.name} index={member.index} />
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 type-heading-s text-fg">
              {member.name}
              {member.you ? <Tag tone="accent">You</Tag> : null}
            </span>
            {member.you ? null : peer ? (
              <span className="flex items-center gap-2 type-caption text-fg-subtle">
                <StatusBadge kind="connection" status={connectionOf(peer)} />
                {peer.lastSeen ? `seen ${timeAgo(peer.lastSeen, now)}` : "never seen"}
                {peer.rttMs === null ? null : ` · ${peer.rttMs} ms`}
              </span>
            ) : null}
          </div>
        </div>

        <Section title="On Aztec">
          <Field label="Account" hint="Their own address, separate from the vault's">
            {member.account ? (
              <Address address={member.account} full copy />
            ) : (
              <Muted>None recorded</Muted>
            )}
          </Field>
          <Field label="Signing key" hint="Approves and rejects proposals">
            <PointValue point={member.signerKey} noun="signing key" />
          </Field>
        </Section>

        <Section title="Keeper">
          <Field label="Release">
            <span className="type-mono-s text-fg">{member.release ?? "Unknown"}</span>
          </Field>
          <Field label="Identity">
            <Hash value={member.identity} noun="keeper identity" full />
          </Field>
          <Field label="Transport key">
            <Hash value={member.transport} noun="transport key" full />
          </Field>
          <Field
            label="Share check"
            hint="What the other keepers check this keeper's answers against"
          >
            <PointValue point={member.verificationShare} noun="verification share" />
          </Field>
          <Field label="Peer id">
            <span className="flex items-center gap-1.5">
              <code className="type-mono-s text-fg [overflow-wrap:anywhere]">{member.peerId}</code>
              <CopyButton value={member.peerId} label="Copy peer id" />
            </span>
          </Field>
          <Field label="Addresses">
            {member.addresses.length === 0 ? (
              <Muted>None announced</Muted>
            ) : (
              <ul className="flex flex-col gap-1">
                {member.addresses.map((address) => (
                  <li key={address} className="type-mono-s text-fg-muted [overflow-wrap:anywhere]">
                    {address}
                  </li>
                ))}
              </ul>
            )}
          </Field>
        </Section>
      </div>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="type-overline text-fg-subtle">{title}</h3>
      <dl className="flex flex-col gap-3">{children}</dl>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="flex flex-col">
        <span className="type-label-s text-fg">{label}</span>
        {hint ? <span className="type-caption text-fg-subtle">{hint}</span> : null}
      </dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="type-body-s text-fg-subtle">{children}</span>;
}

/** A curve point as its two coordinates, copied together. */
function PointValue({ point, noun }: { point: Point; noun: string }) {
  const both = `${point.x},${point.y}`;
  return (
    <span className="flex items-start gap-1.5">
      <code className="flex min-w-0 flex-col type-mono-s text-fg-muted">
        <span className="[overflow-wrap:anywhere]">x {point.x}</span>
        <span className="[overflow-wrap:anywhere]">y {point.y}</span>
      </code>
      <CopyButton value={both} label={`Copy ${noun}`} />
    </span>
  );
}
