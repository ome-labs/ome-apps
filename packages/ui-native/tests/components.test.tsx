import type { Review } from "@ome-labs/api";
import { omet, proposals, treasury } from "@ome-labs/format/sample";
import { PortalHost } from "@rn-primitives/portal";
import { fireEvent, render, screen } from "@testing-library/react-native";
import * as Clipboard from "expo-clipboard";

import { Button } from "../src/actions/button.tsx";
import { TypeToConfirm } from "../src/overlays/type-to-confirm.tsx";
import { ReviewPanel } from "../src/review/review-panel.tsx";
import { Amount } from "../src/values/amount.tsx";
import { CopyButton } from "../src/values/copy-button.tsx";

const review: Review = {
  proposal: { ...proposals.auditDeposit, status: "collecting" },
  vaultName: "Treasury",
  myName: "Bob",
  checks: {
    rebuilt: true,
    outerHash: "0x00",
    configCurrent: true,
    notExpired: true,
    failure: null,
  },
  action: "transfer 250 OMET (250000000000000000000 base units)",
  recipient: null,
  simulation: { ok: true, gas: null, error: null },
  signs: { message: treasury.address, formula: "Poseidon2(…)" },
  rejects: { message: treasury.address, formula: "Poseidon2(…)" },
};

describe("Button", () => {
  test("presses, and doesn't when disabled", async () => {
    const onPress = jest.fn();
    await render(
      <>
        <Button onPress={onPress}>Approve</Button>
        <Button onPress={onPress} disabled>
          Execute
        </Button>
      </>,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Approve" }));
    await fireEvent.press(screen.getByRole("button", { name: "Execute" }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Execute" })).toBeDisabled();
  });
});

test("Amount shows every digit, never rounded", async () => {
  await render(<Amount amount="340282366920938463463374607431768211455" token={omet} baseUnits />);

  expect(screen.getByText("340,282,366,920,938,463,463.374607431768211455")).toBeOnTheScreen();
  expect(screen.getByText("340282366920938463463374607431768211455 base units")).toBeOnTheScreen();
});

test("CopyButton copies the whole value and says so", async () => {
  const copy = jest.spyOn(Clipboard, "setStringAsync").mockResolvedValue(true);
  await render(<CopyButton value={treasury.address} label="Copy address" />);

  await fireEvent.press(screen.getByRole("button", { name: "Copy address" }));

  expect(await screen.findByRole("button", { name: "Copied" })).toBeOnTheScreen();
  expect(copy).toHaveBeenCalledWith(treasury.address);
});

test("TypeToConfirm enables its button only for the exact phrase", async () => {
  const onConfirm = jest.fn();
  await render(
    <>
      <TypeToConfirm
        open
        onOpenChange={jest.fn()}
        title="Remove Carol?"
        description="…"
        phrase="Treasury"
        confirmLabel="Remove member"
        onConfirm={onConfirm}
      />
      <PortalHost />
    </>,
  );

  const field = screen.getByLabelText("Type Treasury to confirm");
  const confirm = screen.getByRole("button", { name: "Remove member" });

  await fireEvent.changeText(field, "treasury");
  expect(confirm).toBeDisabled();

  await fireEvent.changeText(field, "Treasury");
  await fireEvent.press(confirm);

  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test("ReviewPanel disables Approve when a check fails, but not Reject", async () => {
  const onReject = jest.fn();
  await render(
    <ReviewPanel
      review={{ ...review, checks: { ...review.checks, notExpired: false } }}
      onReject={onReject}
    />,
  );

  await fireEvent.press(screen.getByRole("button", { name: "Reject…" }));

  expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  expect(onReject).toHaveBeenCalledTimes(1);
});

test("ReviewPanel says when a vote's signature doesn't verify", async () => {
  const [bob] = review.proposal.approvals;
  const forged = { ...review.proposal, approvals: bob ? [{ ...bob, valid: false }] : [] };

  await render(<ReviewPanel review={{ ...review, proposal: forged }} />);

  expect(screen.getByText("signature doesn't verify")).toBeTruthy();
});
