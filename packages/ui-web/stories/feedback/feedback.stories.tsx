import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../src/actions/button.tsx";
import { Banner } from "../../src/feedback/banner.tsx";
import { toast } from "../../src/feedback/toaster.tsx";

const meta = { title: "Feedback/Banners and toasts" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

export const Banners: Story = {
  render: () => (
    <div className="flex max-w-[760px] flex-col gap-3">
      <Banner kind="alarm" action={{ label: "Review", onClick: noop }}>
        This vault's on-chain config names a committee your keeper can't verify. It won't act until
        you look.
      </Banner>
      <Banner kind="alarm">A transaction from this vault matches no approved proposal.</Banner>
      <Banner kind="warning">Member 3's keeper sent invalid read shares.</Banner>
      <Banner kind="info">
        A membership change didn't complete; its pending share was discarded.
      </Banner>
      <Banner kind="success">New members active (epoch 2).</Banner>
    </div>
  ),
};

export const Toasts: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button onClick={() => toast.success("New members active (epoch 2).")}>Success</Button>
      <Button
        onClick={() =>
          toast.error("Proving failed.", { action: { label: "Show logs", onClick: noop } })
        }
      >
        Error
      </Button>
      <Button onClick={() => toast.info("Proposal 335c is ready.")}>Info</Button>
    </div>
  ),
};
