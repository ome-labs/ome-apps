import { MemberAvatar, TokenMonogram } from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";
import { omet, peers } from "../sample/story.ts";

export function Members() {
  return (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          {[...peers, { index: 4, name: "Dave" }].map((member) => (
            <span key={member.index} className="flex items-center gap-1.5 type-label-m">
              <MemberAvatar name={member.name} index={member.index} size={size} />
              {member.name}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Tokens() {
  return (
    <div className="flex items-center gap-3">
      <TokenMonogram token={omet} size="sm" />
      <TokenMonogram token={omet} size="md" />
      <TokenMonogram token={omet} size="lg" />
      <TokenMonogram token={{ symbol: "JADE" }} size="lg" />
    </div>
  );
}

export const identity: ExampleSet = {
  title: "Identity",
  description:
    "Members are initials on a colour picked by their slot; tokens are monograms of their symbol, never a logo.",
  examples: [
    { name: "Members", title: "Member avatars", Component: Members },
    { name: "Tokens", title: "Token monograms", Component: Tokens },
  ],
};
