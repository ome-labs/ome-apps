// Everything `vault.details` knows about the vault, for a technical member checking it independently or debugging
// with the core tools: the contract, the config note on chain, the committee and the founding. Folded until opened.
import type { ReactNode } from "react";

import type { Point, VaultDetails } from "@ome-labs/api";
import { formatAbsoluteTime, formatCount } from "@ome-labs/format";
import { Icon } from "@ome-labs/icons/web";
import { CopyButton, Tag } from "@ome-labs/ui-web";

export function Internals({ details }: { details: VaultDetails }) {
  const { contract, config, committee, founding } = details;

  return (
    <details className="group flex flex-col rounded-lg bg-surface shadow-1">
      <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 py-4 transition-colors duration-fast ease-standard hover:bg-hover [&::-webkit-details-marker]:hidden">
        <span className="flex flex-col gap-0.5">
          <span className="type-heading-s text-fg">Internals</span>
          <span className="type-body-s text-fg-muted">
            The vault's contract, its config on chain, the committee and the founding. Every value
            copies.
          </span>
        </span>
        <Icon
          name="chevron-down"
          size={20}
          className="shrink-0 text-fg-subtle transition-transform duration-fast ease-standard group-open:rotate-180"
        />
      </summary>
      <div className="flex flex-col gap-6 border-t border-line-subtle px-5 py-5">
        <Group title="Contract">
          <Value label="Address" value={contract.address} />
          <Value label="Preaddress" value={contract.preaddress} />
          <Value label="Partial address" value={contract.partialAddress} />
          <Value label="Class id" value={contract.classId} />
          <Value label="Salt" value={contract.salt} />
          <Value label="Deployer" value={contract.deployer} />
          <Value label="Initialization hash" value={contract.initializationHash} />
          {contract.publicKeys.map((key) => (
            <PointValue key={key.name} label={`Public key ${key.name}`} point={key.key} />
          ))}
        </Group>

        <Group
          title="Config on chain"
          aside={
            config ? (
              <Tag tone={config.matchesCommittee ? "success" : "danger"}>
                {config.matchesCommittee ? "matches the committee" : "names another committee"}
              </Tag>
            ) : null
          }
        >
          {config ? (
            <>
              <Plain label="Version" value={String(config.version)} />
              <Plain
                label="Thresholds"
                value={`${config.threshold} of ${config.signerCount} to spend, ${config.viewingThreshold} to read`}
              />
              <Value label="Signer set commitment" value={config.signerSetCommitment} />
              <Value label="Committee commitment" value={config.committeeCommitment} />
              <Plain label="Read" value={formatAbsoluteTime(config.readAt)} />
            </>
          ) : (
            <Plain label="Config" value="Not read yet" />
          )}
        </Group>

        <Group title="Committee">
          <Plain label="Epoch" value={String(committee.epoch)} />
          <Plain label="Protocol version" value={`v${committee.protocolVersion}`} />
          <Plain label="Keeper" value={committee.keeperStatus} />
          <PointValue label="Group key" point={committee.groupKey} />
          {committee.members.map((member) => (
            <div
              key={member.identity}
              className="flex flex-col gap-2 rounded-md bg-sunken px-3 py-3 shadow-field"
            >
              <span className="type-label-m text-fg">
                {member.index}. {member.name}
                {member.you ? (
                  <span className="ml-1.5 type-caption text-fg-subtle">you</span>
                ) : null}
              </span>
              <PointValue label="Signing key" point={member.signerKey} />
              <PointValue label="Verification share" point={member.verificationShare} />
              <Value label="Keeper identity" value={member.identity} />
              <Value label="Transport key" value={member.transport} />
              <Value label="Peer id" value={member.peerId} />
            </div>
          ))}
        </Group>

        <Group title="Founding">
          <Value label="Key generation session" value={founding.session} />
          {founding.transcript ? (
            <Value label="Transcript hash" value={founding.transcript} />
          ) : null}
          {founding.deployTx ? (
            <Value label="Deployment transaction" value={founding.deployTx} />
          ) : null}
          <Plain label="Members" value={formatCount(committee.members.length)} />
        </Group>
      </div>
    </details>
  );
}

function Group({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center justify-between gap-3">
        <h3 className="type-overline text-fg-subtle">{title}</h3>
        {aside}
      </header>
      <dl className="flex flex-col gap-2.5">{children}</dl>
    </section>
  );
}

function Value({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 @2xl:grid-cols-[180px_minmax(0,1fr)] @2xl:gap-3">
      <dt className="type-label-s text-fg-subtle">{label}</dt>
      <dd className="flex items-start gap-1.5">
        <code className="min-w-0 type-mono-s text-fg [overflow-wrap:anywhere]">{value}</code>
        <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
      </dd>
    </div>
  );
}

function Plain({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 @2xl:grid-cols-[180px_minmax(0,1fr)] @2xl:gap-3">
      <dt className="type-label-s text-fg-subtle">{label}</dt>
      <dd className="type-body-s text-fg">{value}</dd>
    </div>
  );
}

function PointValue({ label, point }: { label: string; point: Point }) {
  return <Value label={label} value={`${point.x},${point.y}`} />;
}
