import { Logo } from "@ome-labs/brand/web";
import { Icon } from "@ome-labs/icons/web";
import { CheckRow } from "@ome-labs/ui-web";

import { PhoneFrame } from "./phone-frame.tsx";

const rows = [
  ["Approvals", "1 so far"],
  ["Expires", "tomorrow, 18:00"],
  ["Fee", "sponsored"],
] as const;

/** The phone app as it's planned: a payment waiting for this member, checked on the phone, approved with Face ID. */
export function PhoneApproval({ className }: { className?: string | undefined }) {
  return (
    <PhoneFrame className={className}>
      <figure
        className="flex flex-col gap-3.5 px-[18px] pt-1.5"
        aria-label="The planned phone app, approving a payment"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Logo variant="mark" tone="light" title="" className="h-5 w-auto" />
            <span className="type-heading-m">Treasury</span>
          </span>
          <span className="rounded-full bg-warning-subtle px-2 py-0.5 type-label-s text-warning">
            Needs you
          </span>
        </div>

        <div className="flex flex-col gap-3 rounded-[18px] border border-line-subtle bg-surface p-4 shadow-1">
          <span className="type-overline text-fg-subtle">Payment · proposed by Charlie</span>
          <span className="font-display text-[40px] leading-none">250 USDC</span>
          <span className="type-body-s text-fg-muted">to dave.aztec · “Audit deposit”</span>
          <dl className="flex flex-col">
            {rows.map(([term, value]) => (
              <div key={term} className="flex justify-between border-b border-line-subtle py-2.5">
                <dt className="type-body-s text-fg-muted">{term}</dt>
                <dd className="type-mono-s">{value}</dd>
              </div>
            ))}
          </dl>
          <ul>
            <CheckRow state="pass" label="Rebuilt and checked on this phone" className="py-1" />
            <CheckRow state="pass" label="Matches what Charlie proposed" className="py-1" />
          </ul>
        </div>

        <span className="flex h-[50px] items-center justify-center gap-2 rounded-2xl bg-accent text-[15px] font-medium text-on-accent">
          <Icon name="fingerprint" size={20} />
          Approve with Face ID
        </span>
        <span className="text-center text-sm font-medium text-danger">Reject</span>
      </figure>
    </PhoneFrame>
  );
}
