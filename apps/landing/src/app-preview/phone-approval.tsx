import { Logo } from "@ome-labs/brand/web";
import { Icon } from "@ome-labs/icons/web";
import { Button, CheckRow, cn, StatusBadge, ThresholdChip } from "@ome-labs/ui-web";

import { BrandImage } from "../art/brand-image.tsx";
import { people } from "../vault/people.ts";
import { PhoneFrame } from "./phone-frame.tsx";

const details = [
  ["To", "0xf461…688d"],
  ["Expires", "in 22h 29m"],
  ["Fee", "sponsored"],
] as const;

const approvers = [
  { who: "alice", approved: true },
  { who: "bob", approved: false },
  { who: "charlie", approved: false },
] as const;

/**
 * The phone app as it's planned, built from the desktop app's own components so the two read as one product: a
 * payment waiting for this member, rebuilt and checked on the phone, approved with Face ID. A picture, so it's
 * inert: its buttons can't be focused or pressed.
 */
export function PhoneApproval({ className }: { className?: string | undefined }) {
  return (
    <PhoneFrame className={className}>
      <figure
        inert
        aria-label="The planned phone app, approving a payment"
        className="flex flex-1 flex-col gap-4 px-4 pt-2 pb-7"
      >
        <header className="flex flex-col gap-2.5">
          <span className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-night">
              <Logo variant="mark" tone="dark" title="" className="h-4 w-auto" />
            </span>
            <span className="type-heading-m">Treasury</span>
          </span>
          <span className="flex gap-1.5">
            <ThresholdChip kind="spend" threshold={2} members={3} />
            <ThresholdChip kind="read" threshold={2} members={3} />
          </span>
        </header>

        <section className="flex flex-col gap-2">
          <h3 className="type-label-m text-fg-muted">Needs you</h3>
          <div className="flex flex-col gap-3 rounded-xl border border-line-subtle bg-surface p-3.5 shadow-1">
            <div className="flex items-center justify-between">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-subtle text-accent">
                <Icon name="send" size={16} />
              </span>
              <StatusBadge kind="proposal" status="collecting" />
            </div>
            <div className="flex flex-col">
              <span className="type-heading-m">Transfer 250 USDC</span>
              <span className="type-body-s text-fg-muted">from Charlie · “Audit deposit”</span>
            </div>

            <dl className="flex flex-col border-t border-line-subtle">
              {details.map(([term, value]) => (
                <div
                  key={term}
                  className="flex justify-between border-b border-line-subtle py-2 last:border-b-0"
                >
                  <dt className="type-body-s text-fg-muted">{term}</dt>
                  <dd className="type-mono-s">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex items-center justify-between rounded-lg bg-sunken px-2.5 py-2">
              <span className="flex gap-1">
                {approvers.map((member) => (
                  <BrandImage
                    key={member.who}
                    avatar={people[member.who].avatar}
                    className={cn(
                      "size-7 rounded-full ring-2 ring-surface",
                      !member.approved && "opacity-35 grayscale",
                    )}
                  />
                ))}
              </span>
              <span className="type-label-s text-fg-muted">1 of 2 approvals</span>
            </div>
          </div>
        </section>

        <ul className="flex flex-col">
          <CheckRow state="pass" label="Rebuilt and checked on this phone" className="py-1" />
          <CheckRow state="pass" label="Matches what Charlie proposed" className="py-1" />
        </ul>

        <div className="mt-auto grid grid-cols-[1fr_1.6fr] gap-2">
          <Button variant="secondary" size="lg">
            Reject
          </Button>
          <Button variant="primary" size="lg" icon="fingerprint">
            Approve
          </Button>
        </div>
      </figure>
    </PhoneFrame>
  );
}
