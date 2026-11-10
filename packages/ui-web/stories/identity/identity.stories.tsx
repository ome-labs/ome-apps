import type { Meta, StoryObj } from "@storybook/react-vite";

import { MemberAvatar } from "../../src/identity/member-avatar.tsx";
import { TokenMonogram } from "../../src/identity/token-monogram.tsx";
import { omet, peers } from "../sample.ts";

const meta = { title: "Identity/Avatars and monograms" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Members: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          {[...peers, { index: 4, name: "Dave" }].map((member) => (
            <span key={member.index} className="flex items-center gap-1.5 type-label-m">
              <MemberAvatar name={member.name} index={member.index} size={size} />
              {member.name}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Tokens: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <TokenMonogram token={omet} size="sm" />
      <TokenMonogram token={omet} size="md" />
      <TokenMonogram token={omet} size="lg" />
      <TokenMonogram token={{ symbol: "JADE" }} size="lg" />
    </div>
  ),
};
