import { Fragment, type ReactNode } from "react";

import { Logo } from "@ome-labs/brand/web";
import { Icon } from "@ome-labs/icons/web";
import { CheckRow, StatusBadge } from "@ome-labs/ui-web";

import { Reveal } from "../layout/reveal.tsx";

function AppCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article
      aria-label={title}
      className="flex w-full flex-col gap-3 rounded-[22px] bg-surface p-5 text-fg shadow-3 lg:w-[368px] lg:self-stretch"
    >
      {children}
    </article>
  );
}

function Amount({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] bg-sunken p-3.5">
      <span className="type-caption text-fg-subtle">{label}</span>
      <span className="type-heading-l">{value}</span>
    </div>
  );
}

const steps = [
  <AppCard key="request" title="An Aztec app">
    <div className="flex items-center justify-between">
      <span className="type-heading-m">Lagoon Swap</span>
      <span className="rounded-full bg-sunken px-2 py-0.5 type-label-s text-fg-muted">
        an Aztec app
      </span>
    </div>
    <Amount label="You pay" value="500 USDC" />
    <Amount label="You receive" value="0.14 ETH" />
    <span className="mt-auto flex h-11 items-center justify-center gap-2 rounded-xl bg-accent type-label-m text-on-accent">
      <Logo variant="mark" tone="dark" title="" className="h-4 w-auto" />
      Propose to Treasury
    </span>
  </AppCard>,
  <AppCard key="proposal" title="The proposal in Ome">
    <div className="flex items-center justify-between">
      <span className="type-overline text-fg-subtle">New proposal</span>
      <StatusBadge kind="proposal" status="collecting" />
    </div>
    <span className="type-heading-l">Swap on Lagoon Swap</span>
    <p className="type-body-s text-fg-muted">
      Requested by an app. The full call is shown to every member before they sign.
    </p>
    <code className="rounded-xl bg-brand-night p-3 font-mono text-[11.5px] text-[#c9ceda]">
      swap(500 USDC → ETH, min 0.139)
    </code>
    <div className="mt-auto flex items-center gap-1.5">
      <span className="size-[22px] rounded-full bg-brand-sun" />
      <span className="size-[22px] rounded-full bg-sunken" />
      <span className="size-[22px] rounded-full bg-sunken" />
      <span className="ml-1 type-caption text-fg-muted">waiting for approvals</span>
    </div>
  </AppCard>,
  <AppCard key="done" title="Done">
    <div className="flex items-center justify-between">
      <span className="type-overline text-fg-subtle">Executed</span>
      <StatusBadge kind="proposal" status="executed" />
    </div>
    <span className="type-heading-l">The app gets its answer.</span>
    <p className="type-body-s text-fg-muted">
      Enough members approved on their own devices. Any member executed. The chain saw a proof.
    </p>
    <ul className="mt-auto">
      <CheckRow state="pass" label="Approved by Alice and Bob" className="py-1" />
      <CheckRow state="pass" label="Proof verified" className="py-1" />
      <CheckRow state="pass" label="Swap settled privately" className="py-1" />
    </ul>
  </AppCard>,
];

/** An Aztec app asking the vault for a swap: the request, the proposal it becomes, and the result. */
export function AppFlow() {
  return (
    <ol className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-1.5 lg:flex-row lg:items-stretch lg:justify-center lg:gap-3">
      {steps.map((card, index) => (
        <Fragment key={card.key}>
          {index > 0 ? (
            <li aria-hidden className="grid h-7 place-items-center text-white/80 lg:h-auto lg:w-9">
              <Icon name="arrow-right" size={20} className="max-lg:rotate-90" />
            </li>
          ) : null}
          <li className="flex w-full max-w-[420px] lg:w-auto">
            <Reveal delay={index * 100} className="flex w-full">
              {card}
            </Reveal>
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
