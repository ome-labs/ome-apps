import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { CommandMenu, Kbd, KbdCombo, UnlockSheet, type CommandGroup } from "../src/index.ts";

/** Overlays place focus a frame after they open; typing before then would land on the body. */
async function focused(element: HTMLElement) {
  await vi.waitFor(() => expect(document.activeElement).toBe(element));
}

function commandGroups() {
  const run = { proposals: vi.fn(), transfer: vi.fn(), lock: vi.fn() };
  const groups: CommandGroup[] = [
    {
      title: "Go to",
      items: [{ id: "proposals", label: "Proposals", hint: "Treasury", onSelect: run.proposals }],
    },
    {
      title: "Actions",
      items: [
        {
          id: "transfer",
          label: "New transfer",
          keywords: ["send", "pay"],
          shortcut: ["⌘", "N"],
          onSelect: run.transfer,
        },
        { id: "lock", label: "Lock signer", onSelect: run.lock },
      ],
    },
  ];

  return { run, groups };
}

describe("Kbd", () => {
  test("shows each key of a combo and names the modifier glyphs", () => {
    render(
      <>
        <Kbd>esc</Kbd>
        <KbdCombo keys={["⌘", "K"]} />
      </>,
    );

    expect(screen.getByText("esc")).toBeDefined();
    expect(screen.getByText("⌘").getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("Command")).toBeDefined();
    expect(screen.getByText("K")).toBeDefined();
  });
});

describe("CommandMenu", () => {
  test("filters by every word across label, hint and keywords, hiding empty groups", async () => {
    const user = userEvent.setup();
    const { groups } = commandGroups();
    render(<CommandMenu open onOpenChange={() => {}} groups={groups} />);
    const search = await screen.findByRole("combobox", { name: "Search commands" });

    await focused(search);

    await user.type(search, "PAY new");

    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "New transfer⌘CommandN",
    ]);
    expect(screen.queryByText("Go to")).toBeNull();

    await user.clear(search);
    await user.type(search, "treasury");

    expect(screen.getByRole("option", { name: /Proposals/ })).toBeDefined();

    await user.type(search, " zzz");

    expect(screen.queryAllByRole("option")).toEqual([]);
    expect(screen.getByText(/Nothing matches/)).toBeDefined();
  });

  test("arrow keys move the active item, wrapping, and Enter runs it, then closes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { run, groups } = commandGroups();
    render(<CommandMenu open onOpenChange={onOpenChange} groups={groups} />);
    const search = await screen.findByRole("combobox", { name: "Search commands" });
    await focused(search);

    const active = () =>
      document.getElementById(search.getAttribute("aria-activedescendant") ?? "")?.textContent;

    // The first item starts active; Up wraps to the last, and Down past the last wraps to the first.
    expect(active()).toMatch(/Proposals/);
    await user.keyboard("{ArrowUp}");
    expect(active()).toMatch(/Lock signer/);
    await user.keyboard("{ArrowDown}");
    expect(active()).toMatch(/Proposals/);
    await user.keyboard("{ArrowDown}");

    expect(active()).toMatch(/New transfer/);

    await user.keyboard("{Enter}");

    expect(run.transfer).toHaveBeenCalledOnce();
    expect(run.proposals).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("UnlockSheet", () => {
  test("submits the passphrase with the chosen duration, and not before one is typed", async () => {
    const user = userEvent.setup();
    const onUnlock = vi.fn();
    render(<UnlockSheet open onOpenChange={() => {}} onUnlock={onUnlock} />);
    const field = await screen.findByLabelText("Passphrase");
    const unlock = screen.getByRole("button", { name: "Unlock" });

    await focused(field);
    expect(unlock.hasAttribute("disabled")).toBe(true);

    await user.keyboard("{Enter}");
    expect(onUnlock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "1 h" }));
    await user.type(field, "correct horse{Enter}");

    expect(onUnlock).toHaveBeenCalledExactlyOnceWith({
      method: "passphrase",
      passphrase: "correct horse",
      ttlSecs: 3600,
    });
  });

  test("Touch ID unlocks with the default duration and no passphrase", async () => {
    const user = userEvent.setup();
    const onUnlock = vi.fn();
    render(<UnlockSheet open onOpenChange={() => {}} onUnlock={onUnlock} touchId />);

    await user.click(await screen.findByRole("button", { name: "Use Touch ID" }));

    expect(onUnlock).toHaveBeenCalledExactlyOnceWith({ method: "touchId", ttlSecs: 900 });
  });

  test("leaves out durations above the ceiling", async () => {
    render(<UnlockSheet open onOpenChange={() => {}} onUnlock={() => {}} maxDuration={900} />);

    expect(await screen.findByRole("button", { name: "15 min" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "1 h" })).toBeNull();
  });
});
