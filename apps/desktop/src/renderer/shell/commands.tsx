import { useCallback, useMemo, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { VaultSummary } from "@ome-labs/api";
import { CommandMenu, type CommandGroup, Dialog, KbdCombo } from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";
import { APP_PAGES, VAULT_PAGES } from "../routes/pages.ts";
import { keycaps, type Shortcut, useShortcuts } from "./keys.ts";

/** Pages the menu lists: proposal pages need an id, so they're reached from the proposals list. */
const MENU_VAULT_PAGES = VAULT_PAGES.filter((page) => !page.path.includes("$"));

/**
 * ⌘K and the app's other shortcuts, and the sheet that lists them (`?`). A proposal's own keys (approve, reject,
 * execute) belong to its page.
 */
export function Commands({
  vaults,
  current,
  onUnlock,
}: {
  vaults: VaultSummary[];
  current: string | undefined;
  onUnlock: () => void;
}) {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [sheet, setSheet] = useState(false);

  const vaultPath = useCallback(
    (vault: string, path: string) =>
      path === "/" ? `/vaults/${vault}` : `/vaults/${vault}${path}`,
    [],
  );

  const shortcuts = useMemo<Shortcut[]>(
    () => [
      {
        key: "k",
        mod: true,
        label: "Search pages and actions",
        run: () => setMenu((open) => !open),
      },
      ...(current
        ? [
            {
              key: "n",
              mod: true,
              label: "New payment",
              run: (): void => void navigate({ to: vaultPath(current, "/new") }),
            },
          ]
        : []),
      {
        key: "l",
        mod: true,
        label: "Lock the signer",
        run: (): void => void callOme("signer.lock", {}),
      },
      {
        key: ",",
        mod: true,
        label: "Settings",
        run: (): void => void navigate({ to: "/settings" }),
      },
      { key: "?", mod: false, label: "Keyboard shortcuts", run: () => setSheet(true) },
    ],
    [current, navigate, vaultPath],
  );
  useShortcuts(shortcuts);

  const groups = useMemo<CommandGroup[]>(() => {
    const vault = vaults.find((v) => v.address === current);
    const shortcutOf = (label: string) => {
      const found = shortcuts.find((shortcut) => shortcut.label === label);
      return found ? keycaps(found) : undefined;
    };
    const go = (to: string) => (): void => void navigate({ to });

    return [
      ...(vault
        ? [
            {
              title: "Go to",
              items: MENU_VAULT_PAGES.map((page) => ({
                id: `vault${page.path}`,
                label: page.title,
                hint: vault.name,
                icon: page.icon,
                onSelect: go(vaultPath(vault.address, page.path)),
              })),
            },
          ]
        : []),
      {
        title: "Actions",
        items: [
          ...(vault
            ? [
                {
                  id: "new-payment",
                  label: "New payment",
                  hint: vault.name,
                  icon: "send" as const,
                  keywords: ["send", "transfer", "proposal"],
                  shortcut: shortcutOf("New payment"),
                  onSelect: go(vaultPath(vault.address, "/new")),
                },
              ]
            : []),
          { id: "unlock", label: "Unlock the signer", icon: "unlock" as const, onSelect: onUnlock },
          {
            id: "lock",
            label: "Lock the signer",
            icon: "lock" as const,
            shortcut: shortcutOf("Lock the signer"),
            onSelect: (): void => void callOme("signer.lock", {}),
          },
          {
            id: "shortcuts",
            label: "Keyboard shortcuts",
            icon: "command" as const,
            shortcut: shortcutOf("Keyboard shortcuts"),
            onSelect: () => setSheet(true),
          },
        ],
      },
      ...(vaults.length > 1
        ? [
            {
              title: "Switch vault",
              items: vaults
                .filter((v) => v.address !== current)
                .map((v) => ({
                  id: `switch-${v.address}`,
                  label: v.name,
                  hint: `${v.threshold} of ${v.members}`,
                  icon: "vault" as const,
                  onSelect: go(vaultPath(v.address, "/")),
                })),
            },
          ]
        : []),
      {
        title: "App",
        items: APP_PAGES.map((page) => ({
          id: `app${page.path}`,
          label: page.title,
          icon: page.icon,
          shortcut: page.path === "/settings" ? shortcutOf("Settings") : undefined,
          onSelect: go(page.path),
        })),
      },
    ];
  }, [vaults, current, shortcuts, navigate, vaultPath, onUnlock]);

  return (
    <>
      <CommandMenu open={menu} onOpenChange={setMenu} groups={groups} />
      <Dialog title="Keyboard shortcuts" open={sheet} onOpenChange={setSheet}>
        <dl className="grid gap-3">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.label} className="flex items-center justify-between gap-6">
              <dt className="type-body-m text-fg">{shortcut.label}</dt>
              <dd>
                <KbdCombo keys={keycaps(shortcut)} />
              </dd>
            </div>
          ))}
        </dl>
      </Dialog>
    </>
  );
}
