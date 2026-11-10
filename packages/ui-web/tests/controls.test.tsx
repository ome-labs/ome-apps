import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Amount, Button, CopyButton, Dialog, ReviewPanel, TypeToConfirm } from "../src/index.ts";
import { omet, reviewOfAuditDeposit, treasury } from "./sample.ts";

describe("Button", () => {
  test("activates from the keyboard and not when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <>
        <Button onClick={onClick}>Approve</Button>
        <Button onClick={onClick} disabled>
          Execute
        </Button>
      </>,
    );

    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    await user.click(screen.getByRole("button", { name: "Execute" }));

    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

describe("CopyButton", () => {
  test("copies the whole value and says so", async () => {
    const user = userEvent.setup();
    render(<CopyButton value={treasury.address} label="Copy address" />);

    await user.click(screen.getByRole("button", { name: "Copy address" }));

    expect(await navigator.clipboard.readText()).toBe(treasury.address);
    expect(screen.getByRole("button", { name: "Copied" })).toBeDefined();
  });
});

describe("Dialog", () => {
  test("traps focus inside, closes on Escape and gives focus back", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title="Unlock signer" trigger={<Button>Unlock</Button>}>
        Body
      </Dialog>,
    );
    const trigger = screen.getByRole("button", { name: "Unlock" });

    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Unlock signer" });

    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");

    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });
});

describe("TypeToConfirm", () => {
  test("enables its button only for the exact phrase", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <TypeToConfirm
        open
        title="Remove Carol from Treasury?"
        description="…"
        phrase="Treasury"
        confirmLabel="Remove member"
        onConfirm={onConfirm}
      />,
    );
    const confirm = await screen.findByRole("button", { name: "Remove member" });
    const field = screen.getByRole("textbox", { name: "Type Treasury to confirm" });

    await user.type(field, "treasury");
    expect(
      confirm.hasAttribute("disabled") || confirm.getAttribute("aria-disabled") === "true",
    ).toBe(true);

    await user.clear(field);
    await user.type(field, "Treasury");
    await user.click(confirm);

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});

describe("Amount", () => {
  test("never rounds", () => {
    render(
      <>
        <Amount amount="1" token={omet} />
        <Amount amount="340282366920938463463374607431768211455" token={omet} baseUnits />
      </>,
    );

    expect(screen.getByText("0.000000000000000001")).toBeDefined();
    expect(screen.getByText("340,282,366,920,938,463,463.374607431768211455")).toBeDefined();
    expect(screen.getByText("340282366920938463463374607431768211455 base units")).toBeDefined();
  });
});

describe("ReviewPanel", () => {
  test("a failed check disables Approve but not Reject", async () => {
    const user = userEvent.setup();
    const onReject = vi.fn();
    const stale = {
      ...reviewOfAuditDeposit,
      checks: { ...reviewOfAuditDeposit.checks, configCurrent: false },
    };
    render(<ReviewPanel review={stale} onReject={onReject} />);

    await user.click(screen.getByRole("button", { name: "Reject…" }));

    expect(screen.getByRole("button", { name: "Approve" }).hasAttribute("disabled")).toBe(true);
    expect(onReject).toHaveBeenCalledOnce();
  });
});
